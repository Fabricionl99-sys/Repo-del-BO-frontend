import { sumProbabilities } from '@/features/chests/chestPrizeForm';
import { cn } from '@/lib/cn';
import type { ChestPrize } from '@/types/chests';

export function ProbabilityBar({ prizes }: { prizes: Pick<ChestPrize, 'probability_percent'>[] }) {
  const total = sumProbabilities(prizes);
  const valid = Math.abs(total - 100) < 0.001;
  const pct = Math.min(total, 100);

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-tertiary p-3">
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="text-text-secondary">Suma de probabilidades</span>
        <span className={cn('font-mono font-semibold', valid ? 'text-success' : 'text-danger')}>
          {total.toFixed(2)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-primary">
        <div
          className={cn('h-full transition-all', valid ? 'bg-success' : total > 100 ? 'bg-danger' : 'bg-warning')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!valid && (
        <p className="mt-2 text-[11px] text-danger">
          La suma debe ser exactamente 100.00% para guardar el tipo de cofre.
        </p>
      )}
    </div>
  );
}
