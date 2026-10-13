import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { TypeKey } from '../../types';
import { useSlideCtx } from './SlideContext';
import { typeSize } from '../../utils/style';

interface FitCommon {
  type: TypeKey;
  field?: string;
  color?: string;
  align?: 'start' | 'center' | 'end';
  /** Vertical placement inside the fitting box. */
  vAlign?: 'start' | 'center' | 'end';
  /** Lower bound as a fraction of the token size (default 0.4). */
  minRatio?: number;
  /** Fixed box height in px. Omit to fill the remaining flex space of the parent. */
  boxHeight?: number;
  weight?: number;
  ltr?: boolean;
  /** Keep on one line and shrink instead of wrapping (coupon codes, URLs). */
  nowrap?: boolean;
  style?: CSSProperties;
}

export interface AutoFitBlockProps extends FitCommon {
  /** Rich content sized in `em` relative to the fitted font size. */
  children: ReactNode;
  /** Changes whenever the content changes (children can't be diffed cheaply). */
  fitKey: string;
}

/**
 * Shrinks the font size (binary search) until its content fits the box, so long Persian copy
 * can never push other elements around or overflow the slide. Height AND width are checked
 * (width catches very long unbreakable tokens such as URLs). Re-fits whenever the content, the
 * box size or the web-fonts change. Children should use `em` units to follow the fitted size.
 */
export function AutoFitBlock({
  children,
  fitKey,
  type,
  field,
  color,
  align,
  vAlign = 'start',
  minRatio = 0.4,
  boxHeight,
  weight,
  ltr,
  nowrap,
  style,
}: AutoFitBlockProps) {
  const { theme, textScale } = useSlideCtx();
  const token = theme.type.scale[type];
  const maxSize = typeSize(theme, type, textScale);
  const minSize = Math.max(12, maxSize * minRatio);

  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(maxSize);

  const fit = useCallback(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;
    const fits = () =>
      inner.scrollHeight <= wrap.clientHeight + 0.5 && inner.scrollWidth <= wrap.clientWidth + 0.5;

    inner.style.fontSize = `${maxSize}px`;
    if (fits()) {
      setSize(maxSize);
      return;
    }
    let lo = minSize;
    let hi = maxSize;
    while (hi - lo > 0.5) {
      const mid = (lo + hi) / 2;
      inner.style.fontSize = `${mid}px`;
      if (fits()) lo = mid;
      else hi = mid;
    }
    inner.style.fontSize = `${lo}px`;
    setSize(lo);
  }, [maxSize, minSize]);

  useLayoutEffect(() => {
    fit();
  }, [fit, fitKey, weight, boxHeight]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => fit());
    ro.observe(wrap);
    const refit = () => fit();
    void document.fonts?.ready.then(refit);
    document.fonts?.addEventListener('loadingdone', refit);
    return () => {
      ro.disconnect();
      document.fonts?.removeEventListener('loadingdone', refit);
    };
  }, [fit]);

  const justify = vAlign === 'start' ? 'flex-start' : vAlign === 'end' ? 'flex-end' : 'center';

  return (
    <div
      ref={wrapRef}
      data-field={field}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: justify,
        overflow: 'hidden',
        minHeight: 0,
        minWidth: 0,
        ...(boxHeight !== undefined ? { height: boxHeight, flex: 'none' } : { flex: '1 1 0' }),
        ...style,
      }}
    >
      <div
        ref={innerRef}
        style={{
          fontSize: size,
          fontWeight: weight ?? token.weight,
          lineHeight: token.lineHeight,
          color,
          textAlign: align,
          direction: ltr ? 'ltr' : undefined,
          unicodeBidi: ltr ? 'isolate' : undefined,
          whiteSpace: nowrap ? 'nowrap' : 'pre-line',
          overflowWrap: nowrap ? 'normal' : 'anywhere',
          width: '100%',
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export interface AutoFitTextProps extends FitCommon {
  text: string;
}

/** Single text value that always fits its box. See AutoFitBlock for the fitting algorithm. */
export function AutoFitText({ text, ...rest }: AutoFitTextProps) {
  return (
    <AutoFitBlock {...rest} fitKey={text}>
      {text}
    </AutoFitBlock>
  );
}
