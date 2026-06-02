import { MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PlayerSearchResults } from '@/components/players/PlayerSearchResults';
import { ArchiveConfirmModal } from '@/components/lifecycle/ArchiveConfirmModal';
import { PermanentDeleteModal } from '@/components/lifecycle/PermanentDeleteModal';
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
  useArchiveMission,
  useDeleteMissionPermanent,
  useGrantMissionManual,
  useMissions,
  useMissionsForGrant,
  useSetMissionActive,
  type AdminMissionListItem,
} from '@/features/missionsApi';
import { usePlayerSearch } from '@/features/players/playersApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import { GRANT_PLAYER_MESSAGE_LABEL, GRANT_PLAYER_MESSAGE_PLACEHOLDER } from '@/types/avatars';

const tabs = ['Catálogo', 'Asignación manual'] as const;
type Tab = (typeof tabs)[number];

export default function MissionsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const q = useMissions();
  const grantMissionsQ = useMissionsForGrant();
  const nav = useNavigate();
  const setActive = useSetMissionActive();
  const archiveMission = useArchiveMission();
  const deleteMissionPermanent = useDeleteMissionPermanent();
  const grantManual = useGrantMissionManual();

  const [tab, setTab] = useState<Tab>('Catálogo');
  const [actionFilter, setActionFilter] = useState<MissionActionType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<RowContextMenuAnchor | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<AdminMissionListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMissionListItem | null>(null);
  const [grantPlayerId, setGrantPlayerId] = useState('');
  const [grantPlayerQuery, setGrantPlayerQuery] = useState('');
  const [grantMissionId, setGrantMissionId] = useState('');
  const [grantReason, setGrantReason] = useState('');

  const debouncedSearch = useDebounce(search, 250);
  const debouncedGrantQuery = useDebounce(grantPlayerQuery, 250);
  const playerSearchQ = usePlayerSearch(debouncedGrantQuery);

  const allRows = mock === 'empty' ? [] : (q.data ?? []);
  const grantMissions = grantMissionsQ.data ?? [];

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
  const closeMenu = () => setMenuAnchor(null);

  const catalogLoading = mock !== 'empty' && tab === 'Catálogo' && q.isLoading;
  const grantLoading = tab === 'Asignación manual' && grantMissionsQ.isLoading;

  if (mock === 'loading' || catalogLoading || grantLoading) {
    return <Loading label="Cargando misiones..." />;
  }

  const handleGrant = async () => {
    if (!grantPlayerId.trim() || !grantMissionId) return;
    await grantManual.mutateAsync({
      missionId: grantMissionId,
      playerStateId: grantPlayerId.trim(),
      reason: grantReason.trim() || undefined,
    });
    setGrantPlayerId('');
    setGrantPlayerQuery('');
    setGrantMissionId('');
    setGrantReason('');
  };

  const cols: Column<AdminMissionListItem>[] = [
    {
      key: 'switch',
      header: '',
      width: '50px',
      render: (m) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={m.isActive}
            disabled={setActive.isPending || m.status === 'archived'}
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
        <button
          type="button"
          onClick={() => nav(`/misiones/${m.id}`)}
          className="text-left hover:text-accent"
          disabled={m.status === 'archived'}
        >
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
          status={m.status === 'archived' ? 'archived' : m.isActive ? 'active' : 'draft'}
          label={m.status === 'archived' ? 'archivada' : m.isActive ? 'activa' : 'inactiva'}
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
          tab === 'Catálogo' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => nav('/misiones/nueva')}>
              Nueva misión
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

      {tab === 'Catálogo' && (
        <>
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
        </>
      )}

      {tab === 'Asignación manual' && (
        <div className="max-w-lg space-y-4 rounded-xl border border-border-subtle bg-bg-secondary p-6">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Buscar jugador</label>
            <SearchInput
              placeholder="external_player_id (mín. 2 chars)..."
              value={grantPlayerQuery}
              onChange={(e) => setGrantPlayerQuery(e.target.value)}
            />
            <PlayerSearchResults
              results={playerSearchQ.data}
              onSelect={(p) => {
                setGrantPlayerId(p.player_id);
                setGrantPlayerQuery(p.external_player_id);
              }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">player_id seleccionado</label>
            <input
              className="field font-mono text-[14px]"
              value={grantPlayerId}
              onChange={(e) => setGrantPlayerId(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Misión a asignar</label>
            {grantMissions.length === 0 ? (
              <p className="text-[14px] text-text-tertiary">Activá una misión primero en el Catálogo</p>
            ) : (
              <select
                className="field"
                value={grantMissionId}
                onChange={(e) => setGrantMissionId(e.target.value)}
              >
                <option value="">Elegí…</option>
                {grantMissions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">{GRANT_PLAYER_MESSAGE_LABEL}</label>
            <textarea
              className="field min-h-16"
              placeholder={GRANT_PLAYER_MESSAGE_PLACEHOLDER}
              value={grantReason}
              onChange={(e) => setGrantReason(e.target.value)}
            />
          </div>
          <Button
            variant="primary"
            loading={grantManual.isPending}
            disabled={!grantPlayerId.trim() || !grantMissionId}
            onClick={handleGrant}
          >
            Asignar
          </Button>
        </div>
      )}

      <RowContextMenu anchor={menuAnchor} onClose={closeMenu}>
        {menuMission?.status !== 'archived' && (
          <>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
              onClick={() => {
                closeMenu();
                nav(`/misiones/${menuMission!.id}`);
              }}
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-danger hover:bg-bg-tertiary"
              onClick={() => {
                setArchiveTarget(menuMission!);
                closeMenu();
              }}
            >
              <Trash2 size={14} /> Archivar
            </button>
          </>
        )}
        {menuMission?.status === 'archived' && (
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-danger hover:bg-bg-tertiary"
            onClick={() => {
              setDeleteTarget(menuMission);
              closeMenu();
            }}
          >
            <Trash2 size={14} /> Eliminar definitivo
          </button>
        )}
      </RowContextMenu>

      <ArchiveConfirmModal
        open={archiveTarget !== null}
        title={archiveTarget ? `Archivar "${archiveTarget.name}"` : 'Archivar misión'}
        description="La misión dejará de estar disponible para nuevos jugadores. El historial de asignaciones se conserva."
        loading={archiveMission.isPending}
        onClose={() => setArchiveTarget(null)}
        onConfirm={async (reason) => {
          if (!archiveTarget) return;
          await archiveMission.mutateAsync({ id: archiveTarget.id, reason });
        }}
      />

      <PermanentDeleteModal
        open={deleteTarget !== null}
        itemKind="misión"
        itemName={deleteTarget?.name ?? ''}
        confirmCode={deleteTarget?.code ?? ''}
        loading={deleteMissionPermanent.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMissionPermanent.mutateAsync(deleteTarget.id);
        }}
      />
    </>
  );
}
