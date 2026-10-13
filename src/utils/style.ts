import type { CSSProperties } from 'react';
import type { RadiusKey, SpaceKey, Theme, TypeKey } from '../types';

/**
 * Token accessors for templates. Templates must NEVER contain raw colours or pixel sizes;
 * they reference these CSS-variable strings (set on the slide root by SlideFrame).
 */
export const C = {
  bg: 'var(--c-bg)',
  bgAlt: 'var(--c-bgAlt)',
  surface: 'var(--c-surface)',
  ink: 'var(--c-ink)',
  inkMuted: 'var(--c-inkMuted)',
  accent: 'var(--c-accent)',
  accentInk: 'var(--c-accentInk)',
  line: 'var(--c-line)',
  panel: 'var(--c-panel)',
  panelInk: 'var(--c-panelInk)',
  onImage: 'var(--c-onImage)',
  scrim: 'var(--c-scrim)',
} as const;

export const S: Record<SpaceKey, string> = {
  xs: 'var(--s-xs)',
  sm: 'var(--s-sm)',
  md: 'var(--s-md)',
  lg: 'var(--s-lg)',
  xl: 'var(--s-xl)',
};

export const R: Record<RadiusKey, string> = {
  sm: 'var(--r-sm)',
  md: 'var(--r-md)',
  lg: 'var(--r-lg)',
  pill: 'var(--r-pill)',
};

export const STROKE = 'var(--stroke)';

/** CSS for a type token. Sizes carry the per-slide text scale through the --t-*-size variables. */
export function typeCss(key: TypeKey): CSSProperties {
  return {
    fontSize: `var(--t-${key}-size)`,
    fontWeight: `var(--t-${key}-weight)` as unknown as number,
    lineHeight: `var(--t-${key}-lh)`,
  };
}

/** Numeric size in px for a type token (needed by AutoFitText for measuring). */
export function typeSize(theme: Theme, key: TypeKey, textScale: number): number {
  return theme.type.scale[key].size * textScale;
}

/** Skew in px of the signature diagonal cut for a given canvas width. */
export function diagOffset(theme: Theme, width: number): number {
  if (theme.motif.panelStyle === 'block') return 0;
  return Math.round(Math.tan((theme.motif.diagonalAngle * Math.PI) / 180) * width);
}
