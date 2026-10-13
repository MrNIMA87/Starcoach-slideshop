import { C, typeCss } from '../../utils/style';
import { toFa } from '../../utils/fa';
import { DoubleChevronLeft } from './Icons';
import { useSlideCtx } from './SlideContext';

export interface PageDotsProps {
  tone?: 'default' | 'onImage' | 'onPanel';
}

/** Carousel position indicator. RTL: first slide sits on the right, swipe hint points left. */
export function PageDots({ tone = 'default' }: PageDotsProps) {
  const { index, total, theme, showPageDots } = useSlideCtx();
  const color = tone === 'onImage' ? C.onImage : tone === 'onPanel' ? C.panelInk : C.ink;
  const style = theme.motif.dotStyle;
  const last = index === total - 1;

  const dot = (i: number) => {
    const active = i === index;
    if (style === 'circle') {
      return (
        <span
          key={i}
          style={{
            width: 'var(--s-sm)',
            height: 'var(--s-sm)',
            borderRadius: 'var(--r-pill)',
            background: active ? C.accent : 'transparent',
            border: `var(--stroke) solid ${active ? C.accent : color}`,
            opacity: active ? 1 : 0.55,
          }}
        />
      );
    }
    if (style === 'bar') {
      return (
        <span
          key={i}
          style={{
            width: active ? 'var(--s-xl)' : 'var(--s-md)',
            height: 'calc(var(--stroke) * 1.5)',
            background: active ? C.accent : color,
            opacity: active ? 1 : 0.45,
          }}
        />
      );
    }
    return (
      <span
        key={i}
        style={{
          width: active ? 'var(--s-lg)' : 'var(--s-xs)',
          height: 'var(--s-xs)',
          borderRadius: 'var(--r-pill)',
          background: active ? C.accent : color,
          opacity: active ? 1 : 0.4,
        }}
      />
    );
  };

  return (
    <div
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        color,
        visibility: showPageDots ? 'visible' : 'hidden',
        zIndex: 3,
        position: 'relative',
      }}
    >
      {total > 10 ? (
        <div style={{ ...typeCss('label'), fontWeight: 800 }}>
          {toFa(index + 1)} / {toFa(total)}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-xs)' }}>
          {Array.from({ length: total }, (_, i) => dot(i))}
        </div>
      )}
      {!last && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-xs)', ...typeCss('label'), opacity: 0.85 }}>
          <span>ادامه</span>
          <DoubleChevronLeft size="1.3em" />
        </div>
      )}
    </div>
  );
}
