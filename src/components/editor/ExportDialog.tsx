import { useState } from 'react';
import { useStudio } from '../../store';
import { exportSlides } from '../../utils/exporter';
import { resolveTheme, themeHeight } from '../../utils/theme';
import type { Format } from '../../types';
import { toFa } from '../../utils/fa';
import { Btn } from './ui';

export function ExportDialog() {
  const open = useStudio((s) => s.exportOpen);
  const setOpen = useStudio((s) => s.setExportOpen);
  const project = useStudio((s) => s.project);
  const selectedId = useStudio((s) => s.selectedId);
  const toast = useStudio((s) => s.toast);

  const [scope, setScope] = useState<'current' | 'all'>('all');
  const [formats, setFormats] = useState<Format[]>(['portrait']);
  const [ratio, setRatio] = useState<1 | 2>(2);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  if (!open) return null;
  const theme = resolveTheme(project.brandKit);
  const W = theme.canvas.width;
  const count = (scope === 'all' ? project.slides.length : 1) * formats.length;
  const busy = progress !== null;

  const toggleFormat = (f: Format) =>
    setFormats((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const run = async () => {
    setProgress({ done: 0, total: count });
    try {
      await exportSlides(project, {
        formats,
        pixelRatio: ratio,
        scope,
        currentSlideId: selectedId,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      toast('success', 'خروجی آماده شد و دانلود می‌شود.');
      setOpen(false);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'اکسپورت ناموفق بود.');
    } finally {
      setProgress(null);
    }
  };

  const opt = (checked: boolean) =>
    `flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] ${
      checked ? 'border-chrome-accent bg-chrome-2' : 'border-chrome-line bg-chrome-1'
    }`;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="خروجی PNG">
      <div className="w-full max-w-[460px] rounded-xl border border-chrome-line bg-chrome-1 p-5 shadow-2xl">
        <h2 className="mb-4 text-[15px] font-extrabold">خروجی PNG</h2>

        <fieldset className="mb-4 flex flex-col gap-2">
          <legend className="mb-1 text-[12px] font-bold text-chrome-muted">کدام اسلایدها؟</legend>
          <label className={opt(scope === 'all')}>
            <input type="radio" name="scope" checked={scope === 'all'} onChange={() => setScope('all')} className="accent-[#4c9dff]" />
            همه اسلایدها ({toFa(project.slides.length)}) — ZIP با ترتیب ۰۱، ۰۲، …
          </label>
          <label className={opt(scope === 'current')}>
            <input type="radio" name="scope" checked={scope === 'current'} onChange={() => setScope('current')} className="accent-[#4c9dff]" />
            فقط اسلاید انتخاب‌شده
          </label>
        </fieldset>

        <fieldset className="mb-4 flex flex-col gap-2">
          <legend className="mb-1 text-[12px] font-bold text-chrome-muted">قالب</legend>
          {(['portrait', 'square'] as Format[]).map((f) => (
            <label key={f} className={opt(formats.includes(f))}>
              <input type="checkbox" checked={formats.includes(f)} onChange={() => toggleFormat(f)} className="accent-[#4c9dff]" />
              {f === 'portrait' ? 'عمودی ۴:۵ (استاندارد کاروسل)' : 'مربع ۱:۱'}
              <span className="ms-auto text-[11.5px] text-chrome-muted" dir="ltr">
                {W}×{themeHeight(theme, f)}
              </span>
            </label>
          ))}
        </fieldset>

        <fieldset className="mb-5 flex flex-col gap-2">
          <legend className="mb-1 text-[12px] font-bold text-chrome-muted">کیفیت</legend>
          <label className={opt(ratio === 2)}>
            <input type="radio" name="ratio" checked={ratio === 2} onChange={() => setRatio(2)} className="accent-[#4c9dff]" />
            ۲× (pixelRatio = 2) — شارپ‌ترین
            <span className="ms-auto text-[11.5px] text-chrome-muted" dir="ltr">{W * 2}px wide</span>
          </label>
          <label className={opt(ratio === 1)}>
            <input type="radio" name="ratio" checked={ratio === 1} onChange={() => setRatio(1)} className="accent-[#4c9dff]" />
            ۱× — اندازه دقیق ۱۰۸۰ پیکسل
            <span className="ms-auto text-[11.5px] text-chrome-muted" dir="ltr">{W}px wide</span>
          </label>
        </fieldset>

        {busy && (
          <div className="mb-4" aria-live="polite">
            <div className="h-2 overflow-hidden rounded bg-chrome-3">
              <div className="h-full bg-chrome-accent transition-all" style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} />
            </div>
            <div className="mt-1.5 text-[12px] text-chrome-muted">
              در حال ساخت {toFa(progress.done)} از {toFa(progress.total)} تصویر…
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setOpen(false)} disabled={busy}>بستن</Btn>
          <Btn variant="primary" onClick={run} disabled={busy || formats.length === 0}>
            {busy ? 'در حال ساخت…' : `ساخت ${toFa(count)} فایل`}
          </Btn>
        </div>
      </div>
    </div>
  );
}
