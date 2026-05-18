import { probabilitySummary } from '@/features/wheels/wheelPrizeForm';
import { cn } from '@/lib/cn';
import type { WheelPrize } from '@/types/wheels';

export function WheelProbabilityBar({ prizes }: { prizes: Pick<WheelPrize, 'probability_percent'>[] }) {
  const { total, valid, missing } = probabilitySummary(prizes);
  const pct = Math.min(total, 100);

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-tertiary p-3">
      <div className="mb-2 flex items-center justify-between text-[14px]">
        <span className="text-text-secondary">Suma de probabilidades</span>
        <span className={cn('font-mono font-semibold', valid ? 'text-success' : 'text-danger')}>
          {valid ? '100%' : `${total.toFixed(1)}%`}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-primary">
        <div
          className={cn('h-full transition-all', valid ? 'bg-success' : total > 100 ? 'bg-danger' : 'bg-warning')}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={cn('mt-2 text-[13px]', valid ? 'text-success' : 'text-danger')}>
        {valid
          ? 'Suma correcta — podés guardar la rueda.'
          : total > 100
            ? `Excedés ${(total - 100).toFixed(1)}% — ajustá los premios.`
            : `Faltan ${missing.toFixed(1)}% para llegar a 100%.`}
      </p>
    </div>
  );
}
