import { useMemo } from 'react';

import { cn } from '@/lib/cn';
import { formatPositionRange } from '@/features/rankings/rankingPrizeForm';
import type { RankingPrize } from '@/types/rankings';

function prizeCoveringPosition(
  prizes: Pick<RankingPrize, 'id' | 'position_from' | 'position_to'>[],
  position: number,
  excludeId?: string,
) {
  return prizes.find(
    (p) => p.id !== excludeId && position >= p.position_from && position <= p.position_to,
  );
}

export function RankingPositionOccupancyBar({
  prizes,
  excludeId,
  candidateFrom,
  candidateTo,
}: {
  prizes: Pick<RankingPrize, 'id' | 'position_from' | 'position_to'>[];
  excludeId?: string;
  candidateFrom?: number;
  candidateTo?: number;
}) {
  const { maxPos, occupied, candidateSet, hasOverlap } = useMemo(() => {
    const relevant = prizes.filter((p) => p.id !== excludeId);
    const from = Number.isFinite(candidateFrom) ? (candidateFrom as number) : undefined;
    const to = Number.isFinite(candidateTo) ? (candidateTo as number) : undefined;
    const max = Math.max(
      10,
      from ?? 0,
      to ?? 0,
      ...relevant.map((p) => p.position_to),
    );
    const occ = new Set<number>();
    for (const p of relevant) {
      for (let i = p.position_from; i <= p.position_to; i += 1) occ.add(i);
    }
    const cand = new Set<number>();
    if (from && to && from <= to) {
      for (let i = from; i <= to; i += 1) cand.add(i);
    }
    const overlap =
      cand.size > 0 && [...cand].some((pos) => occ.has(pos));
    return { maxPos: max, occupied: occ, candidateSet: cand, hasOverlap: overlap };
  }, [prizes, excludeId, candidateFrom, candidateTo]);

  const slots = Array.from({ length: maxPos }, (_, i) => i + 1);

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-tertiary p-3">
      <div className="mb-2 flex items-center justify-between text-[13px]">
        <span className="text-text-secondary">Posiciones con premio asignado</span>
        <span className="font-mono text-text-tertiary">1–{maxPos}</span>
      </div>
      <div className="flex flex-wrap gap-0.5">
        {slots.map((pos) => {
          const covering = prizeCoveringPosition(prizes, pos, excludeId);
          const taken = Boolean(covering);
          const candidate = candidateSet.has(pos);
          return (
            <div
              key={pos}
              title={
                taken
                  ? `Ocupada · premio ${formatPositionRange(covering!.position_from, covering!.position_to)}`
                  : candidate
                    ? 'Rango en edición'
                    : `Posición ${pos} libre`
              }
              className={cn(
                'h-3 w-2 rounded-sm transition-colors',
                taken && !candidate && 'bg-accent/70',
                taken && candidate && 'bg-danger',
                !taken && candidate && 'bg-accent/30 ring-1 ring-accent',
                !taken && !candidate && 'bg-bg-primary',
              )}
            />
          );
        })}
      </div>
      {hasOverlap && (
        <p className="mt-2 text-[12px] text-danger">
          El rango en rojo solapa posiciones ya asignadas.
        </p>
      )}
    </div>
  );
}
