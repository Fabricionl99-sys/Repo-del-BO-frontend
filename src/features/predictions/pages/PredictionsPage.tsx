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
import { StatusPill } from '@/components/ui/StatusPill';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { PoolFormModal } from '@/features/predictions/components/PoolFormModal';
import { PredictionProgramDetailModal } from '@/features/predictions/components/PredictionProgramDetailModal';
import { PredictionsSubNav } from '@/features/predictions/components/PredictionsSubNav';
import {
  useArchivePredictionPool,
  useOpenPredictionPool,
  usePredictionPoolsList,
} from '@/features/predictions/predictionsApi';
import { STATUS_LABELS } from '@/features/predictions/poolForm';
import { useDebounce } from '@/hooks/useDebounce';
import { asArray } from '@/lib/asArray';
import { formatNumber } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type { PredictionPool, PredictionPoolStatus } from '@/types/predictions';

const statusFilters: Array<'all' | PredictionPoolStatus> = [
  'all',
  'draft',
  'open',
  'closed',
  'resolving',
  'resolved',
  'cancelled',
];

function poolStatusPill(status: PredictionPoolStatus) {
  if (status === 'open') return <StatusPill status="live" label="Activo" />;
  if (status === 'closed' || status === 'resolving') {
    return <StatusPill status="scheduled" label={STATUS_LABELS[status]} />;
  }
  if (status === 'resolved') return <StatusPill status="finished" label={STATUS_LABELS.resolved} />;
  if (status === 'cancelled') return <StatusPill status="error" label="Archivado" />;
  return <StatusPill status="draft" label={STATUS_LABELS.draft} />;
}

export default function PredictionsPage() {
  const [params, setParams] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const predictionsActive = isModuleActive(activeModuleCodes, 'predictions');

  const [statusFilter, setStatusFilter] = useState<'all' | PredictionPoolStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [participationFilter, setParticipationFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [editorPool, setEditorPool] = useState<PredictionPool | null | 'new'>(null);
  const [detailPool, setDetailPool] = useState<PredictionPool | null>(null);

  const listQ = usePredictionPoolsList({
    status: statusFilter,
    category: categoryFilter,
    participation: participationFilter,
    search: debouncedSearch || undefined,
  });
  const publishMut = useOpenPredictionPool();
  const archiveMut = useArchivePredictionPool();

  const pools = useMemo(
    () => (mock === 'empty' ? [] : asArray(listQ.data)),
    [mock, listQ.data],
  );
  const existingCodes = useMemo(() => pools.map((p) => p.code), [pools]);
  const categories = useMemo(() => ['all', ...new Set(pools.map((p) => p.category))], [pools]);

  const archivePool = (pool: PredictionPool) => {
    if (!window.confirm(`¿Archivar "${pool.name}"? Dejará de estar visible para jugadores.`)) return;
    void archiveMut.mutateAsync(pool.code ?? pool.id);
  };

  const publishPool = (pool: PredictionPool) => {
    if (!window.confirm(`¿Publicar "${pool.name}"? Los jugadores podrán participar.`)) return;
    void publishMut.mutateAsync(pool.code ?? pool.id);
  };

  useEffect(() => {
    const create = params.get('create');
    const editId = params.get('edit');
    if (create === '1') {
      setEditorPool('new');
      params.delete('create');
      setParams(params, { replace: true });
    } else if (editId && pools.length) {
      const found = pools.find((p) => p.id === editId);
      if (found) setEditorPool(found);
    }
  }, [params, setParams, pools]);

  const columns: Column<PredictionPool>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (pool) => (
        <div>
          <p className="font-semibold">{pool.name}</p>
          <p className="line-clamp-1 text-[13px] text-text-tertiary">{pool.description}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (pool) => poolStatusPill(pool.status),
    },
    {
      key: 'events',
      header: 'Eventos',
      render: (pool) => formatNumber(pool.total_events_count),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (pool) => (
        <div className="flex flex-wrap justify-end gap-1">
          <Button
            size="sm"
            variant="secondary"
            aria-label={`Ver detalle ${pool.name}`}
            onClick={(e) => {
              e.stopPropagation();
              setDetailPool(pool);
            }}
          >
            Ver detalle
          </Button>
          {pool.status === 'draft' ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditorPool(pool);
                }}
              >
                Editar
              </Button>
              <Button
                size="sm"
                loading={publishMut.isPending}
                onClick={(e) => {
                  e.stopPropagation();
                  publishPool(pool);
                }}
              >
                Publicar
              </Button>
            </>
          ) : null}
          {pool.status === 'open' ? (
            <Button
              size="sm"
              variant="danger"
              loading={archiveMut.isPending}
              onClick={(e) => {
                e.stopPropagation();
                archivePool(pool);
              }}
            >
              Archivar
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  if (!predictionsActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Predicciones" subtitle="Programas de predicciones para tus jugadores" />
        <EmptyState
          icon={Target}
          title="Módulo Predicciones no activo"
          description="Activá el módulo predictions desde el catálogo para crear programas."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Predicciones</Button>
            </Link>
          }
        />
      </>
    );
  }

  const catalogLoading = mock !== 'empty' && listQ.isLoading;

  if (mock === 'loading' || catalogLoading) {
    return <Loading label="Cargando predicciones..." />;
  }

  if (mock === 'error' || listQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          listQ.refetch();
        }}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Predicciones"
        subtitle="Creá programas, agregá eventos y publicá prodes para tus jugadores"
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorPool('new')}>
            Nuevo programa
          </Button>
        }
      />

      <PredictionsSubNav />

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
                label={s === 'all' ? 'Todos' : s === 'open' ? 'Activos' : STATUS_LABELS[s] ?? s}
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
            <FilterPill active={participationFilter === 'all'} onClick={() => setParticipationFilter('all')} label="Todos" />
            <FilterPill active={participationFilter === 'free'} onClick={() => setParticipationFilter('free')} label="Gratis" />
            <FilterPill active={participationFilter === 'paid'} onClick={() => setParticipationFilter('paid')} label="Pagado" />
          </>
        }
      />

      <Table
        columns={columns}
        rows={pools}
        rowKey={(p) => p.id}
        onRowClick={(pool) => setDetailPool(pool)}
        emptyState={
          <EmptyState
            title="Sin programas"
            description="Creá tu primer programa de predicciones con eventos para que los jugadores participen."
            action={
              <Button variant="primary" onClick={() => setEditorPool('new')}>
                Crear primer programa
              </Button>
            }
          />
        }
      />

      <PoolFormModal
        open={editorPool !== null}
        pool={editorPool === 'new' ? null : editorPool}
        existingCodes={existingCodes}
        onClose={() => setEditorPool(null)}
      />
      <PredictionProgramDetailModal
        pool={detailPool}
        onClose={() => setDetailPool(null)}
        onEdit={(pool) => {
          setDetailPool(null);
          setEditorPool(pool);
        }}
        onArchive={(pool) => {
          archivePool(pool);
          setDetailPool(null);
        }}
      />
    </>
  );
}
