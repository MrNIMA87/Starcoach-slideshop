import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { domToBlob } from 'modern-screenshot';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Format, Project } from '../types';
import { SlideRenderer } from '../components/templates/SlideRenderer';
import { getTemplate } from '../components/templates/registry';
import { resolveTheme, themeHeight } from './theme';
import { parseProject, serializeProject } from './project';

const FONT_CSS_FALLBACK_URL =
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap';

/* ----------------------------- font embedding ----------------------------- */

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

let fontCssPromise: Promise<string> | null = null;

/**
 * Download the Google Fonts stylesheet once and inline every font file as a base64 data URL.
 * The result is handed to modern-screenshot (`font.cssText`) so the exported PNG never depends on
 * the network or on the font being installed on the viewer's machine.
 */
export function getEmbeddedFontCss(): Promise<string> {
  if (!fontCssPromise) {
    fontCssPromise = (async () => {
      const link = document.getElementById('vazirmatn-css') as HTMLLinkElement | null;
      const href = link?.href || FONT_CSS_FALLBACK_URL;
      const css = await (await fetch(href)).text();
      const urls = [...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map((m) => (m[1] ?? '').replace(/['"]/g, '')))];
      const map = new Map<string, string>();
      await Promise.all(
        urls.map(async (u) => {
          const res = await fetch(u);
          map.set(u, await blobToDataUrl(await res.blob()));
        }),
      );
      return css.replace(/url\(([^)]+)\)/g, (_m, g: string) => {
        const u = g.replace(/['"]/g, '');
        return `url(${map.get(u) ?? u})`;
      });
    })().catch((err) => {
      console.warn('[exporter] font embedding failed, falling back to default behaviour', err);
      fontCssPromise = null;
      return '';
    });
  }
  return fontCssPromise;
}

async function ensureFontsLoaded() {
  if (!document.fonts) return;
  const weights = [300, 400, 500, 600, 700, 800, 900];
  await Promise.all(weights.map((w) => document.fonts.load(`${w} 40px Vazirmatn`, 'ایران‌پوش ۱۲۳ Aa').catch(() => [])));
  await document.fonts.ready;
}

/* ----------------------------- rendering ----------------------------- */

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

async function waitForImages(host: HTMLElement) {
  const imgs = [...host.querySelectorAll('img')];
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? img.decode().catch(() => undefined)
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
    ),
  );
}

/** Render one slide off-screen at its native size and return a PNG blob. */
export async function renderSlideToBlob(
  project: Project,
  slideId: string,
  format: Format,
  pixelRatio: number,
): Promise<Blob> {
  const index = project.slides.findIndex((s) => s.id === slideId);
  const slide = project.slides[index];
  if (!slide) throw new Error('اسلاید پیدا نشد.');
  const theme = resolveTheme(project.brandKit);
  const width = theme.canvas.width;
  const height = themeHeight(theme, format);

  const host = document.createElement('div');
  host.setAttribute('data-export-host', '');
  Object.assign(host.style, {
    position: 'fixed',
    left: '-30000px',
    top: '0',
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: 'none',
    zIndex: '-1',
  });
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    flushSync(() => {
      root.render(
        createElement(SlideRenderer, {
          project,
          slide,
          index,
          total: project.slides.length,
          format,
          mode: 'export',
        }),
      );
    });

    const fontCss = await getEmbeddedFontCss();
    await ensureFontsLoaded();
    await waitForImages(host);
    // Let ResizeObserver-driven text fitting settle (AutoFitText) before capturing.
    for (let i = 0; i < 4; i++) await nextFrame();

    const node = host.querySelector<HTMLElement>('[data-slide-root]');
    if (!node) throw new Error('رندر اسلاید ناموفق بود.');

    return await domToBlob(node, {
      type: 'image/png',
      scale: pixelRatio,
      width,
      height,
      font: fontCss ? { cssText: fontCss } : undefined,
    });
  } finally {
    root.unmount();
    host.remove();
  }
}

/* ----------------------------- public export API ----------------------------- */

export interface ExportOptions {
  formats: Format[];
  /** 2 = 2160 × 2700 / 2160 × 2160 (default), 1 = exact 1080 px Instagram size. */
  pixelRatio: 1 | 2;
  scope: 'current' | 'all';
  currentSlideId: string;
  onProgress?: (done: number, total: number) => void;
}

export const FORMAT_FOLDER: Record<Format, (w: number, h: number) => string> = {
  portrait: (w, h) => `portrait-${w}x${h}`,
  square: (w, h) => `square-${w}x${h}`,
};

export function slideFileName(project: Project, index: number): string {
  const slide = project.slides[index];
  const slug = slide ? getTemplate(slide.template).meta.fileSlug : 'slide';
  return `${String(index + 1).padStart(2, '0')}-${slug}.png`;
}

function safeName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '-').trim().replace(/\s+/g, '-') || 'iranpoosh-carousel';
}

/** Export PNGs. A single image is downloaded directly; anything else becomes an ordered ZIP. */
export async function exportSlides(project: Project, opts: ExportOptions): Promise<void> {
  const theme = resolveTheme(project.brandKit);
  const indices =
    opts.scope === 'current'
      ? [Math.max(0, project.slides.findIndex((s) => s.id === opts.currentSlideId))]
      : project.slides.map((_, i) => i);
  const total = indices.length * opts.formats.length;
  let done = 0;
  opts.onProgress?.(0, total);

  const files: { path: string; blob: Blob }[] = [];
  for (const format of opts.formats) {
    const folder = FORMAT_FOLDER[format](theme.canvas.width, themeHeight(theme, format));
    for (const i of indices) {
      const slide = project.slides[i];
      if (!slide) continue;
      const blob = await renderSlideToBlob(project, slide.id, format, opts.pixelRatio);
      const name = slideFileName(project, i);
      files.push({ path: opts.formats.length > 1 ? `${folder}/${name}` : name, blob });
      opts.onProgress?.(++done, total);
    }
  }

  if (files.length === 1 && files[0]) {
    const f = files[0];
    saveAs(f.blob, f.path.split('/').pop() ?? 'slide.png');
    return;
  }
  const zip = new JSZip();
  for (const f of files) zip.file(f.path, f.blob);
  const out = await zip.generateAsync({ type: 'blob' });
  saveAs(out, `${safeName(project.name)}.zip`);
}

/* ----------------------------- project JSON ----------------------------- */

export function downloadProjectJson(project: Project): void {
  const blob = new Blob([serializeProject(project)], { type: 'application/json;charset=utf-8' });
  saveAs(blob, `${safeName(project.name)}.project.json`);
}

export async function readProjectFile(file: File): Promise<Project> {
  const text = await file.text();
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('فایل انتخابی JSON معتبر نیست.');
  }
  return parseProject(raw);
}
