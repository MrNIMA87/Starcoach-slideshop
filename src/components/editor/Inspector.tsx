import { useEffect, useRef } from 'react';
import type { DragEvent, PointerEvent } from 'react';
import { useSelectedSlide, useStudio } from '../../store';
import { TEMPLATES } from '../templates/registry';
import type { FieldDef, ImageRef, Pair, Slide, SlotDef } from '../../types';
import { fileToAsset } from '../../utils/image';
import { toFa } from '../../utils/fa';
import { resolveTheme } from '../../utils/theme';
import { Btn, Field, IconBtn, IconImage, IconPlus, IconTrash, IconUpload, Range, Section, TextArea, TextInput, Toggle } from './ui';

/* ----------------------------- field editors ----------------------------- */

function Counter({ value, max }: { value: string; max?: number }) {
  if (!max) return null;
  const over = value.length > max;
  return (
    <span className={`text-[11px] font-normal ${over ? 'text-chrome-danger' : 'text-chrome-muted'}`}>
      {toFa(value.length)}/{toFa(max)}
    </span>
  );
}

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function FieldEditor({ slide, def }: { slide: Slide; def: FieldDef }) {
  const updateContent = useStudio((s) => s.updateContent);
  const meta = TEMPLATES[slide.template].meta;
  const raw = slide.content[def.key] ?? meta.defaults[def.key];
  const set = (value: string | string[] | Pair[]) => updateContent(slide.id, { [def.key]: value });

  if (def.kind === 'text') {
    const value = asString(raw);
    return (
      <Field label={def.label} hint={def.hint} counter={<Counter value={value} max={def.maxChars} />}>
        <TextInput id={`f-${def.key}`} value={value} ltr={def.ltr} onChange={(e) => set(e.target.value)} />
      </Field>
    );
  }

  if (def.kind === 'textarea') {
    const value = asString(raw);
    return (
      <Field label={def.label} hint={def.hint} counter={<Counter value={value} max={def.maxChars} />}>
        <TextArea id={`f-${def.key}`} rows={2} value={value} ltr={def.ltr} onChange={(e) => set(e.target.value)} />
      </Field>
    );
  }

  if (def.kind === 'list') {
    const items = Array.isArray(raw) ? (raw as string[]) : [];
    const max = def.maxItems ?? 6;
    const min = def.minItems ?? 0;
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[12px] font-semibold">
          <span>{def.label}</span>
          <span className="text-[11px] font-normal text-chrome-muted">{toFa(items.length)}/{toFa(max)}</span>
        </div>
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <TextInput
              id={`f-${def.key}.${i}`}
              value={it}
              ltr={def.ltr}
              onChange={(e) => set(items.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <IconBtn label="حذف مورد" disabled={items.length <= min} onClick={() => set(items.filter((_, j) => j !== i))}>
              <IconTrash />
            </IconBtn>
          </div>
        ))}
        <Btn disabled={items.length >= max} onClick={() => set([...items, ''])}>
          <IconPlus /> افزودن مورد
        </Btn>
      </div>
    );
  }

  // pairs
  const pairs = Array.isArray(raw) ? (raw as Pair[]) : [];
  const max = def.maxItems ?? 4;
  const min = def.minItems ?? 0;
  const patch = (i: number, p: Partial<Pair>) => set(pairs.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-[12px] font-semibold">
        <span>{def.label}</span>
        <span className="text-[11px] font-normal text-chrome-muted">{toFa(pairs.length)}/{toFa(max)}</span>
      </div>
      {pairs.map((p, i) => (
        <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-chrome-line bg-chrome-2 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-chrome-muted">مورد {toFa(i + 1)}</span>
            <IconBtn label="حذف مورد" disabled={pairs.length <= min} onClick={() => set(pairs.filter((_, j) => j !== i))}>
              <IconTrash />
            </IconBtn>
          </div>
          <TextInput id={`f-${def.key}.${i}.title`} placeholder="عنوان" value={p.title} onChange={(e) => patch(i, { title: e.target.value })} />
          <TextArea id={`f-${def.key}.${i}.text`} rows={2} placeholder="توضیح" value={p.text} onChange={(e) => patch(i, { text: e.target.value })} />
          {def.maxChars && <Counter value={p.text} max={def.maxChars} />}
        </div>
      ))}
      <Btn disabled={pairs.length >= max} onClick={() => set([...pairs, { title: '', text: '' }])}>
        <IconPlus /> افزودن مورد
      </Btn>
    </div>
  );
}

/* ----------------------------- image slots ----------------------------- */

function SlotCard({ slide, slot }: { slide: Slide; slot: SlotDef }) {
  const assets = useStudio((s) => s.project.assets);
  const addAsset = useStudio((s) => s.addAsset);
  const setImage = useStudio((s) => s.setImage);
  const toast = useStudio((s) => s.toast);
  const fileRef = useRef<HTMLInputElement>(null);
  const ref: ImageRef | undefined = slide.content.images?.[slot.id];
  const asset = ref ? assets[ref.assetId] : undefined;

  const upload = async (file: File | undefined) => {
    if (!file) return;
    try {
      const a = await fileToAsset(file);
      const assetId = addAsset(a);
      setImage(slide.id, slot.id, { assetId, fx: 50, fy: 50, zoom: 1 });
      toast('success', 'عکس در اسلات قرار گرفت.');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'آپلود عکس ناموفق بود.');
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    void upload(e.dataTransfer.files[0]);
  };

  const pickFocal = (e: PointerEvent<HTMLDivElement>) => {
    if (!ref || (e.type === 'pointermove' && e.buttons !== 1)) return;
    const r = e.currentTarget.getBoundingClientRect();
    const fx = Math.round(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)));
    const fy = Math.round(Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)));
    setImage(slide.id, slot.id, { ...ref, fx, fy });
  };

  return (
    <div
      id={`f-slot:${slot.id}`}
      tabIndex={-1}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="flex flex-col gap-2.5 rounded-lg border border-dashed border-chrome-line bg-chrome-2 p-3"
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-[12.5px] font-bold">{slot.label}</span>
        <span className="text-[11px] text-chrome-muted">{slot.aspectHint}</span>
      </div>

      {asset && ref ? (
        <>
          <div
            className="relative cursor-crosshair touch-none overflow-hidden rounded-md ring-1 ring-chrome-line"
            style={{ aspectRatio: `${asset.width || 4} / ${asset.height || 5}`, maxHeight: 260 }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              pickFocal(e);
            }}
            onPointerMove={pickFocal}
            title="برای تعیین نقطه تمرکز کلیک یا بکشید"
          >
            <img src={asset.dataUrl} alt="" draggable={false} className="block h-full w-full object-contain" />
            <span
              className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-chrome-accent/70 shadow"
              style={{ left: `${ref.fx}%`, top: `${ref.fy}%` }}
            />
          </div>
          <span className="text-[11px] text-chrome-muted">نقطه تمرکز: بخشی از عکس که هنگام برش همیشه دیده می‌شود.</span>
          <Field label={`بزرگ‌نمایی (${toFa(ref.zoom.toFixed(2))}×)`}>
            <Range value={ref.zoom} min={1} max={3} step={0.05} onChange={(zoom) => setImage(slide.id, slot.id, { ...ref, zoom })} />
          </Field>
          <div className="flex gap-2">
            <Btn className="flex-1" onClick={() => fileRef.current?.click()}><IconUpload /> تعویض عکس</Btn>
            <Btn variant="danger" onClick={() => setImage(slide.id, slot.id, null)}><IconTrash /> حذف</Btn>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-1.5 rounded-md border border-chrome-line bg-chrome-0 px-3 py-5 text-chrome-muted transition hover:border-chrome-accent hover:text-chrome-text"
        >
          <IconImage />
          <span className="text-[12.5px] font-bold">انتخاب یا رها کردن عکس</span>
          <span className="text-[11px]">JPG، PNG یا WebP</span>
        </button>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void upload(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/* ----------------------------- per-slide overrides ----------------------------- */

function SlideOptions({ slide }: { slide: Slide }) {
  const updateOverrides = useStudio((s) => s.updateOverrides);
  const brandKit = useStudio((s) => s.project.brandKit);
  const theme = resolveTheme(brandKit);
  const o = slide.overrides ?? {};
  const accent = o.colors?.accent ?? theme.colors.accent;
  const isHex = /^#[0-9a-f]{6}$/i.test(accent);

  return (
    <>
      <Field label={`اندازه متن این اسلاید (${toFa(Math.round((o.textScale ?? 1) * 100))}٪)`}>
        <Range value={o.textScale ?? 1} min={0.8} max={1.25} step={0.01} onChange={(textScale) => updateOverrides(slide.id, { textScale })} />
      </Field>
      <Toggle label="برعکس کردن جهت برش مورب" checked={!!o.flipDiagonal} onChange={(flipDiagonal) => updateOverrides(slide.id, { flipDiagonal })} />
      <Toggle label="نمایش نوار برند" checked={!o.hideBrandBar} onChange={(v) => updateOverrides(slide.id, { hideBrandBar: !v })} />
      <Toggle label="نمایش نقطه‌های صفحه" checked={!o.hidePageDots} onChange={(v) => updateOverrides(slide.id, { hidePageDots: !v })} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12.5px]">رنگ تأکید فقط برای این اسلاید</span>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            dir="ltr"
            value={isHex ? accent : '#000000'}
            onChange={(e) => updateOverrides(slide.id, { colors: { ...o.colors, accent: e.target.value } })}
            className="h-7 w-9 cursor-pointer rounded border border-chrome-line bg-transparent p-0"
            aria-label="رنگ تأکید"
          />
          <Btn variant="ghost" disabled={!o.colors?.accent} onClick={() => {
            const rest = { ...o.colors };
            delete rest.accent;
            updateOverrides(slide.id, { colors: rest });
          }}>
            بازنشانی
          </Btn>
        </div>
      </div>
    </>
  );
}

/* ----------------------------- Inspector ----------------------------- */

export function Inspector() {
  const { slide, index } = useSelectedSlide();
  const focusField = useStudio((s) => s.focusField);
  const requestFocus = useStudio((s) => s.requestFocus);
  const rootRef = useRef<HTMLDivElement>(null);
  const meta = TEMPLATES[slide.template].meta;

  // Canvas click -> focus matching field (or flash the slot card).
  useEffect(() => {
    if (!focusField) return;
    const t = window.setTimeout(() => {
      const el = document.getElementById(`f-${focusField}`);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
          el.focus({ preventScroll: true });
          el.select();
        } else {
          el.classList.remove('flash-ring');
          void el.offsetWidth;
          el.classList.add('flash-ring');
        }
      }
      requestFocus(null);
    }, 30);
    return () => window.clearTimeout(t);
  }, [focusField, requestFocus]);

  return (
    <div ref={rootRef} className="min-h-0 flex-1 overflow-y-auto">
      <div className="border-b border-chrome-line px-4 py-3">
        <div className="text-[11px] font-bold text-chrome-accent">
          اسلاید {toFa(index + 1)} · {meta.label}
        </div>
        <p className="mt-1 text-[11.5px] leading-5 text-chrome-muted">{meta.description}</p>
      </div>

      <Section title="متن‌ها">
        {meta.fields.map((def) => (
          <FieldEditor key={`${slide.id}-${def.key}`} slide={slide} def={def} />
        ))}
      </Section>

      <Section title="عکس‌ها (فقط در اسلات‌های مشخص)">
        {meta.slots.length === 0 ? (
          <p className="text-[12px] leading-6 text-chrome-muted">این تمپلیت اسلات عکس ندارد؛ طراحی کاملاً تایپوگرافیک است.</p>
        ) : (
          meta.slots.map((slot) => <SlotCard key={`${slide.id}-${slot.id}`} slide={slide} slot={slot} />)
        )}
      </Section>

      <Section title="تنظیمات این اسلاید">
        <SlideOptions slide={slide} />
      </Section>
    </div>
  );
}
