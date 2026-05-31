import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

type Props = {
  id: string;
  title: string;
  icon?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export function BrandingAccordionSection({ id, title, icon, open, onToggle, children }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary">
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-bg-tertiary/50"
      >
        <span className="flex items-center gap-2 text-[14px] font-semibold text-text-primary">
          {icon}
          {title}
        </span>
        <ChevronDown size={16} className={cn('shrink-0 text-text-tertiary transition', open && 'rotate-180')} />
      </button>
      {open ? (
        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-trigger`} className="border-t border-border-subtle p-4">
          {children}
        </div>
      ) : null}
    </section>
  );
}

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (hex: string) => void;
};

export function BrandingColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <label className="rounded-lg border border-border-subtle bg-bg-tertiary p-3">
      <span className="mb-1 block text-[13px] text-text-tertiary">{label}</span>
      <div className="flex gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        <input
          className="field py-1 font-mono text-[14px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}
