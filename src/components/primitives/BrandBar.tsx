import type { CSSProperties } from 'react';
import { C, typeCss } from '../../utils/style';
import { useSlideCtx } from './SlideContext';

const HAS_PERSIAN = /[\u0600-\u06FF]/;

export interface BrandBarProps {
  /** "onImage" switches ink to theme.colors.onImage and adds a legibility scrim behind the bar. */
  tone?: 'default' | 'onImage' | 'onPanel';
  /** Short text on the opposite side (defaults to the Latin brand name). */
  meta?: string;
}

/** Brand mark + wordmark row. Keeps every slide of the carousel visibly one family. */
export function BrandBar({ tone = 'default', meta }: BrandBarProps) {
  const { brand, assets, showBrandBar, theme } = useSlideCtx();
  const color = tone === 'onImage' ? C.onImage : tone === 'onPanel' ? C.panelInk : C.ink;
  const logo = brand.logoAssetId ? assets[brand.logoAssetId] : undefined;
  const side = meta ?? brand.nameLatin;
  const persianSide = HAS_PERSIAN.test(side);
  const markH = `calc(var(--t-label-size) * 1.3)`;
  const skew = `skewX(-${Math.max(8, theme.motif.panelStyle === 'block' ? 0 : theme.motif.diagonalAngle * 2)}deg)`;

  const sideStyle: CSSProperties = {
    ...typeCss('label'),
    fontWeight: 700,
    opacity: 0.85,
    letterSpacing: persianSide ? undefined : '0.22em',
    direction: persianSide ? 'rtl' : 'ltr',
  };

  return (
    <div
      style={{
        position: 'relative',
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color,
        visibility: showBrandBar ? 'visible' : 'hidden',
        zIndex: 3,
      }}
    >
      {tone === 'onImage' && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: `calc(var(--safe) * -1)`,
            left: `calc(var(--safe) * -1)`,
            right: `calc(var(--safe) * -1)`,
            height: `calc(var(--safe) * 2 + var(--t-subtitle-size) * 1.6)`,
            background: `linear-gradient(to bottom, ${C.scrim}, transparent)`,
            zIndex: -1,
          }}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-sm)' }}>
        {logo ? (
          <img
            src={logo.dataUrl}
            alt=""
            style={{ height: `calc(var(--t-subtitle-size) * 1.3)`, width: 'auto', display: 'block' }}
          />
        ) : (
          <>
            <div
              aria-hidden
              style={{
                width: markH,
                height: markH,
                background: C.accent,
                transform: skew,
                borderRadius: 'var(--r-sm)',
              }}
            />
            <div
              data-field="brand"
              style={{ ...typeCss('subtitle'), fontWeight: 900, lineHeight: 1.2 }}
            >
              {brand.name}
            </div>
          </>
        )}
      </div>
      <div style={sideStyle}>{side}</div>
    </div>
  );
}
