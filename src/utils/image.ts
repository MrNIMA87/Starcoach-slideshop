import type { Asset } from '../types';

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('خواندن فایل ممکن نشد.'));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('این فایل تصویر معتبری نیست. از JPG، PNG یا WebP استفاده کنید.'));
    img.src = src;
  });
}

/**
 * Convert an uploaded file into a project Asset.
 * Large photos are downscaled (default max side 2000 px, plenty for a 1080-wide slide at 2x)
 * so the project JSON and the browser autosave stay small.
 */
export async function fileToAsset(file: File, maxSide = 2000): Promise<Asset> {
  if (!file.type.startsWith('image/')) throw new Error('فقط فایل تصویری (JPG، PNG، WebP) قابل آپلود است.');
  const src = await readFile(file);
  const img = await loadImage(src);
  const ratio = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * ratio));
  const h = Math.max(1, Math.round(img.naturalHeight * ratio));

  // Small files that need no resizing are kept byte-for-byte.
  if (ratio === 1 && file.size < 600_000) {
    return { name: file.name, dataUrl: src, width: w, height: h };
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('پردازش تصویر در این مرورگر ممکن نیست.');
  ctx.drawImage(img, 0, 0, w, h);

  const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
  let dataUrl = keepAlpha ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.88);
  if (keepAlpha && dataUrl.length > 3_000_000) {
    // Very large PNG: flatten on white and use JPEG.
    const flat = document.createElement('canvas');
    flat.width = w;
    flat.height = h;
    const fctx = flat.getContext('2d');
    if (fctx) {
      fctx.fillStyle = '#ffffff';
      fctx.fillRect(0, 0, w, h);
      fctx.drawImage(img, 0, 0, w, h);
      dataUrl = flat.toDataURL('image/jpeg', 0.88);
    }
  }
  return { name: file.name, dataUrl, width: w, height: h };
}
