import { PackageX } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { chestCatalogState } from '@/features/chests/chestTypeShape';
import type { ChestType } from '@/types/chests';

const statusBadge: Record<
  ReturnType<typeof chestCatalogState>,
  { label: string; className: string }
> = {
  active: { label: 'Activo', className: 'bg-success/90 text-text-onAccent' },
  inactive: { label: 'Inactivo', className: 'bg-bg-primary/80 text-text-secondary' },
  archived: { label: 'Archivado', className: 'bg-danger/90 text-text-onAccent' },
};

export function ChestTypeCard({
  type,
  onEdit,
}: {
  type: ChestType;
  onEdit: () => void;
}) {
  const catalogState = chestCatalogState(type);
  const badge = statusBadge[catalogState];
  const prizeCount = type.prizes?.length ?? 0;

  return (
    <button
      type="button"
      onClick={onEdit}
      className={`overflow-hidden rounded-xl border-2 bg-bg-secondary text-left transition hover:-translate-y-0.5 hover:border-border-default ${
        catalogState === 'archived' ? 'opacity-70' : ''
      }`}
      style={{ borderColor: type.color_theme }}
    >
      <div className="relative aspect-[4/3] bg-bg-tertiary">
        {type.image_url ? (
          <img src={type.image_url} alt={type.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-text-tertiary">
            <PackageX size={32} />
          </div>
        )}
        <span
          className="absolute left-2 top-2 h-3 w-3 rounded-full border border-white/30"
          style={{ backgroundColor: type.color_theme }}
        />
        <span
          className={`absolute right-2 top-2 rounded px-2 py-0.5 text-[12px] font-semibold uppercase ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <div className="p-4">
        <h4 className="text-[16px] font-bold">{type.name}</h4>
        <p className="mb-1 font-mono text-[12px] text-text-tertiary">{type.code}</p>
        <p className="mb-3 line-clamp-2 text-[13px] text-text-tertiary">{type.description}</p>
        <div className="flex items-center justify-between text-[13px] text-text-secondary">
          <span>{prizeCount} premios</span>
          {type.has_pity_system && <span className="text-accent">pity ×{type.pity_threshold}</span>}
        </div>
        <Button size="sm" variant="ghost" className="mt-3 w-full" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          {catalogState === 'archived' ? 'ver detalle' : 'editar'}
        </Button>
      </div>
    </button>
  );
}
