import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { IconButton } from '@/components/ui/IconButton';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { RowContextMenu, openRowContextMenu, type RowContextMenuAnchor } from '@/components/ui/RowContextMenu';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusPill } from '@/components/ui/StatusPill';
import { Switch } from '@/components/ui/Switch';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import {
  actionTypeLabel,
  MISSION_ACTION_TYPES,
  type MissionActionType,
} from '@/features/missions/missionActions';
import {
  useDeleteMission,
  useMissions,
  useSetMissionActive,
  type AdminMissionListItem,
} from '@/features/missionsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeDate } from '@/lib/format';

export default function MissionsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const q = useMissions();
  const nav = useNavigate();
  const setActive = useSetMissionActive();
  const del = useDeleteMission();

  const [actionFilter, setActionFilter] = useState<MissionActionType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<RowContextMenuAnchor | null>(null);
  const debouncedSearch = useDebounce(search, 250);

  const allRows = mock === 'empty' ? [] : (q.data ?? []);

  const rows = useMemo(() => {
    return allRows.filter((m) => {
      if (actionFilter !== 'all' && !m.actions.some((a) => a.type === actionFilter)) return false;
      if (debouncedSearch) {
        const qStr = debouncedSearch.toLowerCase();
        if (
          !m.name.toLowerCase().includes(qStr) &&
          !m.requirementsSummary.toLowerCase().includes(qStr)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [allRows, actionFilter, debouncedSearch]);

  const menuMission = menuAnchor ? allRows.find((m) => m.id === menuAnchor.id) : undefined;

  const cols: Column<AdminMissionListItem>[] = [
    {
      key: 'switch',
      header: '',
      width: '50px',
      render: (m) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={m.isActive}
            disabled={setActive.isPending}
            onChange={(active) => setActive.mutate({ id: m.id, active })}
            aria-label={m.isActive ? `Desactivar ${m.name}` : `Activar ${m.name}`}
          />
        </div>
      ),
    },
    {
      key: 'name',
      header: 'misión',
      render: (m) => (
        <button type="button" onClick={() => nav(`/misiones/${m.id}`)} className="text-left hover:text-accent">
          <b>{m.name}</b>
          <div className="text-[13px] text-text-tertiary">{m.description}</div>
        </button>
      ),
    },
    {
      key: 'type',
      header: 'tipo',
      render: (m) => (
        <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[13px] font-medium">{m.type}</span>
      ),
    },
    {
      key: 'requirements',
      header: 'requisitos',
      render: (m) => <span className="text-[14px] font-medium">{m.requirementsSummary}</span>,
    },
    {
      key: 'reward',
      header: 'recompensa',
      render: (m) => <span>{m.rewardSummary}</span>,
    },
    {
      key: 'progress',
      header: 'progreso',
      render: (m) => (
        <span>
          {m.progress.completed}/{m.progress.started}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'estado',
      render: (m) => (
        <StatusPill
          status={m.isActive ? 'active' : 'draft'}
          label={m.isActive ? 'activa' : 'inactiva'}
        />
      ),
    },
    {
      key: 'updated',
      header: 'actualizada',
      render: (m) => (
        <span className="text-[14px] text-text-secondary">
          {m.updatedAt ? formatRelativeDate(m.updatedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (m) => (
        <div className="relative flex justify-end">
          <IconButton
            icon={MoreVertical}
            title="acciones"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAnchor(openRowContextMenu(e, m.id, menuAnchor));
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Misiones"
        subtitle="Objetivos con recompensas para tus jugadores"
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => nav('/misiones/nueva')}>
            Nueva misión
          </Button>
        }
      />

      <Toolbar
        search={
          <SearchInput
            placeholder="Buscar por nombre o requisito..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
        filters={
          <>
            <FilterPill
              label="todos"
              active={actionFilter === 'all'}
              onClick={() => setActionFilter('all')}
            />
            {MISSION_ACTION_TYPES.map((t) => (
              <FilterPill
                key={t}
                label={actionTypeLabel(t)}
                active={actionFilter === t}
                onClick={() => setActionFilter(actionFilter === t ? 'all' : t)}
              />
            ))}
          </>
        }
      />

      {mock === 'empty' && rows.length === 0 && (
        <EmptyState
          title="No hay misiones"
          description="Creá una misión diaria con uno o más requisitos."
          action={
            <Button variant="primary" onClick={() => nav('/misiones/nueva')}>
              Crear misión
            </Button>
          }
        />
      )}
      {(mock === 'loading' || q.isLoading) && <Loading label="Cargando misiones..." />}
      {(mock === 'error' || q.isError) && <ErrorState onRetry={() => q.refetch()} />}
      {mock !== 'empty' && mock !== 'loading' && mock !== 'error' && !q.isLoading && !q.isError && (
        <Table
          columns={cols}
          rows={rows}
          rowKey={(m) => m.id}
          emptyState={
            <EmptyState
              title="No hay misiones"
              description="Creá una misión diaria con uno o más requisitos."
              action={
                <Button variant="primary" onClick={() => nav('/misiones/nueva')}>
                  Crear misión
                </Button>
              }
            />
          }
        />
      )}
      <RowContextMenu anchor={menuAnchor} onClose={() => setMenuAnchor(null)}>
        {menuMission && (
          <>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
              onClick={() => {
                setMenuAnchor(null);
                nav(`/misiones/${menuMission.id}`);
              }}
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-danger hover:bg-bg-tertiary"
              onClick={() => {
                setMenuAnchor(null);
                if (window.confirm(`¿Eliminar la misión "${menuMission.name}"?`)) {
                  void del.mutateAsync(menuMission.id);
                }
              }}
            >
              <Trash2 size={14} /> Eliminar
            </button>
          </>
        )}
      </RowContextMenu>
    </>
  );
}
