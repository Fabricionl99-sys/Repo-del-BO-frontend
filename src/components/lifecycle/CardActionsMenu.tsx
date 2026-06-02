import { MoreVertical } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/lib/cn';

export function CardActionsMenu({ children }: { children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="absolute right-2 top-2 z-10" onClick={(e) => e.stopPropagation()}>
      <IconButton
        icon={MoreVertical}
        title="Acciones"
        size="sm"
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[5] cursor-default"
            aria-label="cerrar menú"
            onClick={close}
          />
          <div className="absolute right-0 z-10 mt-1 min-w-[180px] rounded-lg border border-border-subtle bg-bg-secondary py-1 shadow-modal">
            {children(close)}
          </div>
        </>
      )}
    </div>
  );
}

export function CardActionItem({
  label,
  icon,
  danger,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary',
        danger && 'text-danger',
      )}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}
