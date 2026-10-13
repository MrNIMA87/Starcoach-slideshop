import { memo, useMemo } from 'react';
import type { Format, Project, Slide } from '../../types';
import { SlideCtx } from '../primitives/SlideContext';
import type { GuideFlags, SlideCtxValue } from '../primitives/SlideContext';
import { resolveTheme, themeHeight } from '../../utils/theme';
import { getTemplate } from './registry';

export interface SlideRendererProps {
  project: Pick<Project, 'brandKit' | 'assets'>;
  slide: Slide;
  index: number;
  total: number;
  format: Format;
  mode: 'edit' | 'export';
  guides?: GuideFlags;
}

/**
 * Renders one slide at its native pixel size (1080 × 1350 or 1080 × 1080).
 * Scaling for the editor is done by the parent with CSS transforms; the exporter renders it 1:1.
 */
export const SlideRenderer = memo(function SlideRenderer({ project, slide, index, total, format, mode, guides }: SlideRendererProps) {
  const { brandKit, assets } = project;
  const baseTheme = useMemo(() => resolveTheme(brandKit), [brandKit]);

  const theme = useMemo(() => {
    const o = slide.overrides?.colors;
    return o && Object.keys(o).length ? { ...baseTheme, colors: { ...baseTheme.colors, ...o } } : baseTheme;
  }, [baseTheme, slide.overrides?.colors]);

  const value: SlideCtxValue = useMemo(
    () => ({
      theme,
      brand: brandKit,
      assets,
      mode,
      format,
      width: theme.canvas.width,
      height: themeHeight(theme, format),
      index,
      total,
      textScale: slide.overrides?.textScale ?? 1,
      flip: !!slide.overrides?.flipDiagonal,
      showBrandBar: !slide.overrides?.hideBrandBar,
      showPageDots: !slide.overrides?.hidePageDots,
      guides,
    }),
    [theme, brandKit, assets, mode, format, index, total, slide.overrides, guides],
  );

  const { Component } = getTemplate(slide.template);
  return (
    <SlideCtx.Provider value={value}>
      <Component content={slide.content} />
    </SlideCtx.Provider>
  );
});
