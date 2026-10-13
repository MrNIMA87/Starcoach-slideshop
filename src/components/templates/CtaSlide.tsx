import type { ImageRef, SlideContent, TemplateProps } from '../../types';
import {
  AutoFitText, BookmarkIcon, BrandBar, DoubleChevronLeft, ImageSlot, PageDots, SendIcon, SlideFrame, Text, UserPlusIcon, useSlideCtx,
} from '../primitives';
import { C, R, S } from '../../utils/style';
import { slantClip } from '../../utils/geometry';
import type { TemplateMeta } from './shared';
import { useLayout, withDefaults } from './shared';

interface CtaContent {
  kicker: string;
  title: string;
  body: string;
  buttonLabel: string;
  url: string;
  handle: string;
  actions: string[];
  images: { hero?: ImageRef };
}

export const ctaMeta: TemplateMeta = {
  id: 'cta',
  label: 'فراخوان (CTA)',
  fileSlug: 'cta',
  description: 'اسلاید آخر: دعوت به اقدام، دکمه با آدرس سایت و سه اقدام کوتاه.',
  fields: [
    { key: 'kicker', label: 'برچسب', kind: 'text', maxChars: 22 },
    { key: 'title', label: 'تیتر', kind: 'textarea', maxChars: 44 },
    { key: 'body', label: 'توضیح', kind: 'textarea', maxChars: 110 },
    { key: 'buttonLabel', label: 'متن دکمه', kind: 'text', maxChars: 18 },
    { key: 'url', label: 'آدرس سایت', kind: 'text', maxChars: 30, ltr: true },
    { key: 'handle', label: 'آی‌دی اینستاگرام', kind: 'text', maxChars: 24, ltr: true },
    { key: 'actions', label: 'اقدام‌ها (ذخیره، ارسال، دنبال کردن)', kind: 'list', minItems: 0, maxItems: 3, maxChars: 20 },
  ],
  slots: [{ id: 'hero', label: 'عکس پایانی (مدل یا محصول)', aspectHint: 'عمودی ۴:۵' }],
  defaults: {
    kicker: 'همین حالا سفارش بدهید',
    title: 'کالکشن پاییزه را از دست ندهید',
    body: 'ارسال رایگان به سراسر ایران، تعویض تا ۷ روز و پرداخت امن.',
    buttonLabel: 'خرید آنلاین',
    url: 'www.iranpoosh.ir',
    handle: '@iranpoosh',
    actions: ['ذخیره کنید', 'برای دوستتان بفرستید', 'ما را دنبال کنید'],
    images: {},
  },
};

const ACTION_ICONS = [BookmarkIcon, SendIcon, UserPlusIcon];

export function CtaSlide({ content }: TemplateProps) {
  const c = withDefaults<CtaContent>(content as SlideContent, ctaMeta.defaults);
  const { theme, flip } = useSlideCtx();
  const { height, square, off, safe } = useLayout();
  const imgFrac = square ? 0.3 : 0.36;
  const imgH = height * imgFrac;
  // Mirrored slant (opposite of the other image slides) gives the closing slide its own rhythm.
  const clip = slantClip('bottom', off, !flip);
  const stripe = theme.spacing.xs * 1.5;
  const blockH = height - imgH - safe + off * 0.3;

  return (
    <SlideFrame
      bleed={
        <>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: imgH + stripe, background: C.accent, clipPath: clip }} />
          <ImageSlot slot="hero" image={c.images.hero} label="عکس پایانی" clipPath={clip} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: imgH }} />
        </>
      }
    >
      <BrandBar tone="onImage" meta={c.handle} />
      <div style={{ flex: 1, minHeight: 0 }} />
      <div style={{ height: blockH, display: 'flex', flexDirection: 'column', gap: S.sm, minHeight: 0, paddingTop: off * 0.3 + stripe + theme.spacing.sm }}>
        <Text type="label" field="kicker" color={C.accent} style={{ flex: 'none' }}>{c.kicker}</Text>
        <AutoFitText text={c.title} type="headline" field="title" vAlign="start" />
        <Text type="body" field="body" color={C.inkMuted} style={{ flex: 'none', maxHeight: '3.6em', overflow: 'hidden' }}>{c.body}</Text>
        <div
          style={{
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: S.sm,
            background: C.accent,
            color: C.accentInk,
            borderRadius: R.md,
            padding: `${S.sm} ${S.md}`,
          }}
        >
          <Text type="title" field="buttonLabel" style={{ fontWeight: 900 }}>{c.buttonLabel}</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: S.xs, minWidth: 0 }}>
            <Text type="subtitle" field="url" ltr style={{ fontWeight: 800 }}>{c.url}</Text>
            <DoubleChevronLeft size="var(--t-subtitle-size)" />
          </div>
        </div>
        <div style={{ flex: 'none', display: 'flex', gap: S.xs, flexWrap: 'wrap' }}>
          {c.actions.slice(0, 3).map((a, i) => {
            const Icon = ACTION_ICONS[i] ?? BookmarkIcon;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: S.xs,
                  padding: `${S.xs} ${S.sm}`,
                  border: `var(--stroke) solid ${C.line}`,
                  borderRadius: R.pill,
                  color: C.ink,
                }}
              >
                <Icon size="var(--t-caption-size)" />
                <Text type="caption" field={`actions.${i}`}>{a}</Text>
              </div>
            );
          })}
        </div>
        <PageDots />
      </div>
    </SlideFrame>
  );
}
