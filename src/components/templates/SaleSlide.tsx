import type { ImageRef, SlideContent, TemplateProps } from '../../types';
import { AutoFitText, BrandBar, DiagonalPanel, ImageSlot, PageDots, SlideFrame, Text, useSlideCtx } from '../primitives';
import { C, R, S, STROKE } from '../../utils/style';
import type { TemplateMeta } from './shared';
import { useLayout, withDefaults } from './shared';

interface SaleContent {
  kicker: string;
  value: string;
  valueLabel: string;
  sub: string;
  codeLabel: string;
  code: string;
  deadline: string;
  images: { product?: ImageRef };
}

export const saleMeta: TemplateMeta = {
  id: 'sale',
  label: 'جشنواره / تخفیف',
  fileSlug: 'sale',
  description: 'عدد درشت تخفیف، روبان مورب، کد تخفیف و مهلت.',
  fields: [
    { key: 'kicker', label: 'متن روبان', kind: 'text', maxChars: 26 },
    { key: 'value', label: 'عدد تخفیف', kind: 'text', maxChars: 8, hint: 'مثلاً ۳۰٪' },
    { key: 'valueLabel', label: 'برچسب کنار عدد', kind: 'text', maxChars: 14 },
    { key: 'sub', label: 'توضیح تخفیف', kind: 'textarea', maxChars: 60 },
    { key: 'codeLabel', label: 'برچسب کد', kind: 'text', maxChars: 14 },
    { key: 'code', label: 'کد تخفیف', kind: 'text', maxChars: 16, ltr: true },
    { key: 'deadline', label: 'مهلت', kind: 'text', maxChars: 36 },
  ],
  slots: [{ id: 'product', label: 'عکس محصول جشنواره', aspectHint: 'مربع ۱:۱' }],
  defaults: {
    kicker: 'جشنواره پاییزه ایران‌پوش',
    value: '۳۰٪',
    valueLabel: 'تخفیف',
    sub: 'روی تمام کت‌های اسپرت و پالتوهای مردانه',
    codeLabel: 'کد تخفیف',
    code: 'IRANPOOSH30',
    deadline: 'فقط تا پایان آبان‌ماه',
    images: {},
  },
};

export function SaleSlide({ content }: TemplateProps) {
  const c = withDefaults<SaleContent>(content as SlideContent, saleMeta.defaults);
  const { theme } = useSlideCtx();
  const { height, square, safe, off, width } = useLayout();
  const panelFrac = square ? 0.48 : 0.42;
  const blockH = height * panelFrac - safe;
  const rot = theme.motif.panelStyle === 'block' ? 0 : theme.motif.diagonalAngle * 0.7;
  const imgSize = Math.min(blockH * 0.5, width * 0.28);

  return (
    <SlideFrame
      bleed={
        <>
          <DiagonalPanel anchor="bottom" size={panelFrac} extra={theme.spacing.xs * 1.5} tone="accent" zIndex={1} />
          <DiagonalPanel anchor="bottom" size={panelFrac} tone="panel" zIndex={2} />
        </>
      }
    >
      <BrandBar />
      <div
        style={{
          flex: 'none',
          marginLeft: `calc(var(--safe) * -1.2)`,
          marginRight: `calc(var(--safe) * -1.2)`,
          marginTop: `calc(${S.md} + ${Math.round(Math.tan((rot * Math.PI) / 180) * width * 0.5)}px)`,
          padding: `${S.xs} calc(var(--safe) * 1.2)`,
          background: C.accent,
          color: C.accentInk,
          transform: `rotate(-${rot}deg)`,
          textAlign: 'center',
          zIndex: 4,
        }}
      >
        <Text type="label" field="kicker" align="center" style={{ fontSize: 'calc(var(--t-label-size) * 1.1)' }}>
          {c.kicker}
        </Text>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', gap: S.md }}>
        <AutoFitText text={c.value} type="display" field="value" weight={900} align="start" vAlign="center" style={{ flex: '1.4 1 0', alignSelf: 'stretch' }} />
        <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', gap: S.xs }}>
          <Text type="title" field="valueLabel" style={{ fontWeight: 900 }}>{c.valueLabel}</Text>
          <Text type="caption" field="sub" color={C.inkMuted}>{c.sub}</Text>
        </div>
      </div>

      <div style={{ height: blockH, display: 'flex', flexDirection: 'column', gap: S.sm, paddingTop: off * 0.55 + theme.spacing.sm, minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: S.md, alignItems: 'stretch' }}>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              border: `calc(var(--stroke) * 1.5) dashed ${C.panelInk}`,
              borderRadius: R.md,
              padding: S.sm,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: S.xs,
              color: C.panelInk,
            }}
          >
            <Text type="label" field="codeLabel" style={{ opacity: 0.8 }}>{c.codeLabel}</Text>
            <AutoFitText text={c.code} type="headline" field="code" ltr nowrap weight={900} align="start" vAlign="center" color={C.accent} />
          </div>
          <ImageSlot
            slot="product"
            image={c.images.product}
            label="عکس محصول"
            radius="md"
            borderStrength="stroke"
            style={{ flex: 'none', width: imgSize, height: imgSize, alignSelf: 'center' }}
          />
        </div>
        <Text type="caption" field="deadline" color={C.panelInk} style={{ flex: 'none', paddingTop: S.xs, borderTop: `${STROKE} solid ${C.line}` }}>
          {c.deadline}
        </Text>
        <PageDots tone="onPanel" />
      </div>
    </SlideFrame>
  );
}
