import { StatCard } from '@/components/ui/StatCard';
import { usePredictionStats } from '@/features/predictions/predictionsApi';

export function PredictionStatsPanel() {
  const statsQ = usePredictionStats();
  const stats = statsQ.data;

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
        <StatCard label="Total eventos" value={stats.total_events} />
        <StatCard label="Activos (abiertos)" value={stats.active_events} />
        <StatCard label="Resueltos" value={stats.resolved_events} />
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className="card p-5">
          <h3 className="section-title mb-4">Top categorías</h3>
          {stats.top_categories.length === 0 ? (
            <p className="text-[14px] text-text-tertiary">Sin datos</p>
          ) : (
            <ul className="space-y-2">
              {stats.top_categories.map((c) => (
                <li key={c.category} className="flex justify-between text-[14px]">
                  <span>{c.category}</span>
                  <span className="font-semibold text-text-secondary">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <StatCard
          label="Promedio predicciones / evento"
          value={stats.avg_predictions_per_event.toFixed(1)}
        />
      </div>
    </div>
  );
}
