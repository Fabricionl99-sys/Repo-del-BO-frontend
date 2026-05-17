import { Trophy } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { METRIC_LABELS, PERIOD_LABELS } from '@/features/rankings/rankingForm';
import { cn } from '@/lib/cn';
import type { RankingConfig } from '@/types/rankings';

export function RankingCard({
  ranking,
  onEdit,
}: {
  ranking: RankingConfig;
  onEdit: () => void;
}) {
  const archived = ranking.status === 'archived';
  const prizeCount = ranking.prizes?.length ?? 0;

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        'overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary text-left transition hover:-translate-y-0.5 hover:border-accent/30',
        archived && 'opacity-70',
      )}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Trophy size={22} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-[16px] font-bold">{ranking.name}</h4>
            {archived ? (
              <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[12px] uppercase">archivado</span>
            ) : ranking.is_active ? (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[12px] text-success">activo</span>
            ) : (
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[12px] text-warning">inactivo</span>
            )}
            {!ranking.is_visible_to_players && (
              <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[12px] text-text-tertiary">solo operador</span>
            )}
          </div>
          <p className="mb-1 font-mono text-[12px] text-text-tertiary">{ranking.code}</p>
          <p className="line-clamp-2 text-[13px] text-text-tertiary">{ranking.description}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[13px] text-text-secondary">
            <span>{METRIC_LABELS[ranking.metric_type]}</span>
            <span>·</span>
            <span>{PERIOD_LABELS[ranking.period_type]}</span>
            <span>·</span>
            <span>{prizeCount} premios</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border-subtle px-4 py-2">
        <Button size="sm" variant="ghost" className="w-full" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          {archived ? 'ver detalle' : 'editar'}
        </Button>
      </div>
    </button>
  );
}
