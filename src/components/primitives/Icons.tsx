import type { CSSProperties } from 'react';

interface IconProps {
  size?: number | string;
  style?: CSSProperties;
}

const base = (size: number | string = '1em', style?: CSSProperties) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  style: { display: 'block', flex: 'none', ...style },
});

export function ChevronLeft({ size, style }: IconProps) {
  return (
    <svg {...base(size, style)} aria-hidden>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function DoubleChevronLeft({ size, style }: IconProps) {
  return (
    <svg {...base(size, style)} aria-hidden>
      <path d="M12 5l-7 7 7 7" />
      <path d="M20 5l-7 7 7 7" />
    </svg>
  );
}

export function CheckIcon({ size, style }: IconProps) {
  return (
    <svg {...base(size, style)} strokeWidth={3} aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function StarIcon({ size, style, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size, style)} fill={filled ? 'currentColor' : 'none'} strokeWidth={1.5} aria-hidden>
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />
    </svg>
  );
}

export function BookmarkIcon({ size, style }: IconProps) {
  return (
    <svg {...base(size, style)} aria-hidden>
      <path d="M6 4h12v17l-6-4.5L6 21V4z" />
    </svg>
  );
}

export function SendIcon({ size, style }: IconProps) {
  return (
    <svg {...base(size, style)} aria-hidden>
      <path d="M21 4L10 14" />
      <path d="M21 4l-6.5 17-4.5-7-7-4.5L21 4z" />
    </svg>
  );
}

export function UserPlusIcon({ size, style }: IconProps) {
  return (
    <svg {...base(size, style)} aria-hidden>
      <circle cx="10" cy="8" r="4" />
      <path d="M2.5 21c.6-4 3.6-6 7.5-6s6.9 2 7.5 6" />
      <path d="M19 8v6M16 11h6" />
    </svg>
  );
}

/** Coat / hanger glyph used by empty image slots. */
export function HangerIcon({ size, style }: IconProps) {
  return (
    <svg {...base(size, style)} strokeWidth={1.4} aria-hidden>
      <path d="M12 7.2V6a2 2 0 1 1 2 2" />
      <path d="M12 7.2L2.8 14.1a1.3 1.3 0 0 0 .8 2.4h16.8a1.3 1.3 0 0 0 .8-2.4L12 7.2z" />
    </svg>
  );
}
