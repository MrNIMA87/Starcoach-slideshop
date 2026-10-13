import type { ImageRef, SlideContent, TemplateProps } from '../../types';
import { AutoFitText, BrandBar, CheckIcon, ImageSlot, PageDots, SlideFrame, Text, useSlideCtx } from '../primitives';
import { C, R, S, STROKE } from '../../utils/style';
import { slantClip } from '../../utils/geometry';
import type { TemplateMeta } from './shared';
import { useLayout, withDefaults } from './shared';

interface ProductContent {
  badge: string;
  name: string;
  price: string;
  currency: string;
  oldPrice: string;
  features: string[];
  images: { product?: ImageRef };
}

export const productMeta: TemplateMeta = {
  id: 'product',
  label: 'محصول',
  fileSlug: 'product',
  description: 'معرفی یک محصول با عکس بزرگ، نام، قیمت و ۴ ویژگی کوتاه.',
  fields: [
    { key: 'badge', label: 'نشان (مثلاً پرفروش)', kind: 'text', maxChars: 16 },
    { key: 'name', label: 'نام محصول', kind: 'textarea', maxChars: 40 },
    { key: 'price', label: 'قیمت', kind: 'text', maxChars: 14, hint: 'ارقام فارسی، مثل ۲,۹۸۰,۰۰۰' },
    { key: 'currency', label: 'واحد پول', kind: 'text', maxChars: 10 },
    { key: 'oldPrice', label: 'قیمت قبل از تخفیف (اختیاری)', kind: 'text', maxChars: 14 },
    { key: 'features', label: 'ویژگی‌ها', kind: 'list', minItems: 2, maxItems: 4, maxChars: 34 },
  ],
  slots: [{ id: 'product', label: 'عکس محصول', aspectHint: 'عمودی ۴:۵ یا مربع — محصول وسط کادر' }],
  defaults: {
    badge: 'پرفروش پاییز',
    name: 'کت اسپرت مدل تهران',
    price: '۲,۹۸۰,۰۰۰',
    currency: 'تومان',
    oldPrice: '۳,۸۵۰,۰۰۰',
    features: ['پارچه تترون ضدچروک', 'آستر کامل و دوخت تمیز', 'سایز ۴۶ تا ۵۸', 'ارسال رایگان به سراسر ایران'],
    images: {},
  },
};

export function ProductSlide({ content }: TemplateProps) {
  const c = withDefaults<ProductContent>(content as SlideContent, productMeta.defaults);
  const { theme, flip } = useSlideCtx();
  const { height, square, off } = useLayout();
  const imgFrac = square ? 0.5 : 0.56;
  const imgH = height * imgFrac;
  const clip = slantClip('bottom', off, flip);
  const stripe = theme.spacing.xs * 1.5;

  return (
    <SlideFrame
      bleed={
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: imgH + stripe, background: C.accent, clipPath: clip }} />
          <ImageSlot
            slot="product"
            image={c.images.product}
            label="عکس محصول"
            clipPath={clip}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: imgH }}
          />
        </>
      }
    >
      <BrandBar tone="onImage" meta={c.badge} />
      <div style={{ flex: 1, minHeight: 0 }} />
      <div style={{ height: height - imgH - theme.canvas.safe + off * 0.35, display: 'flex', flexDirection: 'column', gap: S.sm, minHeight: 0 }}>
        <AutoFitText text={c.name} type="headline" field="name" vAlign="end" />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: S.sm, flex: 'none' }}>
          <Text type="price" field="price" color={C.accent} style={{ fontSize: `calc(var(--t-price-size) * ${square ? 0.62 : 0.8})` }}>
            {c.price}
          </Text>
          <Text type="subtitle" field="currency" color={C.ink}>{c.currency}</Text>
          {c.oldPrice && (
            <Text type="caption" field="oldPrice" color={C.inkMuted} style={{ textDecoration: 'line-through', marginInlineStart: 'auto' }}>
              {c.oldPrice}
            </Text>
          )}
        </div>
        <div
          style={{
            flex: 'none',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            alignContent: 'start',
            columnGap: S.sm,
            rowGap: S.xs,
            borderTop: `${STROKE} solid ${C.line}`,
            paddingTop: S.sm,
          }}
        >
          {c.features.slice(0, 4).map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: S.xs, minWidth: 0 }}>
              <span
                style={{
                  flex: 'none',
                  width: '1.5em',
                  height: '1.5em',
                  marginTop: '0.15em',
                  borderRadius: R.sm,
                  background: C.accent,
                  color: C.accentInk,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 'var(--t-caption-size)',
                }}
              >
                <CheckIcon size="0.95em" />
              </span>
              <Text type="caption" field={`features.${i}`} style={{ minWidth: 0 }}>{f}</Text>
            </div>
          ))}
        </div>
        <PageDots />
      </div>
    </SlideFrame>
  );
}
