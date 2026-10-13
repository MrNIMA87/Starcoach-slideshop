import type { CSSProperties, ReactNode } from 'react';
import type { CutEdge } from '../../utils/geometry';
import { oppositeEdge, slantClip } from '../../utils/geometry';
import { diagOffset } from '../../utils/style';
import { C } from '../../utils/style';
import { useSlideCtx } from './SlideContext';

export type PanelTone = 'panel' | 'accent' | 'surface' | 'bg' | 'bgAlt' | 'ink';

const TONE: Record<PanelTone, string> = {
  panel: C.panel,
  accent: C.accent,
  surface: C.surface,
  bg: C.bg,
  bgAlt: C.bgAlt,
  ink: C.ink,
};

export interface DiagonalPanelProps {
  /** Edge of the slide the panel is anchored to. The OPPOSITE edge receives the diagonal cut. */
  anchor: 'top' | 'bottom' | 'left' | 'right';
  /** Panel thickness as a fraction (0-1) of the slide height (top/bottom) or width (left/right). */
  size: number;
  tone?: PanelTone;
  /** Extra px added to the thickness (used for accent "stripe" layers behind a panel). */
  extra?: number;
  children?: ReactNode;
  style?: CSSProperties;
  zIndex?: number;
}

/**
 * Signature brand motif: a full-bleed block with one slanted edge.
 * Angle comes from theme.motif.diagonalAngle (0 when panelStyle = "block").
 * Stack two panels (accent behind, panel in front, `extra` larger) to get the stripe effect.
 */
export function DiagonalPanel({ anchor, size, tone = 'panel', extra = 0, children, style, zIndex = 1 }: DiagonalPanelProps) {
  const { theme, width, height, flip } = useSlideCtx();
  const off = diagOffset(theme, width);
  const horizontal = anchor === 'top' || anchor === 'bottom';
  const thickness = (horizontal ? height : width) * size + extra;
  const cut: CutEdge = oppositeEdge(anchor);

  const pos: CSSProperties = horizontal
    ? { left: 0, right: 0, [anchor]: 0, height: thickness }
    : { top: 0, bottom: 0, [anchor]: 0, width: thickness };

  return (
    <div
      aria-hidden={children ? undefined : true}
      style={{
        position: 'absolute',
        ...pos,
        background: TONE[tone],
        clipPath: slantClip(cut, off, flip),
        zIndex,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
