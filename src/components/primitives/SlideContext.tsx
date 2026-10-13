import { createContext, useContext } from 'react';
import type { Asset, BrandKit, Format, Theme } from '../../types';

export interface GuideFlags {
  safe: boolean;
  center: boolean;
  thirds: boolean;
  squareCrop: boolean;
  gridCrop: boolean;
}

export interface SlideCtxValue {
  theme: Theme;
  brand: BrandKit;
  assets: Record<string, Asset>;
  /** "edit": live editor (placeholders show hints). "export": clean render for PNG. */
  mode: 'edit' | 'export';
  format: Format;
  width: number;
  height: number;
  index: number;
  total: number;
  textScale: number;
  flip: boolean;
  showBrandBar: boolean;
  showPageDots: boolean;
  guides?: GuideFlags;
}

export const SlideCtx = createContext<SlideCtxValue | null>(null);

export function useSlideCtx(): SlideCtxValue {
  const v = useContext(SlideCtx);
  if (!v) throw new Error('useSlideCtx must be used inside <SlideRenderer>');
  return v;
}
