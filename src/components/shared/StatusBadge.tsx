import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';

import type { CatalogStatus } from './catalogStatus';

const VARIANTS: Record<
  CatalogStatus,
  { label: string; className: string; showCheck: boolean }
> = {
  active: {
    label: 'Activo',
    className:
      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    showCheck: true,
  },
  inactive: {
    label: 'Inactivo',
    className: 'bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300',
    showCheck: false,
  },
  archived: {
    label: 'Archivado',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    showCheck: false,
  },
};

export function StatusBadge({
  status,
  className,
  onActivate,
  activating = false,
}: {
  status: CatalogStatus;
  className?: string;
  /** Click en badge inactivo → activar sin abrir editor. */
  onActivate?: () => void;
  activating?: boolean;
}) {
  const variant = VARIANTS[status];
  const canActivate = status === 'inactive' && onActivate && !activating;

  return (
    <span
      role={canActivate ? 'button' : undefined}
      tabIndex={canActivate ? 0 : undefined}
      title={canActivate ? 'Click para activar' : undefined}
      onClick={
        canActivate
          ? (e) => {
              e.stopPropagation();
              onActivate();
            }
          : undefined
      }
      onKeyDown={
        canActivate
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onActivate();
              }
            }
          : undefined
      }
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold',
        variant.className,
        canActivate && 'cursor-pointer hover:opacity-90',
        activating && 'opacity-60',
        className,
      )}
    >
      {variant.showCheck ? <Check size={12} aria-hidden /> : null}
      {variant.label}
    </span>
  );
}
