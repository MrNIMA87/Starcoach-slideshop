import type { BrandKit, ColorKey, DeepPartial, Format, RadiusKey, SpaceKey, Theme, TypeKey } from '../types';
import { DEFAULT_THEME_ID, PRESET_THEMES, findPreset } from '../tokens';

/* ----------------------------- generic helpers ----------------------------- */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Immutable deep merge. Arrays and primitives in `patch` replace the base value. */
export function deepMerge<T>(base: T, patch: DeepPartial<T> | undefined): T {
  if (!patch) return base;
  if (!isPlainObject(base) || !isPlainObject(patch)) return (patch as T) ?? base;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(patch)) {
    const pv = (patch as Record<string, unknown>)[key];
    if (pv === undefined) continue;
    const bv = (base as Record<string, unknown>)[key];
    out[key] = isPlainObject(bv) && isPlainObject(pv) ? deepMerge(bv, pv as DeepPartial<typeof bv>) : pv;
  }
  return out as T;
}

/** Build a nested partial object from a path like ['colors','accent']. */
export function patchFromPath(path: string[], value: unknown): Record<string, unknown> {
  const [head, ...rest] = path;
  if (head === undefined) return {};
  return { [head]: rest.length ? patchFromPath(rest, value) : value };
}

/* ----------------------------- theme resolution ----------------------------- */

export function allThemes(brand: BrandKit): Theme[] {
  return [...PRESET_THEMES, ...brand.customThemes];
}

export function findBaseTheme(brand: BrandKit): Theme {
  return (
    brand.customThemes.find((t) => t.id === brand.themeId) ??
    findPreset(brand.themeId) ??
    (findPreset(DEFAULT_THEME_ID) as Theme)
  );
}

/**
 * Resolve the active theme: base preset/custom theme + live token overrides.
 * Missing keys fall back to the default preset so hand-edited JSON can never crash a template.
 */
export function resolveTheme(brand: BrandKit): Theme {
  const fallback = findPreset(DEFAULT_THEME_ID) as Theme;
  const base = deepMerge(fallback, findBaseTheme(brand) as DeepPartial<Theme>);
  return deepMerge(base, brand.tokenOverrides);
}

export function themeHeight(theme: Theme, format: Format): number {
  return format === 'square' ? theme.canvas.heightSquare : theme.canvas.heightPortrait;
}

/* ----------------------------- CSS variables ----------------------------- */

const COLOR_KEYS: ColorKey[] = [
  'bg', 'bgAlt', 'surface', 'ink', 'inkMuted', 'accent', 'accentInk', 'line', 'panel', 'panelInk', 'onImage', 'scrim',
];
const TYPE_KEYS: TypeKey[] = ['display', 'headline', 'title', 'subtitle', 'body', 'caption', 'label', 'price'];
const SPACE_KEYS: SpaceKey[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const RADIUS_KEYS: RadiusKey[] = ['sm', 'md', 'lg', 'pill'];

export const COLOR_KEY_LIST = COLOR_KEYS;
export const TYPE_KEY_LIST = TYPE_KEYS;
export const SPACE_KEY_LIST = SPACE_KEYS;
export const RADIUS_KEY_LIST = RADIUS_KEYS;

/** Convert a theme into CSS custom properties that every template reads via var(--…). */
export function themeToCssVars(theme: Theme, textScale = 1): Record<string, string> {
  const v: Record<string, string> = {};
  for (const k of COLOR_KEYS) v[`--c-${k}`] = theme.colors[k];
  for (const k of TYPE_KEYS) {
    const t = theme.type.scale[k];
    v[`--t-${k}-size`] = `${t.size * textScale}px`;
    v[`--t-${k}-weight`] = String(t.weight);
    v[`--t-${k}-lh`] = String(t.lineHeight);
  }
  for (const k of SPACE_KEYS) v[`--s-${k}`] = `${theme.spacing[k]}px`;
  for (const k of RADIUS_KEYS) v[`--r-${k}`] = `${theme.radius[k]}px`;
  v['--font'] = theme.type.fontFamily;
  v['--stroke'] = `${theme.motif.strokeWidth}px`;
  v['--pattern-opacity'] = String(theme.motif.patternOpacity);
  v['--safe'] = `${theme.canvas.safe}px`;
  return v;
}
