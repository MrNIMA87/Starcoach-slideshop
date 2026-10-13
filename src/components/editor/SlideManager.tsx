import { useState } from 'react';
import { useStudio } from '../../store';
import { TEMPLATES, TEMPLATE_ORDER } from '../templates/registry';
import { SlideThumb } from './SlideThumb';
import { Btn, IconBtn, IconCopy, IconDown, IconPlus, IconTrash, IconUp } from './ui';
import { toFa } from '../../utils/fa';
import type { Slide } from '../../types';

const SUMMARY_KEYS = ['title', 'name', 'value', 'quote'];

function summary(slide: Slide): string {
  for (const k of SUMMARY_KEYS) {
    const v = slide.content[k];
    if (typeof v === 'string' && v.trim()) return v.replace(/\n/g, ' ');
  }
  return TEMPLATES[slide.template].meta.description;
}

/** Slide list: select, add (from any of the 7 templates), duplicate, delete, reorder (buttons or drag & drop). */
export function SlideManager() {
  const project = useStudio((s) => s.project);
  const format = useStudio((s) => s.format);
  const selectedId = useStudio((s) => s.selectedId);
  const { selectSlide, addSlide, duplicateSlide, removeSlide, moveSlide } = useStudio.getState();
  const [menu, setMenu] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  return (
    <aside className="flex h-full min-h-0 flex-col border-e border-chrome-line bg-chrome-1">
      <div className="relative flex items-center justify-between border-b border-chrome-line px-4 py-3">
        <h2 className="text-[13px] font-extrabold">اسلایدها</h2>
        <Btn variant="primary" onClick={() => setMenu((v) => !v)} aria-expanded={menu}>
          <IconPlus /> افزودن
        </Btn>
        {menu && (
          <div className="absolute end-3 top-full z-30 mt-1 w-[270px] rounded-lg border border-chrome-line bg-chrome-2 p-1.5 shadow-2xl">
            {TEMPLATE_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  addSlide(id, selectedId);
                  setMenu(false);
                }}
                className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-start hover:bg-chrome-3"
              >
                <span className="text-[13px] font-bold">{TEMPLATES[id].meta.label}</span>
                <span className="text-[11px] leading-5 text-chrome-muted">{TEMPLATES[id].meta.description}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <ol className="m-0 flex min-h-0 flex-1 list-none flex-col gap-2 overflow-y-auto p-3">
        {project.slides.map((slide, i) => {
          const active = slide.id === selectedId;
          return (
            <li
              key={slide.id}
              draggable
              onDragStart={(e) => {
                setDragId(slide.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (overId !== slide.id) setOverId(slide.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId && dragId !== slide.id) moveSlide(dragId, i);
                setDragId(null);
                setOverId(null);
              }}
              className={`group rounded-lg border p-2 transition ${
                active ? 'border-chrome-accent bg-chrome-2' : 'border-chrome-line bg-chrome-1 hover:bg-chrome-2'
              } ${overId === slide.id && dragId && dragId !== slide.id ? 'ring-2 ring-chrome-accent' : ''} ${dragId === slide.id ? 'opacity-40' : ''}`}
            >
              <div className="flex gap-2.5">
                <button type="button" onClick={() => selectSlide(slide.id)} className="flex flex-none cursor-pointer gap-2.5 border-0 bg-transparent p-0 text-start" aria-label={`انتخاب اسلاید ${toFa(i + 1)}`}>
                  <div className="overflow-hidden rounded-md ring-1 ring-chrome-line">
                    <SlideThumb project={project} slide={slide} index={i} format={format} height={92} />
                  </div>
                </button>
                <button type="button" onClick={() => selectSlide(slide.id)} className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-1 border-0 bg-transparent p-0 text-start text-chrome-text">
                  <span className="text-[11px] font-bold text-chrome-accent">
                    {toFa(i + 1)} · {TEMPLATES[slide.template].meta.label}
                  </span>
                  <span className="line-clamp-3 text-[12px] leading-5 text-chrome-muted">{summary(slide)}</span>
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-end gap-0.5 opacity-70 group-hover:opacity-100">
                <IconBtn label="انتقال به بالا" disabled={i === 0} onClick={() => moveSlide(slide.id, i - 1)}><IconUp /></IconBtn>
                <IconBtn label="انتقال به پایین" disabled={i === project.slides.length - 1} onClick={() => moveSlide(slide.id, i + 1)}><IconDown /></IconBtn>
                <IconBtn label="تکرار اسلاید" onClick={() => duplicateSlide(slide.id)}><IconCopy /></IconBtn>
                <IconBtn label="حذف اسلاید" className="text-chrome-danger" onClick={() => removeSlide(slide.id)}><IconTrash /></IconBtn>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
