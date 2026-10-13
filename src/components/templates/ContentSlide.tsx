import type { Pair, SlideContent, TemplateProps } from '../../types';
import { AutoFitBlock, AutoFitText, BrandBar, DiagonalPanel, PageDots, SlideFrame, Text, useSlideCtx } from '../primitives';
import { C, S, STROKE } from '../../utils/style';
import { toFa } from '../../utils/fa';
import type { TemplateMeta } from './shared';
import { useLayout, withDefaults } from './shared';

interface ContentContent {
  kicker: string;
  title: string;
  points: Pair[];
  footnote: string;
}

export const contentMeta: TemplateMeta = {
  id: 'content',
  label: 'محتوا / آموزش',
  fileSlug: 'content',
  description: 'اسلاید آموزشی بدون عکس: تیتر روی پنل و ۳ مرحله شماره‌دار.',
  fields: [
    { key: 'kicker', label: 'برچسب بالای تیتر', kind: 'text', maxChars: 22 },
    { key: 'title', label: 'تیتر', kind: 'textarea', maxChars: 52 },
    { key: 'points', label: 'قانون‌ها / مرحله‌ها', kind: 'pairs', minItems: 2, maxItems: 4, maxChars: 80 },
    { key: 'footnote', label: 'نکته پایانی', kind: 'text', maxChars: 70 },
  ],
  slots: [],
  defaults: {
    kicker: 'راهنمای استایل',
    title: '۳ قانون ست کردن کت با شلوار جین',
    points: [
      { title: 'تیره با روشن، نه هم‌رنگ', text: 'کت سرمه‌ای یا ذغالی را با جین آبی روشن بپوشید تا ست، تخت و بی‌جان دیده نشود.' },
      { title: 'تی‌شرت ساده زیر کت', text: 'رنگ‌های خنثی مثل سفید، کرم یا طوسی؛ همه نگاه‌ها روی فرم کت می‌ماند.' },
      { title: 'کفش، آخرین تصمیم', text: 'کفش چرم قهوه‌ای یا کتانی تمیز سفید، لباس را رسمی یا اسپرت می‌کند.' },
    ],
    footnote: 'ذخیره کنید تا قبل از خرید بعدی دوباره ببینید.',
  },
};

export function ContentSlide({ content }: TemplateProps) {
  const c = withDefaults<ContentContent>(content as SlideContent, contentMeta.defaults);
  const { theme } = useSlideCtx();
  const { height, square, off } = useLayout();
  // Taller panel when the diagonal is steep so the title never collides with the slanted edge.
  const panelFrac = (square ? 0.4 : 0.32) + (off / height) * 0.55;
  const panelPx = height * panelFrac;
  const count = Math.min(c.points.length, 4);

  return (
    <SlideFrame
      bleed={
        <>
          <DiagonalPanel anchor="top" size={panelFrac} extra={theme.spacing.xs * 1.5} tone="accent" zIndex={1} />
          <DiagonalPanel anchor="top" size={panelFrac} tone="panel" zIndex={2} />
        </>
      }
    >
      <BrandBar tone="onPanel" />
      <div style={{ height: panelPx - theme.canvas.safe - theme.type.scale.subtitle.size * 1.7 - off * 0.55, display: 'flex', flexDirection: 'column', gap: S.xs, paddingTop: S.sm, flex: 'none' }}>
        <div style={{ flex: 'none' }}>
          <Text type="label" field="kicker" color={C.accent}>{c.kicker}</Text>
        </div>
        <AutoFitText text={c.title} type="headline" field="title" color={C.panelInk} vAlign="start" />
      </div>
      <div style={{ height: off * 0.55 + theme.spacing.md, flex: 'none' }} />
      <AutoFitBlock type="body" fitKey={JSON.stringify(c.points)} vAlign="center" minRatio={0.55}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55em' }}>
          {c.points.slice(0, 4).map((p, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '0.7em',
                alignItems: 'flex-start',
                paddingBottom: '0.55em',
                borderBottom: i < count - 1 ? `${STROKE} solid ${C.line}` : undefined,
              }}
            >
              <div style={{ flex: 'none', width: '1.5em', fontWeight: 900, fontSize: '2.1em', lineHeight: 1, color: C.accent }}>
                {toFa(i + 1)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div data-field={`points.${i}.title`} style={{ fontWeight: 800, fontSize: '1.12em', lineHeight: 1.4 }}>{p.title}</div>
                <div data-field={`points.${i}.text`} style={{ fontSize: '0.78em', lineHeight: 1.65, color: C.inkMuted }}>{p.text}</div>
              </div>
            </div>
          ))}
        </div>
      </AutoFitBlock>
      <Text type="caption" field="footnote" color={C.inkMuted} style={{ flex: 'none', paddingBlock: S.sm }}>{c.footnote}</Text>
      <PageDots />
    </SlideFrame>
  );
}
