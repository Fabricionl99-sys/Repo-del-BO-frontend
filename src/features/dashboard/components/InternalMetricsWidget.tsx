import { BarChart3 } from 'lucide-react';

import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { StatCard } from '@/components/ui/StatCard';
import { canViewInternalMetrics, useInternalMetrics } from '@/features/internalMetrics/internalMetricsApi';
import { formatNumber } from '@/lib/format';
import { useAuthStore } from '@/stores/authStore';

export function InternalMetricsWidget() {
  const userId = useAuthStore((s) => s.user?.id);
  const q = useInternalMetrics();

  if (!canViewInternalMetrics(userId)) return null;
  if (q.isLoading) return <Loading label="Métricas internas..." />;
  if (q.isError || !q.data) return <ErrorState onRetry={() => void q.refetch()} />;

  const m = q.data;

  return (
    <section className="mb-7 rounded-xl border border-accent/25 bg-accent-subtle/30 p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-accent" />
        <h2 className="text-[16px] font-bold">Métricas internas (últimos {m.period_days} días)</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Signups iniciados" value={formatNumber(m.signups_started)} />
        <StatCard label="Onboarding completado" value={formatNumber(m.signups_completed)} />
        <StatCard
          label="Conversión landing"
          value={`${(m.conversion_rate * 100).toFixed(1)}%`}
          hint={`${m.signups_started} / ${m.landing_unique_visitors} visitantes`}
        />
        <StatCard label="Operadores activos" value={formatNumber(m.active_operators)} />
      </div>
      <div className="mt-4">
        <p className="mb-2 text-[13px] font-semibold text-text-secondary">Top módulos activados</p>
        <ul className="flex flex-wrap gap-2">
          {m.top_modules.map((mod) => (
            <li
              key={mod.module_code}
              className="rounded-full border border-border-subtle bg-bg-secondary px-3 py-1 text-[13px]"
            >
              {mod.label}{' '}
              <span className="font-semibold text-accent">{mod.activations}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-[12px] text-text-tertiary">
        Fuente: backend interno (no GA). Solo visible para super-admins configurados.
      </p>
    </section>
  );
}
