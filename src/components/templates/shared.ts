import type { FieldDef, SlideContent, SlotDef, TemplateId } from '../../types';
import { useSlideCtx } from '../primitives/SlideContext';
import { diagOffset } from '../../utils/style';

/** Static description of a template: used by the Inspector, the slide manager and the exporter. */
export interface TemplateMeta {
  id: TemplateId;
  label: string;
  /** Used in exported file names, e.g. 01-cover.png */
  fileSlug: string;
  description: string;
  fields: FieldDef[];
  slots: SlotDef[];
  defaults: SlideContent;
}

/** Merge hand-edited project content over template defaults so missing keys never crash a template. */
export function withDefaults<T extends object>(content: SlideContent, defaults: SlideContent): T {
  return { ...defaults, ...Object.fromEntries(Object.entries(content).filter(([, v]) => v !== undefined)) } as unknown as T;
}

/** Common layout numbers derived from tokens + canvas size. */
export function useLayout() {
  const { theme, width, height } = useSlideCtx();
  const square = height <= width;
  return {
    width,
    height,
    square,
    safe: theme.canvas.safe,
    off: diagOffset(theme, width),
  };
}
