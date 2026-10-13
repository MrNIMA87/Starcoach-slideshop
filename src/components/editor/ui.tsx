import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SVGProps, TextareaHTMLAttributes } from 'react';

/* ----------------------------- shared class strings ----------------------------- */

export const inputCls =
  'w-full rounded-md border border-chrome-line bg-chrome-0 px-2.5 py-1.5 text-[13px] text-chrome-text placeholder:text-chrome-muted focus:border-chrome-accent focus:outline-none';

/* ----------------------------- layout atoms ----------------------------- */

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-b border-chrome-line px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[12px] font-extrabold text-chrome-muted">{title}</h3>
        {action}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function Field({ label, hint, counter, children }: { label: string; hint?: string; counter?: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center justify-between text-[12px] font-semibold text-chrome-text">
        <span>{label}</span>
        {counter}
      </span>
      {children}
      {hint && <span className="text-[11px] text-chrome-muted">{hint}</span>}
    </label>
  );
}

/* ----------------------------- buttons ----------------------------- */

type BtnVariant = 'default' | 'primary' | 'ghost' | 'danger';

const BTN: Record<BtnVariant, string> = {
  default: 'bg-chrome-3 text-chrome-text hover:bg-[#3a3f46]',
  primary: 'bg-chrome-accent text-[#06101f] hover:brightness-110',
  ghost: 'bg-transparent text-chrome-text hover:bg-chrome-3',
  danger: 'bg-transparent text-chrome-danger hover:bg-[#3a2326]',
};

export function Btn({
  variant = 'default',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${BTN[variant]} ${className}`}
    />
  );
}

export function IconBtn({
  label,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      {...props}
      className={`grid h-8 w-8 place-items-center rounded-md text-chrome-text transition hover:bg-chrome-3 disabled:cursor-not-allowed disabled:opacity-35 ${className}`}
    />
  );
}

/* ----------------------------- inputs ----------------------------- */

export function TextInput({ ltr, className = '', ...props }: InputHTMLAttributes<HTMLInputElement> & { ltr?: boolean }) {
  return <input {...props} dir={ltr ? 'ltr' : 'auto'} className={`${inputCls} ${className}`} />;
}

export function TextArea({ ltr, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { ltr?: boolean }) {
  return <textarea {...props} dir={ltr ? 'ltr' : 'auto'} className={`${inputCls} resize-y leading-6 ${className}`} />;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = '',
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}) {
  return (
    <input
      type="number"
      dir="ltr"
      value={Number.isFinite(value) ? value : 0}
      min={min}
      max={max}
      step={step}
      onChange={(e) => {
        const n = parseFloat(e.target.value);
        if (Number.isFinite(n)) onChange(n);
      }}
      className={`${inputCls} text-center ${className}`}
    />
  );
}

export function Range({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <input
      type="range"
      dir="ltr"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="h-1.5 w-full cursor-pointer accent-[#4c9dff]"
    />
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-[12.5px]">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 cursor-pointer accent-[#4c9dff]"
      />
    </label>
  );
}

export function Select<T extends string | number>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        const match = options.find((o) => String(o.value) === raw);
        if (match) onChange(match.value);
      }}
      className={inputCls}
    >
      {options.map((o) => (
        <option key={String(o.value)} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ----------------------------- icons (stroke, 16px) ----------------------------- */

function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

export const IconUndo = () => (
  <Svg>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
  </Svg>
);
export const IconRedo = () => (
  <Svg>
    <path d="M15 14l5-5-5-5" />
    <path d="M20 9H10a6 6 0 0 0 0 12h3" />
  </Svg>
);
export const IconPlus = () => (
  <Svg>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconCopy = () => (
  <Svg>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </Svg>
);
export const IconTrash = () => (
  <Svg>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Svg>
);
export const IconUp = () => (
  <Svg>
    <path d="M6 15l6-6 6 6" />
  </Svg>
);
export const IconDown = () => (
  <Svg>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);
export const IconDownload = () => (
  <Svg>
    <path d="M12 4v11M7 11l5 5 5-5M5 20h14" />
  </Svg>
);
export const IconUpload = () => (
  <Svg>
    <path d="M12 16V5M7 9l5-5 5 5M5 20h14" />
  </Svg>
);
export const IconGrid = () => (
  <Svg>
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </Svg>
);
export const IconImage = () => (
  <Svg>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.8" />
    <path d="M21 16l-5-5-8 9" />
  </Svg>
);
