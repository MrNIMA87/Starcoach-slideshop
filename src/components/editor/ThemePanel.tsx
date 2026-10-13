import { useRef, useState } from 'react';
import { saveAs } from 'file-saver';
import { useStudio } from '../../store';
import { PRESET_THEMES } from '../../tokens';
import type { ColorKey, RadiusKey, SpaceKey, Theme, TypeKey } from '../../types';
import { allThemes, COLOR_KEY_LIST, RADIUS_KEY_LIST, resolveTheme, SPACE_KEY_LIST, TYPE_KEY_LIST } from '../../utils/theme';
import { fileToAsset } from '../../utils/image';
import { Btn, Field, IconBtn, IconTrash, IconUpload, NumberInput, Range, Section, Select, TextInput } from './ui';
import { toFa } from '../../utils/fa';

const COLOR_LABELS: Record<ColorKey, string> = {
  bg: 'پس‌زمینه',
  bgAlt: 'پس‌زمینه دوم',
  surface: 'سطح کارت',
  ink: 'متن اصلی',
  inkMuted: 'متن کم‌رنگ',
  accent: 'رنگ تأکید',
  accentInk: 'متن روی تأکید',
  line: 'خطوط',
  panel: 'پنل مورب',
  panelInk: 'متن روی پنل',
  onImage: 'متن روی عکس',
  scrim: 'سایه روی عکس',
};

const TYPE_LABELS: Record<TypeKey, string> = {
  display: 'نمایشی (کاور)',
  headline: 'تیتر',
  title: 'عنوان',
  subtitle: 'زیرتیتر',
  body: 'متن',
  caption: 'توضیح',
  label: 'برچسب',
  price: 'قیمت',
};

const SPACE_LABELS: Record<SpaceKey, string> = { xs: 'خیلی کم', sm: 'کم', md: 'متوسط', lg: 'زیاد', xl: 'خیلی زیاد' };
const RADIUS_LABELS: Record<RadiusKey, string> = { sm: 'کوچک', md: 'متوسط', lg: 'بزرگ', pill: 'کپسولی' };

const WEIGHTS = [300, 400, 500, 600, 700, 800, 900].map((w) => ({ value: w, label: toFa(w) }));
const HEX = /^#[0-9a-f]{6}$/i;

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        dir="ltr"
        disabled={!HEX.test(value)}
        value={HEX.test(value) ? value : '#000000'}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="h-8 w-10 flex-none cursor-pointer rounded border border-chrome-line bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-40"
      />
      <span className="w-[92px] flex-none text-[12px]">{label}</span>
      <TextInput ltr value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-[12px]" />
    </div>
  );
}

function BrandSection() {
  const brand = useStudio((s) => s.project.brandKit);
  const assets = useStudio((s) => s.project.assets);
  const updateBrand = useStudio((s) => s.updateBrand);
  const addAsset = useStudio((s) => s.addAsset);
  const toast = useStudio((s) => s.toast);
  const fileRef = useRef<HTMLInputElement>(null);
  const logo = brand.logoAssetId ? assets[brand.logoAssetId] : undefined;

  const upload = async (file?: File) => {
    if (!file) return;
    try {
      const a = await fileToAsset(file, 600);
      updateBrand({ logoAssetId: addAsset(a) });
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'آپلود لوگو ناموفق بود.');
    }
  };

  return (
    <Section title="برند">
      <Field label="نام برند (فارسی)">
        <TextInput value={brand.name} onChange={(e) => updateBrand({ name: e.target.value })} />
      </Field>
      <Field label="نام لاتین">
        <TextInput ltr value={brand.nameLatin} onChange={(e) => updateBrand({ nameLatin: e.target.value })} />
      </Field>
      <Field label="وب‌سایت">
        <TextInput ltr value={brand.website} onChange={(e) => updateBrand({ website: e.target.value })} />
      </Field>
      <Field label="آی‌دی اینستاگرام">
        <TextInput ltr value={brand.handle} onChange={(e) => updateBrand({ handle: e.target.value })} />
      </Field>
      <div className="flex items-center gap-2">
        {logo ? (
          <img src={logo.dataUrl} alt="" className="h-10 w-auto max-w-[96px] rounded bg-chrome-0 object-contain p-1 ring-1 ring-chrome-line" />
        ) : (
          <span className="text-[12px] text-chrome-muted">بدون لوگو: نشان پیش‌فرض برند نمایش داده می‌شود.</span>
        )}
        <div className="ms-auto flex gap-1.5">
          <Btn onClick={() => fileRef.current?.click()}><IconUpload /> لوگو</Btn>
          {logo && <Btn variant="danger" onClick={() => updateBrand({ logoAssetId: null })}>حذف</Btn>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
    </Section>
  );
}

/** Theme presets + live token editor + custom theme saving. All edits go to brandKit.tokenOverrides. */
export function ThemePanel() {
  const brand = useStudio((s) => s.project.brandKit);
  const setTheme = useStudio((s) => s.setTheme);
  const setToken = useStudio((s) => s.setToken);
  const resetTokens = useStudio((s) => s.resetTokens);
  const saveCustomTheme = useStudio((s) => s.saveCustomTheme);
  const deleteCustomTheme = useStudio((s) => s.deleteCustomTheme);
  const toast = useStudio((s) => s.toast);
  const [customName, setCustomName] = useState('');

  const theme = resolveTheme(brand);
  const themes = allThemes(brand);
  const dirty = Object.keys(brand.tokenOverrides).length > 0;
  const isPreset = (id: string) => PRESET_THEMES.some((t) => t.id === id);

  const exportTheme = () => {
    const out: Theme = { ...theme, id: theme.id, name: theme.name };
    saveAs(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' }), `${theme.id}.json`);
    toast('info', 'فایل تم ساخته شد؛ می‌توانید آن را در src/tokens قرار دهید.');
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <Section title="تم‌های آماده">
        <div className="grid grid-cols-1 gap-2">
          {themes.map((t) => {
            const active = t.id === brand.themeId;
            return (
              <div key={t.id} className="relative">
                <button
                  type="button"
                  onClick={() => setTheme(t.id)}
                  aria-pressed={active}
                  className={`flex w-full cursor-pointer flex-col gap-2 rounded-lg border p-3 text-start transition ${
                    active ? 'border-chrome-accent bg-chrome-2' : 'border-chrome-line bg-chrome-1 hover:bg-chrome-2'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-extrabold text-chrome-text">{t.name}</span>
                    {!isPreset(t.id) && <span className="text-[10.5px] text-chrome-muted">سفارشی</span>}
                  </div>
                  <div className="flex overflow-hidden rounded ring-1 ring-chrome-line">
                    {(['bg', 'panel', 'accent', 'ink'] as ColorKey[]).map((k) => (
                      <span key={k} className="h-6 flex-1" style={{ background: t.colors[k] }} />
                    ))}
                  </div>
                  <span className="text-[11px] leading-5 text-chrome-muted">{t.description}</span>
                </button>
                {!isPreset(t.id) && (
                  <IconBtn label="حذف تم سفارشی" className="absolute end-2 top-2 text-chrome-danger" onClick={() => deleteCustomTheme(t.id)}>
                    <IconTrash />
                  </IconBtn>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <BrandSection />

      <Section
        title="ویرایش زنده توکن‌ها"
        action={<Btn variant="ghost" disabled={!dirty} onClick={resetTokens}>بازنشانی</Btn>}
      >
        <p className="text-[11.5px] leading-5 text-chrome-muted">
          هر تغییر همین لحظه روی همه اسلایدها اعمال می‌شود. برای نگه‌داشتن آن، پایین صفحه «ذخیره تم سفارشی» را بزنید.
        </p>
      </Section>

      <Section title="رنگ‌ها">
        {COLOR_KEY_LIST.map((k) => (
          <ColorRow key={k} label={COLOR_LABELS[k]} value={theme.colors[k]} onChange={(v) => setToken(['colors', k], v)} />
        ))}
      </Section>

      <Section title="مقیاس تایپوگرافی">
        <div className="grid grid-cols-[1fr_72px_84px_64px] items-center gap-x-2 gap-y-2 text-[12px]">
          <span className="text-[11px] text-chrome-muted">سطح</span>
          <span className="text-center text-[11px] text-chrome-muted">اندازه</span>
          <span className="text-center text-[11px] text-chrome-muted">ضخامت</span>
          <span className="text-center text-[11px] text-chrome-muted">ارتفاع خط</span>
          {TYPE_KEY_LIST.map((k) => {
            const t = theme.type.scale[k];
            return (
              <div key={k} className="contents">
                <span>{TYPE_LABELS[k]}</span>
                <NumberInput value={t.size} min={10} max={260} onChange={(n) => setToken(['type', 'scale', k, 'size'], n)} />
                <Select value={t.weight} options={WEIGHTS} onChange={(n) => setToken(['type', 'scale', k, 'weight'], n)} />
                <NumberInput value={t.lineHeight} min={0.9} max={2.4} step={0.05} onChange={(n) => setToken(['type', 'scale', k, 'lineHeight'], n)} />
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="فاصله‌ها، گردی گوشه‌ها و حاشیه امن">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          {SPACE_KEY_LIST.map((k) => (
            <Field key={k} label={`فاصله ${SPACE_LABELS[k]}`}>
              <NumberInput value={theme.spacing[k]} min={0} max={200} onChange={(n) => setToken(['spacing', k], n)} />
            </Field>
          ))}
          {RADIUS_KEY_LIST.map((k) => (
            <Field key={k} label={`گوشه ${RADIUS_LABELS[k]}`}>
              <NumberInput value={theme.radius[k]} min={0} max={999} onChange={(n) => setToken(['radius', k], n)} />
            </Field>
          ))}
          <Field label="حاشیه امن">
            <NumberInput value={theme.canvas.safe} min={32} max={160} onChange={(n) => setToken(['canvas', 'safe'], n)} />
          </Field>
        </div>
      </Section>

      <Section title="موتیف شکل‌ها">
        <Field label="نوع پنل">
          <Select
            value={theme.motif.panelStyle}
            onChange={(v) => setToken(['motif', 'panelStyle'], v)}
            options={[{ value: 'diagonal', label: 'مورب' }, { value: 'block', label: 'بلوک صاف' }]}
          />
        </Field>
        <Field label={`زاویه برش مورب (${toFa(theme.motif.diagonalAngle)}°)`}>
          <Range value={theme.motif.diagonalAngle} min={0} max={20} step={0.5} onChange={(n) => setToken(['motif', 'diagonalAngle'], n)} />
        </Field>
        <Field label="شکل نقطه‌های صفحه">
          <Select
            value={theme.motif.dotStyle}
            onChange={(v) => setToken(['motif', 'dotStyle'], v)}
            options={[{ value: 'pill', label: 'کپسولی' }, { value: 'circle', label: 'دایره' }, { value: 'bar', label: 'نواری' }]}
          />
        </Field>
        <Field label="الگوی پس‌زمینه">
          <Select
            value={theme.motif.pattern}
            onChange={(v) => setToken(['motif', 'pattern'], v)}
            options={[
              { value: 'none', label: 'بدون الگو' },
              { value: 'stripes', label: 'راه‌راه مورب' },
              { value: 'dots', label: 'نقطه‌ای (نیم‌تون)' },
              { value: 'diamonds', label: 'لوزی' },
            ]}
          />
        </Field>
        <Field label={`شدت الگو (${toFa(Math.round(theme.motif.patternOpacity * 100))}٪)`}>
          <Range value={theme.motif.patternOpacity} min={0} max={0.4} step={0.01} onChange={(n) => setToken(['motif', 'patternOpacity'], n)} />
        </Field>
        <Field label="ضخامت خط">
          <NumberInput value={theme.motif.strokeWidth} min={1} max={16} onChange={(n) => setToken(['motif', 'strokeWidth'], n)} />
        </Field>
      </Section>

      <Section title="ذخیره تم سفارشی">
        <div className="flex gap-2">
          <TextInput placeholder="نام تم، مثلاً «جشنواره یلدا»" value={customName} onChange={(e) => setCustomName(e.target.value)} />
          <Btn
            variant="primary"
            onClick={() => {
              saveCustomTheme(customName);
              setCustomName('');
              toast('success', 'تم سفارشی ذخیره و فعال شد.');
            }}
          >
            ذخیره
          </Btn>
        </div>
        <Btn onClick={exportTheme}>دریافت JSON تم فعلی</Btn>
      </Section>
    </div>
  );
}
