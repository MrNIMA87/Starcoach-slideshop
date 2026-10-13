import defaultProjectJson from '../data/defaultProject.json';
import type { Asset, ImageRef, Project, Slide, SlideContent, TemplateId } from '../types';
import { TEMPLATES, TEMPLATE_ORDER } from '../components/templates/registry';
import { DEFAULT_THEME_ID } from '../tokens';

export const STORAGE_KEY = 'iranpoosh-slide-studio:project:v1';
export const CURRENT_SCHEMA = 1;

/** Short unique id (slide ids, asset ids, custom theme ids). */
export function uid(prefix = 'id'): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}-${rnd}`;
}

export function getDefaultProject(): Project {
  return structuredClone(defaultProjectJson) as unknown as Project;
}

export function createSlide(template: TemplateId): Slide {
  const def = TEMPLATES[template].meta.defaults;
  return { id: uid('s'), template, content: structuredClone(def), overrides: {} };
}

/* ----------------------------- validation / migration ----------------------------- */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Validate + migrate an arbitrary JSON value into a Project.
 * Throws a readable (Persian) Error if the file is not a usable project.
 * Unknown / missing fields are repaired with defaults so hand-edited files keep working.
 */
export function parseProject(raw: unknown): Project {
  if (!isRecord(raw)) throw new Error('فایل پروژه معتبر نیست (ساختار JSON اشتباه است).');
  const version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 1;
  if (version > CURRENT_SCHEMA) throw new Error('این پروژه با نسخه جدیدتری از استودیو ساخته شده است.');
  if (!Array.isArray(raw.slides) || raw.slides.length === 0) throw new Error('پروژه هیچ اسلایدی ندارد.');

  const base = getDefaultProject();
  const brandRaw = isRecord(raw.brandKit) ? raw.brandKit : {};
  const brandKit = {
    ...base.brandKit,
    ...brandRaw,
    tokenOverrides: isRecord(brandRaw.tokenOverrides) ? brandRaw.tokenOverrides : {},
    customThemes: Array.isArray(brandRaw.customThemes) ? brandRaw.customThemes : [],
    themeId: typeof brandRaw.themeId === 'string' ? brandRaw.themeId : DEFAULT_THEME_ID,
    logoAssetId: typeof brandRaw.logoAssetId === 'string' ? brandRaw.logoAssetId : null,
  } as Project['brandKit'];

  const assets: Record<string, Asset> = {};
  if (isRecord(raw.assets)) {
    for (const [id, a] of Object.entries(raw.assets)) {
      if (isRecord(a) && typeof a.dataUrl === 'string') {
        assets[id] = {
          name: typeof a.name === 'string' ? a.name : id,
          dataUrl: a.dataUrl,
          width: typeof a.width === 'number' ? a.width : 0,
          height: typeof a.height === 'number' ? a.height : 0,
        };
      }
    }
  }

  const seen = new Set<string>();
  const slides: Slide[] = (raw.slides as unknown[]).map((s, i) => {
    if (!isRecord(s)) throw new Error(`اسلاید شماره ${i + 1} معتبر نیست.`);
    const template = (TEMPLATE_ORDER as string[]).includes(String(s.template)) ? (s.template as TemplateId) : 'cover';
    let id = typeof s.id === 'string' && s.id ? s.id : uid('s');
    if (seen.has(id)) id = uid('s');
    seen.add(id);
    const content = (isRecord(s.content) ? s.content : {}) as SlideContent;
    // Drop image refs whose asset is missing so templates show the placeholder instead of a broken image.
    const images: Record<string, ImageRef> = {};
    if (isRecord(content.images)) {
      for (const [slot, ref] of Object.entries(content.images)) {
        if (isRecord(ref) && typeof ref.assetId === 'string' && assets[ref.assetId]) {
          images[slot] = {
            assetId: ref.assetId,
            fx: typeof ref.fx === 'number' ? ref.fx : 50,
            fy: typeof ref.fy === 'number' ? ref.fy : 50,
            zoom: typeof ref.zoom === 'number' ? ref.zoom : 1,
          };
        }
      }
    }
    return {
      id,
      template,
      content: { ...content, images },
      overrides: isRecord(s.overrides) ? (s.overrides as Slide['overrides']) : {},
    };
  });

  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    name: typeof raw.name === 'string' ? raw.name : 'پروژه بدون نام',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : now,
    brandKit,
    assets,
    slides,
  };
}

/** Remove assets that no slide (or the brand logo) references any more. */
export function pruneAssets(project: Project): Project {
  const used = new Set<string>();
  if (project.brandKit.logoAssetId) used.add(project.brandKit.logoAssetId);
  for (const s of project.slides) {
    for (const ref of Object.values(s.content.images ?? {})) used.add(ref.assetId);
  }
  const assets: Record<string, Asset> = {};
  for (const [id, a] of Object.entries(project.assets)) if (used.has(id)) assets[id] = a;
  return { ...project, assets };
}

/* ----------------------------- persistence ----------------------------- */

export function loadSavedProject(): Project | null {
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (!text) return null;
    return parseProject(JSON.parse(text));
  } catch {
    return null;
  }
}

export type SaveResult = 'ok' | 'without-images' | 'failed';

/** Save to localStorage. If the quota is exceeded, retry without image data and report it. */
export function saveProject(project: Project): SaveResult {
  const pruned = pruneAssets(project);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    return 'ok';
  } catch {
    try {
      const stripped: Project = {
        ...pruned,
        assets: {},
        slides: pruned.slides.map((s) => ({ ...s, content: { ...s.content, images: {} } })),
        brandKit: { ...pruned.brandKit, logoAssetId: null },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
      return 'without-images';
    } catch {
      return 'failed';
    }
  }
}

export function serializeProject(project: Project): string {
  return JSON.stringify(pruneAssets({ ...project, updatedAt: new Date().toISOString() }), null, 2);
}
