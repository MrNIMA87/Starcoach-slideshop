import { useRef, useState } from 'react';
import { useStore } from 'zustand';
import { redo, undo, useStudio } from '../../store';
import { downloadProjectJson, readProjectFile } from '../../utils/exporter';
import { toFa } from '../../utils/fa';
import type { Format } from '../../types';
import type { GuideFlags } from '../primitives/SlideContext';
import { Btn, IconBtn, IconDownload, IconGrid, IconRedo, IconUndo, IconUpload, TextInput } from './ui';

const GUIDE_LABELS: Record<keyof GuideFlags, string> = {
  safe: 'حاشیه امن',
  center: 'خطوط مرکز',
  thirds: 'قانون یک‌سوم‌ها',
  squareCrop: 'برش مربع ۱:۱',
  gridCrop: 'برش گرید پروفایل ۳:۴',
};

export function TopBar() {
  const name = useStudio((s) => s.project.name);
  const setName = useStudio((s) => s.setProjectName);
  const format = useStudio((s) => s.format);
  const setFormat = useStudio((s) => s.setFormat);
  const zoom = useStudio((s) => s.zoom);
  const setZoom = useStudio((s) => s.setZoom);
  const showGuides = useStudio((s) => s.showGuides);
  const setShowGuides = useStudio((s) => s.setShowGuides);
  const guides = useStudio((s) => s.guides);
  const setGuide = useStudio((s) => s.setGuide);
  const setExportOpen = useStudio((s) => s.setExportOpen);
  const loadProject = useStudio((s) => s.loadProject);
  const resetProject = useStudio((s) => s.resetProject);
  const toast = useStudio((s) => s.toast);
  const canUndo = useStore(useStudio.temporal, (s) => s.pastStates.length > 0);
  const canRedo = useStore(useStudio.temporal, (s) => s.futureStates.length > 0);
  const [guideMenu, setGuideMenu] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const importJson = async (file?: File) => {
    if (!file) return;
    try {
      loadProject(await readProjectFile(file));
      toast('success', 'پروژه بارگذاری شد.');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'بارگذاری پروژه ناموفق بود.');
    }
  };

  const seg = (active: boolean) =>
    `cursor-pointer rounded-md px-3 py-1 text-[12px] font-bold transition ${active ? 'bg-chrome-accent text-[#06101f]' : 'text-chrome-text hover:bg-chrome-3'}`;

  return (
    <header className="flex h-12 items-center gap-3 border-b border-chrome-line bg-chrome-0 px-3">
      <div className="flex items-center gap-2.5">
        <span aria-hidden className="inline-block h-5 w-3.5 -skew-x-12 rounded-sm bg-chrome-accent" />
        <span className="text-[13px] font-extrabold">استودیو اسلاید ایران‌پوش</span>
      </div>
      <TextInput
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="نام پروژه"
        className="!w-[240px] !bg-transparent !py-1 font-semibold"
      />

      <div className="mx-auto flex items-center gap-1.5">
        <IconBtn label="واگرد (Ctrl+Z)" disabled={!canUndo} onClick={undo}><IconUndo /></IconBtn>
        <IconBtn label="ازنو (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}><IconRedo /></IconBtn>
        <span className="mx-1 h-5 w-px bg-chrome-line" />
        <div className="flex gap-0.5 rounded-lg bg-chrome-1 p-0.5" role="group" aria-label="قالب بوم">
          {([['portrait', 'عمودی ۴:۵'], ['square', 'مربع ۱:۱']] as [Format, string][]).map(([f, l]) => (
            <button key={f} type="button" className={seg(format === f)} aria-pressed={format === f} onClick={() => setFormat(f)}>{l}</button>
          ))}
        </div>
        <span className="mx-1 h-5 w-px bg-chrome-line" />
        <IconBtn label="کوچک‌نمایی" onClick={() => setZoom(zoom - 0.1)}>−</IconBtn>
        <button type="button" onClick={() => setZoom(1)} title="تطبیق با پنجره" className="min-w-12 cursor-pointer rounded-md px-1 text-[12px] font-bold hover:bg-chrome-3">
          {toFa(Math.round(zoom * 100))}٪
        </button>
        <IconBtn label="بزرگ‌نمایی" onClick={() => setZoom(zoom + 0.1)}>+</IconBtn>
        <span className="mx-1 h-5 w-px bg-chrome-line" />
        <div className="relative flex items-center">
          <Btn variant={showGuides ? 'primary' : 'default'} onClick={() => setShowGuides(!showGuides)} aria-pressed={showGuides}>
            <IconGrid /> راهنماها
          </Btn>
          <IconBtn label="تنظیم راهنماها" onClick={() => setGuideMenu((v) => !v)}>▾</IconBtn>
          {guideMenu && (
            <div className="absolute start-0 top-full z-40 mt-1 w-[220px] rounded-lg border border-chrome-line bg-chrome-2 p-2 shadow-2xl">
              {(Object.keys(GUIDE_LABELS) as (keyof GuideFlags)[]).map((k) => (
                <label key={k} className="flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-[12.5px] hover:bg-chrome-3">
                  {GUIDE_LABELS[k]}
                  <input
                    type="checkbox"
                    checked={guides[k]}
                    onChange={(e) => {
                      setGuide(k, e.target.checked);
                      if (e.target.checked) setShowGuides(true);
                    }}
                    className="accent-[#4c9dff]"
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Btn onClick={() => fileRef.current?.click()}><IconUpload /> ورود JSON</Btn>
        <Btn onClick={() => downloadProjectJson(useStudio.getState().project)}><IconDownload /> خروجی JSON</Btn>
        <Btn
          variant="ghost"
          onClick={() => {
            if (window.confirm('پروژه به نمونه پیش‌فرض برمی‌گردد. ادامه می‌دهید؟ (با واگرد قابل بازگشت است)')) resetProject();
          }}
        >
          نمونه پیش‌فرض
        </Btn>
        <Btn variant="primary" onClick={() => setExportOpen(true)}><IconDownload /> خروجی PNG</Btn>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { void importJson(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </header>
  );
}
