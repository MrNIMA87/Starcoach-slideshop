import type { CSSProperties } from 'react';
import type { ImageRef } from '../../types';
import { C, R, typeCss } from '../../utils/style';
import { HangerIcon } from './Icons';
import { useSlideCtx } from './SlideContext';

export interface ImageSlotProps {
  /** Slot id declared in the template meta (shown in the Inspector as an upload card). */
  slot: string;
  image?: ImageRef;
  /** Label shown in the empty placeholder (edit mode only). */
  label: string;
  radius?: 'sm' | 'md' | 'lg' | 'pill' | 'none';
  style?: CSSProperties;
  /** Optional clip-path (e.g. a diagonal cut). */
  clipPath?: string;
  borderStrength?: 'none' | 'stroke';
}

/**
 * The ONLY place a product photo can appear. Fills its box with object-fit: cover around the
 * focal point (fx, fy) and optional zoom. Empty slots render a themed placeholder.
 */
export function ImageSlot({ slot, image, label, radius = 'none', style, clipPath, borderStrength = 'none' }: ImageSlotProps) {
  const { assets, mode } = useSlideCtx();
  const asset = image ? assets[image.assetId] : undefined;
  const origin = image ? `${image.fx}% ${image.fy}%` : '50% 50%';

  return (
    <div
      data-slot={slot}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: C.surface,
        borderRadius: radius === 'none' ? 0 : R[radius],
        clipPath,
        border: borderStrength === 'stroke' ? `var(--stroke) solid ${C.line}` : undefined,
        ...style,
      }}
    >
      {asset && image ? (
        <img
          src={asset.dataUrl}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: origin,
            transformOrigin: origin,
            transform: image.zoom !== 1 ? `scale(${image.zoom})` : undefined,
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--s-sm)',
            color: C.inkMuted,
            backgroundImage: `repeating-linear-gradient(135deg, ${C.line} 0, ${C.line} var(--stroke), transparent var(--stroke), transparent var(--s-lg))`,
          }}
        >
          {mode === 'edit' && (
            <>
              <HangerIcon size="var(--s-xl)" />
              <div style={{ ...typeCss('caption'), fontWeight: 700, textAlign: 'center', padding: '0 var(--s-md)' }}>
                {label}
              </div>
              <div style={{ ...typeCss('label'), opacity: 0.8 }}>برای آپلود کلیک کنید</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
