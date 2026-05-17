import { Target, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { PredictionFormModal } from '@/features/predictions/components/PredictionFormModal';
import { PredictionParticipantsModal } from '@/features/predictions/components/PredictionParticipantsModal';
import { PredictionResolveModal } from '@/features/predictions/components/PredictionResolveModal';
import { PredictionStatsPanel } from '@/features/predictions/components/PredictionStatsPanel';
import {
  useCancelPrediction,
  useClosePrediction,
  useOpenPrediction,
  usePredictionsList,
  usePredictionStats,
} from '@/features/predictions/predictionsApi';
import { STATUS_LABELS } from '@/features/predictions/predictionForm';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type { PredictionEvent, PredictionEventStatus } from '@/types/predictions';

const tabs = ['Eventos', 'Estadísticas'] as const;
type Tab = (typeof tabs)[number];

const statusFilters: Array<'all' | PredictionEventStatus> = [
  'all',
  'draft',
  'open',
  'closed',
  'resolved',
  'cancelled',
];

const statusColors: Record<PredictionEventStatus, string> = {
  draft: 'bg-text-tertiary/15 text-text-tertiary',
  open: 'bg-success/15 text-success',
  closed: 'bg-warning/15 text-warning',
  resolved: 'bg-purple/15 text-purple',
  cancelled: 'bg-danger/15 text-danger',
};

export default function PredictionsPage() {
  const [params, setParams] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const predictionsActive = isModuleActive(activeModuleCodes, 'predictions');

  const [tab, setTab] = useState<Tab>('Eventos');
  const [statusFilter, setStatusFilter] = useState<'all' | PredictionEventStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [participationFilter, setParticipationFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [editorEvent, setEditorEvent] = useState<PredictionEvent | null | 'new'>(null);
  const [resolveEvent, setResolveEvent] = useState<PredictionEvent | null>(null);
  const [participantsEvent, setParticipantsEvent] = useState<PredictionEvent | null>(null);

  const listQ = usePredictionsList({
    status: statusFilter,
    category: categoryFilter,
    participation: participationFilter,
    search: debouncedSearch || undefined,
  });
  const statsQ = usePredictionStats();
  const openMut = useOpenPrediction();
  const closeMut = useClosePrediction();
  const cancelMut = useCancelPrediction();

  const events = mock === 'empty' ? [] : (listQ.data ?? []);
  const existingCodes = useMemo(() => events.map((e) => e.code), [events]);
  const categories = useMemo(
    () => ['all', ...new Set(events.map((e) => e.category))],
    [events],
  );

  useEffect(() => {
    const create = params.get('create');
    const editId = params.get('edit');
    if (create === '1') {
      setEditorEvent('new');
      params.delete('create');
      setParams(params, { replace: true });
    } else if (editId && listQ.data) {
      const found = listQ.data.find((e) => e.id === editId);
      if (found) setEditorEvent(found);
    }
  }, [params, setParams, listQ.data]);

  if (!predictionsActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Predicciones" subtitle="Eventos donde jugadores predicen resultados" />
        <EmptyState
          icon={Target}
          title="Módulo Predicciones no activo"
          description="Activá el módulo predictions desde el catálogo para crear eventos de predicción."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Predicciones</Button>
            </Link>
          }
        />
      </>
    );
  }

  const catalogLoading = mock !== 'empty' && tab === 'Eventos' && listQ.isLoading;
  const statsLoading = mock !== 'empty' && tab === 'Estadísticas' && statsQ.isLoading;

  if (mock === 'loading' || catalogLoading || statsLoading) {
    return <Loading label="Cargando predicciones..." />;
  }

  if (mock === 'error' || listQ.isError || statsQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          listQ.refetch();
          statsQ.refetch();
        }}
      />
    );
  }

  const columns: Column<PredictionEvent>[] = [
    { key: 'code', header: 'Code', render: (e) => <span className="font-mono text-[13px]">{e.code}</span> },
    { key: 'name', header: 'Nombre', render: (e) => e.name },
    { key: 'category', header: 'Categoría', render: (e) => e.category },
    { key: 'type', header: 'Tipo', render: (e) => e.prediction_type },
    {
      key: 'status',
      header: 'Estado',
      render: (e) => (
        <span className={cn('rounded-full px-2 py-0.5 text-[13px] font-semibold', statusColors[e.status])}>
          {STATUS_LABELS[e.status]}
        </span>
      ),
    },
    { key: 'count', header: 'Predicciones', render: (e) => e.predictions_count },
    {
      key: 'closes',
      header: 'Cierra',
      render: (e) => formatRelativeDate(e.closes_at),
    },
    {
      key: 'resolves',
      header: 'Resuelve',
      render: (e) => formatRelativeDate(e.resolves_at),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (e) => (
        <div className="flex flex-wrap gap-1">
          {e.status === 'draft' && (
            <Button size="sm" loading={openMut.isPending} onClick={(ev) => { ev.stopPropagation(); openMut.mutate(e.id); }}>
              Abrir
            </Button>
          )}
          {e.status === 'open' && (
            <Button size="sm" loading={closeMut.isPending} onClick={(ev) => { ev.stopPropagation(); closeMut.mutate(e.id); }}>
              Cerrar
            </Button>
          )}
          {e.status === 'closed' && (
            <Button size="sm" onClick={(ev) => { ev.stopPropagation(); setResolveEvent(e); }}>
              Resolver
            </Button>
          )}
          {['draft', 'open', 'closed'].includes(e.status) && (
            <Button size="sm" variant="ghost" loading={cancelMut.isPending} onClick={(ev) => { ev.stopPropagation(); cancelMut.mutate(e.id); }}>
              Cancelar
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={(ev) => { ev.stopPropagation(); setParticipantsEvent(e); }}>
            Participantes
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Predicciones"
        subtitle="Eventos donde jugadores predicen resultados sin cuotas"
        actions={
          tab === 'Eventos' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorEvent('new')}>
              Nuevo evento
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-semibold transition-colors',
              tab === t ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Eventos' && (
        <>
          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
              />
            }
            filters={
              <>
                {statusFilters.map((s) => (
                  <FilterPill
                    key={s}
                    active={statusFilter === s}
                    onClick={() => setStatusFilter(s)}
                    label={s === 'all' ? 'Todos' : STATUS_LABELS[s]}
                  />
                ))}
                {categories.map((c) => (
                  <FilterPill
                    key={c}
                    active={categoryFilter === c}
                    onClick={() => setCategoryFilter(c)}
                    label={c === 'all' ? 'Todas categorías' : c}
                  />
                ))}
                <FilterPill
                  active={participationFilter === 'all'}
                  onClick={() => setParticipationFilter('all')}
                  label="Todos"
                />
                <FilterPill
                  active={participationFilter === 'free'}
                  onClick={() => setParticipationFilter('free')}
                  label="Gratis"
                />
                <FilterPill
                  active={participationFilter === 'paid'}
                  onClick={() => setParticipationFilter('paid')}
                  label="Pagado"
                />
              </>
            }
          />

            <Table
              columns={columns}
              rows={events}
              rowKey={(e) => e.id}
              onRowClick={(e) => setEditorEvent(e)}
              emptyState={
                <EmptyState
                  title="Sin eventos"
                  description="Creá tu primer evento de predicción para que los jugadores participen."
                  action={
                    <Button variant="primary" onClick={() => setEditorEvent('new')}>
                      Crear primer evento
                    </Button>
                  }
                />
              }
            />
        </>
      )}

      {tab === 'Estadísticas' && <PredictionStatsPanel />}

      <PredictionFormModal
        open={editorEvent !== null}
        event={editorEvent === 'new' ? null : editorEvent}
        existingCodes={existingCodes}
        onClose={() => setEditorEvent(null)}
      />
      <PredictionResolveModal
        open={resolveEvent !== null}
        event={resolveEvent}
        onClose={() => setResolveEvent(null)}
      />
      <PredictionParticipantsModal
        open={participantsEvent !== null}
        event={participantsEvent}
        onClose={() => setParticipantsEvent(null)}
      />
    </>
  );
}
