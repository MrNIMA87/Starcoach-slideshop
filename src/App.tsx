import { useEffect } from 'react';
import { redo, undo, useStudio } from './store';
import { CarouselStrip, Canvas, ExportDialog, Inspector, SlideManager, ThemePanel, Toasts, TopBar } from './components/editor';

function isTyping(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

export default function App() {
  const panel = useStudio((s) => s.panel);
  const setPanel = useStudio((s) => s.setPanel);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (isTyping(e.target)) return; // keep native text undo inside inputs
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // RTL carousel: left = next slide, right = previous slide.
        const { project, selectedId, selectSlide } = useStudio.getState();
        const i = project.slides.findIndex((s) => s.id === selectedId);
        const next = project.slides[i + (e.key === 'ArrowLeft' ? 1 : -1)];
        if (next) selectSlide(next.id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const tab = (active: boolean) =>
    `flex-1 cursor-pointer border-b-2 px-3 py-2.5 text-[12.5px] font-extrabold transition ${
      active ? 'border-chrome-accent text-chrome-text' : 'border-transparent text-chrome-muted hover:text-chrome-text'
    }`;

  return (
    <div className="grid h-full grid-rows-[48px_minmax(0,1fr)_auto]">
      <TopBar />
      <div className="grid min-h-0 grid-cols-[290px_minmax(0,1fr)_350px]">
        <SlideManager />
        <main className="min-h-0 min-w-0">
          <Canvas />
        </main>
        <aside className="flex min-h-0 flex-col border-s border-chrome-line bg-chrome-1">
          <div className="flex border-b border-chrome-line" role="tablist">
            <button type="button" role="tab" aria-selected={panel === 'inspector'} className={tab(panel === 'inspector')} onClick={() => setPanel('inspector')}>ویرایش اسلاید</button>
            <button type="button" role="tab" aria-selected={panel === 'theme'} className={tab(panel === 'theme')} onClick={() => setPanel('theme')}>تم و برند</button>
          </div>
          {panel === 'inspector' ? <Inspector /> : <ThemePanel />}
        </aside>
      </div>
      <CarouselStrip />
      <ExportDialog />
      <Toasts />
    </div>
  );
}
