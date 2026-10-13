import type { ImageRef, Pair, SlideContent, TemplateProps } from '../../types';
import { AutoFitBlock, AutoFitText, BrandBar, ImageSlot, PageDots, SlideFrame, Text, useSlideCtx } from '../primitives';
import { C, R, S, STROKE } from '../../utils/style';
import { slantClip } from '../../utils/geometry';
import type { TemplateMeta } from './shared';
import { useLayout, withDefaults } from './shared';

interface FeatureContent {
  kicker: string;
  title: string;
  points: Pair[];
  images: { detail?: ImageRef };
}

export const featureMeta: TemplateMeta = {
  id: 'feature',
  label: 'ویژگی‌ها',
  fileSlug: 'feature',
  description: 'تصویر نزدیک (دوخت، پارچه) در کنار ۳ تا ۴ ویژگی با توضیح کوتاه.',
  fields: [
    { key: 'kicker', label: 'برچسب بالای تیتر', kind: 'text', maxChars: 22 },
    { key: 'title', label: 'تیتر', kind: 'textarea', maxChars: 40 },
    { key: 'points', label: 'ویژگی‌ها', kind: 'pairs', minItems: 2, maxItems: 4, maxChars: 60 },
  ],
  slots: [{ id: 'detail', label: 'عکس نزدیک (جزئیات پارچه یا دوخت)', aspectHint: 'عمودی ۳:۴ — جزئیات در مرکز' }],
  defaults: {
    kicker: 'جزئیات که فرق می‌گذارد',
    title: 'چرا کت تهران؟',
    points: [
      { title: 'پارچه تترون ایتالیایی', text: 'سبک، ضدچروک و مناسب پاییز و زمستان' },
      { title: 'آستر کامل', text: 'نرم روی تن و بدون خارش، حتی با پیراهن نازک' },
      { title: 'دوخت دست‌دوز یقه', text: 'فرم یقه بعد از ماه‌ها استفاده هم حفظ می‌شود' },
      { title: 'سایزبندی دقیق', text: 'از ۴۶ تا ۵۸ با جدول سایز مخصوص' },
    ],
    images: {},
  },
};

export function FeatureSlide({ content }: TemplateProps) {
  const c = withDefaults<FeatureContent>(content as SlideContent, featureMeta.defaults);
  const { theme, width, flip } = useSlideCtx();
  const { square, off, safe } = useLayout();
  const imgFrac = square ? 0.36 : 0.4;
  const imgW = width * imgFrac;
  const clip = slantClip('right', off * 0.8, flip);
  const stripe = theme.spacing.xs * 1.5;
  // Text column is pushed away from the image side (left in RTL).
  const colPadLeft = Math.max(0, imgW - safe) + theme.spacing.md;

  return (
    <SlideFrame
      bleed={
        <>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: imgW + stripe, background: C.accent, clipPath: clip }} />
          <ImageSlot
            slot="detail"
            image={c.images.detail}
            label="عکس نزدیک از جزئیات"
            clipPath={clip}
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: imgW }}
          />
        </>
      }
    >
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', paddingLeft: colPadLeft, gap: S.md }}>
        <BrandBar meta=" " />
        <div style={{ flex: 'none' }}>
          <Text type="label" field="kicker" color={C.accent}>{c.kicker}</Text>
        </div>
        <AutoFitText text={c.title} type="headline" field="title" boxHeight={theme.type.scale.headline.size * theme.type.scale.headline.lineHeight * 2.05} vAlign="start" />
        <AutoFitBlock type="body" fitKey={JSON.stringify(c.points)} vAlign="start" minRatio={0.55}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7em' }}>
            {c.points.slice(0, 4).map((p, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: '0.6em',
                  alignItems: 'flex-start',
                  paddingBottom: '0.6em',
                  borderBottom: i < Math.min(c.points.length, 4) - 1 ? `${STROKE} solid ${C.line}` : undefined,
                }}
              >
                <span
                  aria-hidden
                  style={{
                    flex: 'none',
                    width: '0.55em',
                    height: '0.55em',
                    marginTop: '0.55em',
                    background: C.accent,
                    transform: 'rotate(45deg)',
                    borderRadius: R.sm,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div data-field={`points.${i}.title`} style={{ fontWeight: 800, fontSize: '1.1em', lineHeight: 1.4 }}>{p.title}</div>
                  <div data-field={`points.${i}.text`} style={{ fontSize: '0.8em', lineHeight: 1.6, color: C.inkMuted }}>{p.text}</div>
                </div>
              </div>
            ))}
          </div>
        </AutoFitBlock>
        <PageDots />
      </div>
    </SlideFrame>
  );
}
