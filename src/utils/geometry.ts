export type CutEdge = 'top' | 'bottom' | 'left' | 'right';

/**
 * clip-path polygon that slants one edge of a box by `off` px.
 * `flip` mirrors the direction of the slant. With off = 0 the polygon is a plain rectangle.
 */
export function slantClip(cut: CutEdge, off: number, flip = false): string {
  const o = `${off}px`;
  switch (cut) {
    case 'bottom':
      return flip
        ? `polygon(0 0, 100% 0, 100% 100%, 0 calc(100% - ${o}))`
        : `polygon(0 0, 100% 0, 100% calc(100% - ${o}), 0 100%)`;
    case 'top':
      return flip
        ? `polygon(0 0, 100% ${o}, 100% 100%, 0 100%)`
        : `polygon(0 ${o}, 100% 0, 100% 100%, 0 100%)`;
    case 'right':
      return flip
        ? `polygon(0 0, calc(100% - ${o}) 0, 100% 100%, 0 100%)`
        : `polygon(0 0, 100% 0, calc(100% - ${o}) 100%, 0 100%)`;
    case 'left':
      return flip
        ? `polygon(0 0, 100% 0, 100% 100%, ${o} 100%)`
        : `polygon(${o} 0, 100% 0, 100% 100%, 0 100%)`;
  }
}

export function oppositeEdge(e: CutEdge): CutEdge {
  return e === 'top' ? 'bottom' : e === 'bottom' ? 'top' : e === 'left' ? 'right' : 'left';
}
