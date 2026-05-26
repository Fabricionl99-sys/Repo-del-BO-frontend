import { HelpCircle } from 'lucide-react';

export function FieldHint({ text }: { text: string }) {
  return (
    <span className="group relative ml-1.5 inline-flex align-middle">
      <HelpCircle size={14} className="cursor-help text-text-tertiary" aria-hidden />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border border-border-subtle bg-bg-secondary px-3 py-2 text-left text-[12px] font-normal leading-snug text-text-secondary shadow-modal group-hover:block group-focus-within:block"
      >
        {text}
      </span>
    </span>
  );
}
