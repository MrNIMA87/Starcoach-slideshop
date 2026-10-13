import type { ImageRef, SlideContent, TemplateProps } from '../../types';
import { AutoFitText, BrandBar, DiagonalPanel, ImageSlot, PageDots, SlideFrame, Text, useSlideCtx } from '../primitives';
import { C, R, S } from '../../utils/style';
import type { TemplateMeta } from './shared';
import { useLayout, withDefaults } from './shared';

interface CoverContent {
  kicker: string;
  title: string;
  subtitle: string;
  season: string;
  images: { hero?: ImageRef };
}

export const coverMeta: TemplateMeta = {
  id: 'cover',
  label: 'کاور',
  fileSlug: 'cover',
  description: 'اسلاید اول: عکس تمام‌صفحه با پنل مورب و تیتر بسیار درشت.',
  fields: [
    { key: 'kicker', label: 'برچسب بالای تیتر', kind: 'text', maxChars: 24 },
    { key: 'title', label: 'تیتر اصلی', kind: 'textarea', maxChars: 48, hint: 'با Enter خط جدید بسازید' },
    { key: 'subtitle', label: 'زیرتیتر', kind: 'textarea', maxChars: 90 },
    { key: 'season', label: 'متن گوشه (فصل/سال)', kind: 'text', maxChars: 24 },
  ],
  slots: [{ id: 'hero', label: 'عکس اصلی کاور (مدل یا محصول)', aspectHint: 'عمودی ۴:۵ — سوژه در نیمه بالایی' }],
  defaults: {
    kicker: 'کالکشن جدید',
    title: 'کالکشن پاییزه مردانه جدید',
    subtitle: 'کت، پالتو و ژاکت‌هایی که برای سرمای ایران دوخته شده‌اند.',
    season: 'پاییز ۱۴۰۵',
    images: {},
  },
};

export function CoverSlide({ content }: TemplateProps) {
  const c = withDefaults<CoverContent>(content as SlideContent, coverMeta.defaults);
  const { theme } = useSlideCtx();
  const { height, square, safe, off } = useLayout();

  // Panel covers the lower part of the slide; the text block starts where the panel starts.
  const panelFrac = square ? 0.56 : 0.5;
  const panelPx = height * panelFrac;
  const blockH = panelPx - safe;
  const topPad = off * 0.55 + theme.spacing.sm;

  return (
    <SlideFrame
      bleed={
        <>
          <ImageSlot slot="hero" image={c.images.hero} label="عکس اصلی کاور" style={{ position: 'absolute', inset: 0 }} />
          <DiagonalPanel anchor="bottom" size={panelFrac} extra={theme.spacing.xs * 1.5} tone="accent" zIndex={1} />
          <DiagonalPanel anchor="bottom" size={panelFrac} tone="panel" zIndex={2} />
        </>
      }
    >
      <BrandBar tone="onImage" meta={c.season} />
      <div style={{ flex: 1 }} />
      <div style={{ height: blockH, display: 'flex', flexDirection: 'column', paddingTop: topPad, gap: S.sm, minHeight: 0 }}>
        <div style={{ display: 'flex', flex: 'none' }}>
          <Text
            type="label"
            field="kicker"
            color={C.accentInk}
            style={{ background: C.accent, padding: `${S.xs} ${S.sm}`, borderRadius: R.sm }}
          >
            {c.kicker}
          </Text>
        </div>
        <AutoFitText text={c.title} type="display" field="title" color={C.panelInk} vAlign="center" />
        <Text type="subtitle" field="subtitle" color={C.panelInk} style={{ opacity: 0.8, flex: 'none', maxHeight: '3.2em', overflow: 'hidden' }}>
          {c.subtitle}
        </Text>
        <PageDots />
      </div>
    </SlideFrame>
  );
}
