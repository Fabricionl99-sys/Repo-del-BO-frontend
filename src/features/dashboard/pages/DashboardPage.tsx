import { useState } from 'react';
import {
  Award,
  BarChart3,
  Check,
  Clock,
  Coins,
  Lock,
  Mail,
  Plus,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import type { Period } from '@/types/shared';
import { useActivityFeed, useDashboardMetrics, useSystemStatus } from '../api/dashboardApi';

const periods: Period[] = ['today', '7d', '30d', '90d'];
const labels: Record<Period, string> = { today: 'hoy', '7d': '7 días', '30d': '30 días', '90d': '90 días' };

type MockState = 'loading' | 'error' | 'empty' | null;

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('7d');
  const [params] = useSearchParams();
  const mockState = params.get('mockState') as MockState;
  const navigate = useNavigate();
  const metrics = useDashboardMetrics(period);
  const activity = useActivityFeed();
  const system = useSystemStatus();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="vista general de tu sistema de gamificación"
        actions={<PeriodSelector value={period} onChange={setPeriod} />}
      />

      <DashboardMetricsGrid query={metrics} mockState={mockState} />
      <QuickActions onNavigate={navigate} />

      <div className="mt-7 grid grid-cols-[2fr_1fr] gap-5 max-[1200px]:grid-cols-1">
        <ActivityFeedCard query={activity} mockState={mockState} />
        <SystemStatusCard query={system} mockState={mockState} onDetails={() => navigate('/metricas')} />
      </div>
    </>
  );
}

function PeriodSelector({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-border-subtle bg-bg-secondary p-0.5">
      {periods.map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={`rounded-md px-3 py-1 text-[12px] transition ${
            value === period
              ? 'bg-bg-tertiary font-medium text-text-primary'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          {labels[period]}
        </button>
      ))}
    </div>
  );
}

function DashboardMetricsGrid({
  query,
  mockState,
}: {
  query: ReturnType<typeof useDashboardMetrics>;
  mockState: MockState;
}) {
  if (mockState === 'empty') {
    return (
      <EmptyState
        title="Todavía no hay métricas"
        description="Cuando el operador empiece a enviar eventos, los KPIs principales aparecen acá."
      />
    );
  }
  if (mockState === 'loading' || query.isLoading) return <Loading label="Cargando métricas..." />;
  if (mockState === 'error' || query.isError) return <ErrorState onRetry={() => query.refetch()} />;
  if (!query.data) {
    return (
      <EmptyState
        title="Todavía no hay métricas"
        description="Cuando el operador empiece a enviar eventos, los KPIs principales aparecen acá."
      />
    );
  }

  const data = query.data;
  return (
    <div className="mb-7 grid grid-cols-4 gap-4 max-[1200px]:grid-cols-2 max-md:grid-cols-1">
      <StatCard
        label="jugadores activos"
        value={formatNumber(data.activeUsers.value)}
        icon={Users}
        trend={{
          value: `${data.activeUsers.trend.percentChange > 0 ? '+' : ''}${data.activeUsers.trend.percentChange}% ${data.activeUsers.trend.comparedTo}`,
          direction: data.activeUsers.trend.direction,
        }}
      />
      <StatCard
        label="eventos procesados"
        value={formatNumber(data.eventsProcessed.value, { compact: true })}
        icon={Zap}
        trend={{ value: `+${data.eventsProcessed.trend.percentChange}%`, direction: data.eventsProcessed.trend.direction }}
      />
      <StatCard
        label="XP otorgada"
        value={formatNumber(data.xpAwarded.value, { compact: true })}
        icon={Trophy}
        trend={{ value: `+${data.xpAwarded.trend.percentChange}%`, direction: data.xpAwarded.trend.direction }}
      />
      <StatCard
        label="monedas en circulación"
        value={formatNumber(data.coinsInCirculation.value, { compact: true })}
        icon={Coins}
        trend={{
          value: `${data.coinsInCirculation.trend.percentChange}%`,
          direction: data.coinsInCirculation.trend.direction,
        }}
      />
    </div>
  );
}

function QuickActions({ onNavigate }: { onNavigate: (path: string) => void }) {
  const actions = [
    [Plus, 'Crear regla de XP', 'define cuánta XP gana cada acción', '/reglas-xp/nueva'],
    [BarChart3, 'Editar curva de niveles', 'configura cuánta XP necesita cada nivel', '/curva-niveles'],
    [Mail, 'Publicar noticia', 'comunicate con tus jugadores', '/noticias/nueva'],
    [Award, 'Lanzar torneo', 'crea competencia con premios', '/torneos/nuevo'],
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-3 max-[1200px]:grid-cols-2 max-md:grid-cols-1">
      {actions.map(([Icon, title, description, path]) => (
        <button
          key={title}
          onClick={() => onNavigate(path)}
          className="group flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-secondary p-4 text-left transition hover:border-accent/30 hover:bg-bg-tertiary"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-bg-tertiary text-text-secondary transition group-hover:bg-accent-subtle group-hover:text-accent">
            <Icon size={18} />
          </div>
          <div>
            <div className="mb-0.5 text-[13px] font-medium">{title}</div>
            <div className="text-[11px] text-text-tertiary">{description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ActivityFeedCard({
  query,
  mockState,
}: {
  query: ReturnType<typeof useActivityFeed>;
  mockState: MockState;
}) {
  return (
    <div className="card">
      <header className="section-head">
        <h2 className="label-section">actividad reciente</h2>
        <button className="text-[12px] text-accent">ver todo →</button>
      </header>
      <div className="p-2">
        {(mockState === 'empty' || query.data?.length === 0) && (
          <EmptyState
            title="Sin actividad reciente"
            description="Las acciones del equipo y eventos del sistema se verán en este feed."
          />
        )}
        {(mockState === 'loading' || query.isLoading) && <Loading label="" />}
        {(mockState === 'error' || query.isError) && <ErrorState onRetry={() => query.refetch()} />}
        {mockState === null && query.data?.map((item) => <ActivityItemRow key={item.id} item={item} />)}
      </div>
    </div>
  );
}

function ActivityItemRow({ item }: { item: NonNullable<ReturnType<typeof useActivityFeed>['data']>[number] }) {
  const Icon = item.type === 'apikey_rotated' ? Lock : item.type === 'promo_ended' ? Clock : item.type === 'players_milestone' ? Trophy : Check;
  const color =
    item.severity === 'success'
      ? 'bg-success/15 text-success'
      : item.severity === 'warning'
        ? 'bg-warning/15 text-warning'
        : item.severity === 'danger'
          ? 'bg-danger/15 text-danger'
          : 'bg-info/15 text-info';

  return (
    <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition hover:bg-bg-tertiary">
      <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${color}`}>
        <Icon size={14} />
      </div>
      <div>
        <div className="text-[13px]">{item.title}</div>
        <div className="mt-1 flex gap-2 text-[11px] text-text-tertiary">
          <span>{item.actor?.role ?? 'sistema'}</span>
          <span>·</span>
          <span>{formatRelativeDate(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

function SystemStatusCard({
  query,
  mockState,
  onDetails,
}: {
  query: ReturnType<typeof useSystemStatus>;
  mockState: MockState;
  onDetails: () => void;
}) {
  return (
    <div className="card">
      <header className="section-head">
        <h2 className="label-section">estado del sistema</h2>
        <button onClick={onDetails} className="text-[12px] text-accent">
          detalles →
        </button>
      </header>
      {(mockState === 'empty' || query.data?.services.length === 0) && (
        <EmptyState title="Sin status disponible" description="Todavía no hay servicios reportando health checks." />
      )}
      {(mockState === 'loading' || query.isLoading) && <Loading label="" />}
      {(mockState === 'error' || query.isError) && <ErrorState onRetry={() => query.refetch()} />}
      {mockState === null && query.data && (
        <div className="space-y-3 p-5">
          {query.data.services.map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[13px]">
                <span className={`h-1.5 w-1.5 rounded-full ${service.status === 'healthy' ? 'bg-success' : 'animate-pulse-dot bg-warning'}`} />
                {service.name}
              </div>
              <span className="text-[12px] text-text-tertiary">{service.metric}</span>
            </div>
          ))}
          <div className="mt-4 border-t border-border-subtle pt-4">
            <p className="label-section mb-2.5">consumo del plan</p>
            <div className="mb-1.5 flex justify-between text-[13px]">
              <span>eventos este mes</span>
              <span className="text-text-tertiary">38.2M / 50M</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
              <div className="h-full rounded-full bg-accent" style={{ width: '76%' }} />
            </div>
            <p className="mt-2 text-[11px] font-light italic text-text-tertiary">
              faltan {query.data.planUsage.daysToReset} días para que se renueve
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
