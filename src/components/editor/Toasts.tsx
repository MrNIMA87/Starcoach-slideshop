import { useStudio } from '../../store';

const KIND = {
  info: 'border-chrome-line',
  success: 'border-emerald-500/60',
  error: 'border-chrome-danger',
} as const;

export function Toasts() {
  const toasts = useStudio((s) => s.toasts);
  const dismiss = useStudio((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-5 z-[60] flex flex-col items-center gap-2" style={{ left: '50%', transform: 'translateX(-50%)' }} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`pointer-events-auto flex max-w-[520px] items-center gap-3 rounded-lg border bg-chrome-2 px-4 py-2.5 text-[12.5px] shadow-2xl ${KIND[t.kind]}`}>
          <span>{t.text}</span>
          <button type="button" onClick={() => dismiss(t.id)} className="cursor-pointer text-chrome-muted hover:text-chrome-text" aria-label="بستن">✕</button>
        </div>
      ))}
    </div>
  );
}
