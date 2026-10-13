import type { CSSProperties, ReactNode } from 'react';
import { themeToCssVars } from '../../utils/theme';
import { useSlideCtx } from './SlideContext';
import { C } from '../../utils/style';

export interface SlideFrameProps {
  /** Full-bleed layers (images, diagonal panels). Rendered edge-to-edge behind the content. */
  bleed?: ReactNode;
  /** Content laid out as a flex column INSIDE the safe margin. */
  children: ReactNode;
}

function Pattern() {
  const { theme } = useSlideCtx();
  const { pattern, diagonalAngle, panelStyle } = theme.motif;
  if (pattern === 'none' || theme.motif.patternOpacity <= 0) return null;
  const angle = panelStyle === 'block' ? 0 : diagonalAngle;
  let backgroundImage = '';
  let backgroundSize: string | undefined;

  if (pattern === 'stripes') {
    backgroundImage = `repeating-linear-gradient(${180 - angle}deg, ${C.ink} 0, ${C.ink} var(--stroke), transparent var(--stroke), transparent var(--s-md))`;
  } else if (pattern === 'dots') {
    backgroundImage = `radial-gradient(circle, ${C.ink} calc(var(--stroke) * 0.7), transparent calc(var(--stroke) * 0.7 + 0.6px))`;
    backgroundSize = 'var(--s-md) var(--s-md)';
  } else {
    backgroundImage = [
      `repeating-linear-gradient(45deg, ${C.ink} 0, ${C.ink} calc(var(--stroke) * 0.5), transparent calc(var(--stroke) * 0.5), transparent var(--s-lg))`,
      `repeating-linear-gradient(-45deg, ${C.ink} 0, ${C.ink} calc(var(--stroke) * 0.5), transparent calc(var(--stroke) * 0.5), transparent var(--s-lg))`,
    ].join(',');
  }

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage,
        backgroundSize,
        opacity: 'var(--pattern-opacity)' as unknown as number,
        pointerEvents: 'none',
      }}
    />
  );
}

function Guides() {
  const { guides, width, height, theme } = useSlideCtx();
  if (!guides) return null;
  const safe = theme.canvas.safe;
  const line = '2px dashed rgba(255, 70, 160, 0.95)';
  const box: CSSProperties = { position: 'absolute', pointerEvents: 'none' };
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none' }}>
      {guides.safe && (
        <div style={{ ...box, inset: safe, border: line }} />
      )}
      {guides.center && (
        <>
          <div style={{ ...box, left: width / 2, top: 0, bottom: 0, borderLeft: '2px solid rgba(0, 210, 255, 0.9)' }} />
          <div style={{ ...box, top: height / 2, left: 0, right: 0, borderTop: '2px solid rgba(0, 210, 255, 0.9)' }} />
        </>
      )}
      {guides.thirds &&
        [1, 2].map((i) => (
          <div key={i}>
            <div style={{ ...box, left: (width / 3) * i, top: 0, bottom: 0, borderLeft: '2px dotted rgba(255, 200, 0, 0.95)' }} />
            <div style={{ ...box, top: (height / 3) * i, left: 0, right: 0, borderTop: '2px dotted rgba(255, 200, 0, 0.95)' }} />
          </div>
        ))}
      {guides.squareCrop && height > width && (
        <div style={{ ...box, left: 0, right: 0, top: (height - width) / 2, height: width, border: '2px solid rgba(120, 255, 120, 0.95)' }} />
      )}
      {guides.gridCrop && (
        <div
          style={{
            ...box,
            top: 0,
            bottom: 0,
            left: Math.max(0, (width - (height * 3) / 4) / 2),
            right: Math.max(0, (width - (height * 3) / 4) / 2),
            border: '2px solid rgba(180, 140, 255, 0.95)',
          }}
        />
      )}
    </div>
  );
}

/**
 * The slide canvas: 1080 wide (1350 portrait / 1080 square), RTL, with themed CSS variables,
 * an optional background pattern and a safe-margin content area.
 * `[data-slide-root]` is what the exporter captures.
 */
export function SlideFrame({ bleed, children }: SlideFrameProps) {
  const { theme, width, height, textScale } = useSlideCtx();
  const vars = themeToCssVars(theme, textScale) as CSSProperties;
  return (
    <div
      data-slide-root
      dir="rtl"
      style={{
        ...vars,
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        background: C.bg,
        color: C.ink,
        fontFamily: 'var(--font)',
        direction: 'rtl',
        isolation: 'isolate',
      }}
    >
      <Pattern />
      {bleed}
      <div
        style={{
          position: 'absolute',
          inset: theme.canvas.safe,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {children}
      </div>
      <Guides />
    </div>
  );
}
