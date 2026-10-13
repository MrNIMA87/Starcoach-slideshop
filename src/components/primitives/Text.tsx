import type { CSSProperties, ReactNode } from 'react';
import type { TypeKey } from '../../types';
import { typeCss } from '../../utils/style';

export interface TextProps {
  /** Type-scale token. All sizes / weights / line-heights come from the active theme. */
  type: TypeKey;
  children?: ReactNode;
  /** Inspector field path (enables click-to-edit in the live canvas). */
  field?: string;
  color?: string;
  align?: 'start' | 'center' | 'end';
  /** Force LTR (URLs, coupon codes). */
  ltr?: boolean;
  style?: CSSProperties;
}

/** Plain themed text. Use AutoFitText for anything whose length can vary. */
export function Text({ type, children, field, color, align, ltr, style }: TextProps) {
  return (
    <div
      data-field={field}
      style={{
        ...typeCss(type),
        color,
        textAlign: align,
        direction: ltr ? 'ltr' : undefined,
        unicodeBidi: ltr ? 'isolate' : undefined,
        whiteSpace: 'pre-line',
        overflowWrap: 'anywhere',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
