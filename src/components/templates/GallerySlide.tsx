import type { ImageRef, SlideContent, TemplateProps } from '../../types';
import { AutoFitText, BrandBar, ImageSlot, PageDots, SlideFrame, StarIcon, Text, useSlideCtx } from '../primitives';
import { C, S, STROKE } from '../../utils/style';
import { slantClip } from '../../utils/geometry';
import type { TemplateMeta } from './shared';
import { useLayout, withDefaults } from './shared';

interface GalleryContent {
  kicker: string;
  title: string;
  quote: string;
  author: string;
  rating: string;
  ratingLabel: string;
  images: { g1?: ImageRef; g2?: ImageRef; g3?: ImageRef };
}

export const galleryMeta: TemplateMeta = {
  id: 'gallery',
  label: 'گالری / رضایت مشتری',
  fileSlug: 'gallery',
  description: 'موزاییک سه‌عکسه از مشتریان به‌همراه یک نظر و امتیاز.',
  fields: [
    { key: 'kicker', label: 'برچسب', kind: 'text', maxChars: 22 },
    { key: 'title', label: 'تیتر', kind: 'text', maxChars: 36 },
    { key: 'quote', label: 'نظر مشتری', kind: 'textarea', maxChars: 130 },
    { key: 'author', label: 'نام و شهر مشتری', kind: 'text', maxChars: 28 },
    { key: 'rating', label: 'امتیاز (۱ تا ۵)', kind: 'text', maxChars: 3, hint: 'مثلاً ۵ یا ۴.۵' },
    { key: 'ratingLabel', label: 'توضیح امتیاز', kind: 'text', maxChars: 44 },
  ],
  slots: [
    { id: 'g1', label: 'عکس بزرگ مشتری', aspectHint: 'عمودی ۳:۴' },
    { id: 'g2', label: 'عکس مشتری ۲', aspectHint: 'مربع' },
    { id: 'g3', label: 'عکس مشتری ۳', aspectHint: 'مربع' },
  ],
  defaults: {
    kicker: 'مشتری‌های ایران‌پوش',
    title: 'مشتری‌های ما چه می‌گویند',
    quote: 'کت تهران دقیقاً همان‌طور که در عکس بود رسید. سایزش اندازه بود و پارچه‌اش بعد از چند بار پوشیدن هم چروک نشد.',
    author: 'علی رضایی، اصفهان',
    rating: '5',
    ratingLabel: 'میانگین امتیاز از ۲,۴۰۰ نظر ثبت‌شده',
    images: {},
  },
};

function Stars({ value }: { value: number }) {
  return (
    <div style={{ display: 'flex', gap: S.xs, color: C.accent, fontSize: 'var(--t-subtitle-size)' }} dir="ltr">
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < Math.round(value)} />
      ))}
    </div>
  );
}

export function GallerySlide({ content }: TemplateProps) {
  const c = withDefaults<GalleryContent>(content as SlideContent, galleryMeta.defaults);
  const { theme, flip } = useSlideCtx();
  const { height, square, off, safe } = useLayout();
  const mosaicFrac = square ? 0.5 : 0.52;
  const mosaicH = height * mosaicFrac;
  const clip = slantClip('bottom', off, flip);
  const stripe = theme.spacing.xs * 1.5;
  const rating = Number(String(c.rating).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))) || 5;
  const blockH = height - mosaicH - safe + off * 0.35;

  return (
    <SlideFrame
      bleed={
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: mosaicH + stripe, background: C.accent, clipPath: clip }} />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: mosaicH,
              clipPath: clip,
              background: C.bg,
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: S.xs,
            }}
          >
            <ImageSlot slot="g1" image={c.images.g1} label="عکس بزرگ مشتری" style={{ gridRow: '1 / span 2' }} />
            <ImageSlot slot="g2" image={c.images.g2} label="عکس مشتری ۲" />
            <ImageSlot slot="g3" image={c.images.g3} label="عکس مشتری ۳" />
          </div>
        </>
      }
    >
      <BrandBar tone="onImage" meta={c.kicker} />
      <div style={{ flex: 1, minHeight: 0 }} />
      <div style={{ height: blockH, display: 'flex', flexDirection: 'column', gap: S.sm, minHeight: 0, paddingTop: off * 0.6 + theme.spacing.sm }}>
        <Text type="title" field="title" style={{ flex: 'none' }}>{c.title}</Text>
        <AutoFitText text={c.quote} type="subtitle" field="quote" weight={600} vAlign="start" />
        <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.sm, paddingTop: S.xs, borderTop: `${STROKE} solid ${C.line}` }}>
          <div style={{ minWidth: 0 }}>
            <Text type="label" field="author" color={C.accent}>{c.author}</Text>
            <Text type="caption" field="ratingLabel" color={C.inkMuted}>{c.ratingLabel}</Text>
          </div>
          <Stars value={rating} />
        </div>
        <PageDots />
      </div>
    </SlideFrame>
  );
}
