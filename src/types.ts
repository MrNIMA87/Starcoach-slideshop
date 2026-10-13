/**
 * Shared type definitions: design tokens (Theme), project schema (project.json) and template contracts.
 * The project schema is versioned (`schemaVersion`) so old exports can be migrated in utils/project.ts.
 */

export type Format = 'portrait' | 'square';

export type TypeKey =
  | 'display'
  | 'headline'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'caption'
  | 'label'
  | 'price';

export type ColorKey =
  | 'bg'
  | 'bgAlt'
  | 'surface'
  | 'ink'
  | 'inkMuted'
  | 'accent'
  | 'accentInk'
  | 'line'
  | 'panel'
  | 'panelInk'
  | 'onImage'
  | 'scrim';

export type SpaceKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type RadiusKey = 'sm' | 'md' | 'lg' | 'pill';

export interface TypeToken {
  size: number;
  weight: number;
  lineHeight: number;
}

/** A complete set of design tokens. Every visual value in a template must come from here. */
export interface Theme {
  id: string;
  name: string;
  description: string;
  canvas: {
    width: number;
    heightPortrait: number;
    heightSquare: number;
    /** Safe margin (px) kept free of text on every side. */
    safe: number;
  };
  colors: Record<ColorKey, string>;
  type: {
    fontFamily: string;
    scale: Record<TypeKey, TypeToken>;
  };
  radius: Record<RadiusKey, number>;
  spacing: Record<SpaceKey, number>;
  motif: {
    panelStyle: 'diagonal' | 'block';
    /** Angle (deg) of the signature diagonal cut. Ignored when panelStyle is "block". */
    diagonalAngle: number;
    dotStyle: 'pill' | 'circle' | 'bar';
    pattern: 'none' | 'stripes' | 'dots' | 'diamonds';
    patternOpacity: number;
    strokeWidth: number;
  };
}

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/* ----------------------------- Project schema ----------------------------- */

export interface Asset {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export interface ImageRef {
  assetId: string;
  /** Focal point in percent (0-100). */
  fx: number;
  fy: number;
  /** 1 = cover fit, >1 zooms in around the focal point. */
  zoom: number;
}

export interface Pair {
  title: string;
  text: string;
}

export type ContentValue =
  | string
  | number
  | boolean
  | string[]
  | Pair[]
  | Record<string, ImageRef>
  | undefined;

export interface SlideContent {
  [key: string]: ContentValue;
  /** Uploaded images keyed by slot id (slots are declared per template). */
  images?: Record<string, ImageRef>;
}

export type TemplateId =
  | 'cover'
  | 'product'
  | 'feature'
  | 'sale'
  | 'content'
  | 'gallery'
  | 'cta';

export interface SlideOverrides {
  /** Per-slide colour overrides on top of the active theme. */
  colors?: Partial<Record<ColorKey, string>>;
  /** Multiplier applied to every type size on this slide (0.8 - 1.25). */
  textScale?: number;
  /** Mirror the diagonal cuts. */
  flipDiagonal?: boolean;
  hideBrandBar?: boolean;
  hidePageDots?: boolean;
}

export interface Slide {
  id: string;
  template: TemplateId;
  content: SlideContent;
  overrides: SlideOverrides;
}

export interface BrandKit {
  name: string;
  nameLatin: string;
  website: string;
  handle: string;
  logoAssetId: string | null;
  /** Active preset or custom theme id. */
  themeId: string;
  /** Live token edits layered on top of the active theme. */
  tokenOverrides: DeepPartial<Theme>;
  customThemes: Theme[];
}

export interface Project {
  schemaVersion: 1;
  name: string;
  createdAt: string;
  updatedAt: string;
  brandKit: BrandKit;
  assets: Record<string, Asset>;
  slides: Slide[];
}

/* ----------------------------- Template contracts ----------------------------- */

export type FieldKind = 'text' | 'textarea' | 'list' | 'pairs';

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  /** Recommended max characters (soft limit, shown as counter). */
  maxChars?: number;
  /** For list / pairs: min and max item counts. */
  minItems?: number;
  maxItems?: number;
  /** Direction override for Latin-only values such as URLs and coupon codes. */
  ltr?: boolean;
}

export interface SlotDef {
  id: string;
  label: string;
  /** Human readable aspect hint, e.g. "۴:۵ عمودی". */
  aspectHint: string;
}

export interface TemplateProps {
  content: SlideContent;
}
