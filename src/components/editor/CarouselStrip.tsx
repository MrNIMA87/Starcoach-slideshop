import { useEffect, useRef } from 'react';
import { useStudio } from '../../store';
import { SlideThumb } from './SlideThumb';
import { toFa } from '../../utils/fa';

const THUMB_H = 168;

/** Instagram-style preview: every slide side by side with no gaps, exactly how a swipe feels. */
export function CarouselStrip() {
  const project = useStudio((s) => s.project);
  const format = useStudio((s) => s.format);
  const selectedId = useStudio((s) => s.selectedId);
  const selectSlide = useStudio((s) => s.selectSlide);
  const selRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [selectedId]);

  return (
    <div className="border-t border-chrome-line bg-chrome-0 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-[11.5px] text-chrome-muted">
        <span className="font-bold text-chrome-text">پیش‌نمایش کاروسل</span>
        <span>{toFa(project.slides.length)} اسلاید — برای انتخاب کلیک کنید</span>
      </div>
      <div className="flex overflow-x-auto pb-1">
        <div className="flex">
          {project.slides.map((slide, i) => {
            const active = slide.id === selectedId;
            return (
              <button
                key={slide.id}
                ref={active ? selRef : undefined}
                type="button"
                onClick={() => selectSlide(slide.id)}
                aria-label={`اسلاید ${toFa(i + 1)}`}
                aria-current={active}
                className="relative flex-none cursor-pointer border-0 bg-transparent p-0"
                style={{ outline: active ? '3px solid #4c9dff' : 'none', outlineOffset: -3, zIndex: active ? 2 : 1 }}
              >
                <SlideThumb project={project} slide={slide} index={i} format={format} height={THUMB_H} />
                <span className="absolute bottom-1.5 end-1.5 grid h-5 min-w-5 place-items-center rounded bg-black/65 px-1 text-[10.5px] font-bold text-white">
                  {toFa(i + 1)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
