import { Archive, History, MoreVertical, Pencil, CircleDot } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import type { WheelType } from '@/types/wheels';

export function WheelCard({
  wheel,
  activeOccasionsCount,
  onEdit,
  onArchive,
  onViewHistory,
}: {
  wheel: WheelType & { prizes_count?: number; active_occasions_count?: number };
  activeOccasionsCount?: number;
  onEdit: () => void;
  onArchive: () => void;
  onViewHistory: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const archived = wheel.status === 'archived';
  const prizeCount = wheel.prizes_count ?? wheel.prizes?.length ?? 0;
  const occasionsCount = activeOccasionsCount ?? wheel.active_occasions_count ?? wheel.occasions.filter((o) => o.is_active).length;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 bg-bg-secondary text-left transition hover:-translate-y-0.5 hover:border-border-default ${
        archived ? 'opacity-70' : ''
      }`}
      style={{ borderColor: wheel.color_theme }}
    >
      <button type="button" onClick={onEdit} className="block w-full text-left">
        <div className="relative aspect-[4/3] bg-bg-tertiary">
          {wheel.image_url ? (
            <img src={wheel.image_url} alt={wheel.name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-text-tertiary">
              <CircleDot size={36} />
            </div>
          )}
          <span
            className="absolute left-2 top-2 h-3 w-3 rounded-full border border-white/30"
            style={{ backgroundColor: wheel.color_theme }}
          />
          {archived && (
            <span className="absolute right-2 top-2 rounded bg-bg-primary/80 px-2 py-0.5 text-[12px] font-semibold uppercase">
              archivada
            </span>
          )}
          {!archived && !wheel.is_active && (
            <span className="absolute right-2 top-2 rounded bg-warning/90 px-2 py-0.5 text-[12px] font-semibold text-text-onAccent">
              inactiva
            </span>
          )}
        </div>
        <div className="p-4">
          <h4 className="text-[16px] font-bold">{wheel.name}</h4>
          <p className="mb-1 font-mono text-[12px] text-text-tertiary">{wheel.code}</p>
          <p className="mb-3 line-clamp-2 text-[13px] text-text-tertiary">{wheel.description}</p>
          <div className="flex items-center justify-between text-[13px] text-text-secondary">
            <span>{prizeCount} premios</span>
            <span>{occasionsCount} ocasiones activas</span>
          </div>
          {wheel.pity_enabled && (
            <p className="mt-1 text-[12px] text-accent">pity ×{wheel.pity_threshold}</p>
          )}
        </div>
      </button>
      <div className="absolute right-2 top-2">
        <IconButton
          icon={MoreVertical}
          title="Acciones"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
        />
        {menuOpen && (
          <div className="absolute right-0 z-10 mt-1 min-w-[160px] rounded-lg border border-border-subtle bg-bg-secondary py-1 shadow-modal">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
              onClick={() => {
                setMenuOpen(false);
                onEdit();
              }}
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
              onClick={() => {
                setMenuOpen(false);
                onViewHistory();
              }}
            >
              <History size={14} /> Ver historial
            </button>
            {!archived && (
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-danger hover:bg-bg-tertiary"
                onClick={() => {
                  setMenuOpen(false);
                  onArchive();
                }}
              >
                <Archive size={14} /> Archivar
              </button>
            )}
          </div>
        )}
      </div>
      <div className="border-t border-border-subtle px-4 pb-4">
        <Button size="sm" variant="ghost" className="w-full" onClick={onEdit}>
          {archived ? 'Ver detalle' : 'Editar'}
        </Button>
      </div>
    </div>
  );
}
