import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useSelectedSlide, useStudio } from '../../store';
import { SlideRenderer } from '../templates/SlideRenderer';
import { resolveTheme, themeHeight } from '../../utils/theme';
import { toFa } from '../../utils/fa';

const PAD = 56;

/** The live, scalable editing canvas. Click any text or image slot to jump to its Inspector field. */
export function Canvas() {
  const { slide, index } = useSelectedSlide();
  const project = useStudio((s) => s.project);
  const format = useStudio((s) => s.format);
  const zoom = useStudio((s) => s.zoom);
  const guides = useStudio((s) => s.guides);
  const showGuides = useStudio((s) => s.showGuides);
  const requestFocus = useStudio((s) => s.requestFocus);
  const setPanel = useStudio((s) => s.setPanel);
  const setZoom = useStudio((s) => s.setZoom);

  const hostRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 900, h: 700 });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setBox({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const theme = useMemo(() => resolveTheme(project.brandKit), [project.brandKit]);
  const W = theme.canvas.width;
  const H = themeHeight(theme, format);
  const fit = Math.max(0.05, Math.min((box.w - PAD) / W, (box.h - PAD) / H));
  const scale = fit * zoom;

  const onClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-field],[data-slot]');
    if (!target) return;
    const field = target.getAttribute('data-field');
    const slot = target.getAttribute('data-slot');
    setPanel('inspector');
    requestFocus(field ?? (slot ? `slot:${slot}` : null));
  };

  return (
    <div
      ref={hostRef}
      className="relative h-full w-full overflow-auto bg-chrome-1"
      style={{
        backgroundImage: 'radial-gradient(#2a2d32 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
      onWheel={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          setZoom(zoom * (e.deltaY < 0 ? 1.08 : 0.92));
        }
      }}
    >
      <div
        className="grid min-h-full min-w-full place-items-center"
        style={{ width: Math.max(box.w, W * scale + PAD), height: Math.max(box.h, H * scale + PAD) }}
      >
        <div style={{ width: W * scale, height: H * scale, position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,.55)' }}>
          <div
            className="edit-surface"
            onClick={onClick}
            style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: '0 0' }}
          >
            <SlideRenderer
              project={project}
              slide={slide}
              index={index}
              total={project.slides.length}
              format={format}
              mode="edit"
              guides={showGuides ? guides : undefined}
            />
          </div>
        </div>
      </div>
      <div className="pointer-events-none sticky bottom-3 start-3 float-start rounded-md bg-black/60 px-2 py-1 text-[11px] text-chrome-muted" dir="ltr">
        {W}×{H} · {toFa(Math.round(scale * 100))}%
      </div>
    </div>
  );
}
