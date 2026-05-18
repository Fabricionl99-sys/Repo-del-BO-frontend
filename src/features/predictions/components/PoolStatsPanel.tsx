import { BarChart3 } from 'lucide-react';

import { StatCard } from '@/components/ui/StatCard';
import { usePredictionPoolStats } from '@/features/predictions/predictionsApi';
import { formatNumber } from '@/lib/format';

export function PoolStatsPanel() {
  const statsQ = usePredictionPoolStats();
  const stats = statsQ.data;

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Prodes creados" value={formatNumber(stats.total_pools)} icon={BarChart3} />
        <StatCard label="Activos" value={formatNumber(stats.active_pools)} icon={BarChart3} />
        <StatCard label="Resueltos" value={formatNumber(stats.resolved_pools)} icon={BarChart3} />
        <StatCard
          label="Prom. participantes"
          value={stats.avg_entries_per_pool.toFixed(1)}
          icon={BarChart3}
        />
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-[15px] font-semibold">Top categorías</h3>
        {stats.top_categories.length === 0 ? (
          <p className="text-[14px] text-text-tertiary">Sin datos</p>
        ) : (
          <ul className="space-y-2">
            {stats.top_categories.map((c) => (
              <li key={c.category} className="flex justify-between text-[14px]">
                <span>{c.category}</span>
                <span className="font-semibold">{c.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-4">
        <h3 className="mb-3 text-[15px] font-semibold">Distribución de aciertos</h3>
        {stats.hits_distribution.length === 0 ? (
          <p className="text-[14px] text-text-tertiary">Sin prodes resueltos aún</p>
        ) : (
          <ul className="space-y-2">
            {stats.hits_distribution.map((h) => (
              <li key={h.hits} className="flex justify-between text-[14px]">
                <span>{h.hits} aciertos</span>
                <span className="font-semibold">{h.count} jugadores</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
