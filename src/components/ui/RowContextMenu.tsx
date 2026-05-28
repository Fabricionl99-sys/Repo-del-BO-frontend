import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

export interface RowContextMenuAnchor {
  id: string;
  top: number;
  left: number;
}

interface RowContextMenuProps {
  anchor: RowContextMenuAnchor | null;
  onClose: () => void;
  children: ReactNode;
  minWidth?: number;
}

/** Menú contextual anclado al botón ⋮ — renderiza en portal para escapar overflow:hidden de tablas. */
export function RowContextMenu({ anchor, onClose, children, minWidth = 180 }: RowContextMenuProps) {
  if (!anchor) return null;

  return createPortal(
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default"
        aria-label="cerrar menú"
        onClick={onClose}
      />
      <div
        className="fixed z-50 rounded-lg border border-border-subtle bg-bg-secondary py-1 shadow-modal"
        style={{ top: anchor.top, left: anchor.left, minWidth, transform: 'translateX(-100%)' }}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

export function openRowContextMenu(
  event: React.MouseEvent<HTMLElement>,
  id: string,
  current: RowContextMenuAnchor | null,
): RowContextMenuAnchor | null {
  if (current?.id === id) return null;
  const rect = event.currentTarget.getBoundingClientRect();
  return { id, top: rect.bottom + 4, left: rect.right };
}
