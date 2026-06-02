import { MoreVertical, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { DeliverPhysicalModal } from '@/features/raffles/components/DeliverPhysicalModal';
import { RaffleFormModal } from '@/features/raffles/components/RaffleFormModal';
import { RaffleStatusBadge } from '@/features/raffles/components/RaffleStatusBadge';
import {
  useCancelRaffle,
  useDeleteRafflePermanent,
  usePendingPhysicalWinners,
  useRaffles,
} from '@/features/raffles/rafflesApi';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type { RaffleDetail, RaffleRow, RaffleStatus, RaffleWinnerRow } from '@/types/raffles';

const tabs = ['Sorteos', 'Premios físicos pendientes'] as const;
type Tab = (typeof tabs)[number];

const statusFilters: Array<'all' | RaffleStatus> = ['all', 'draft', 'open', 'drawing', 'closed', 'cancelled'];

const statusFilterLabels: Record<(typeof statusFilters)[number], string> = {
  all: 'Todos',
  draft: 'Borrador',
  open: 'Abierto',
  drawing: 'Sorteando',
  closed: 'Cerrado',
  cancelled: 'Cancelado',
};

export default function RafflesPage() {
  const navigate = useNavigate();
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const rafflesActive = isModuleActive(activeModuleCodes, 'raffles');

  const [tab, setTab] = useState<Tab>('Sorteos');
  const [statusFilter, setStatusFilter] = useState<'all' | RaffleStatus>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const [editor, setEditor] = useState<RaffleDetail | null | 'new'>(null);
  const [deliverWinner, setDeliverWinner] = useState<RaffleWinnerRow | null>(null);
  const [cancelTarget, setCancelTarget] = useState<RaffleRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RaffleRow | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<RowContextMenuAnchor | null>(null);
  const [menuRaffle, setMenuRaffle] = useState<RaffleRow | null>(null);

  const listQ = useRaffles({ status: statusFilter, search: debouncedSearch || undefined });
  const pendingQ = usePendingPhysicalWinners();
  const cancelRaffle = useCancelRaffle();
  const deletePermanent = useDeleteRafflePermanent();

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRaffle(null);
  };

  const columns: Column<RaffleRow>[] = useMemo(
    () => [
      { key: 'name', header: 'Nombre', render: (r) => r.name },
      { key: 'code', header: 'Código', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
      { key: 'status', header: 'Estado', render: (r) => <RaffleStatusBadge status={r.status} /> },
      { key: 'entries', header: 'Entradas', render: (r) => r.total_entries },
      { key: 'deadline', header: 'Cierra', render: (r) => formatRelativeDate(r.deadline) },
      { key: 'winners', header: 'Premios', render: (r) => r.winner_count },
      {
        key: 'actions',
        header: '',
        render: (r) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/sorteos/${r.code}`)}>
              Ver
            </Button>
            <IconButton
              icon={MoreVertical}
              title="Acciones"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setMenuRaffle(r);
                setMenuAnchor(openRowContextMenu(e, r.id, menuAnchor));
              }}
            />
          </div>
        ),
      },
    ],
    [navigate, menuAnchor],
  );

  if (!rafflesActive) {
    return (
      <EmptyState
        title="Módulo Sorteos inactivo"
        description="Activá el módulo raffles desde el catálogo para crear sorteos provably-fair."
        action={
          <Link to="/modulos?activar=raffles">
            <Button variant="primary">Activar módulo</Button>
          </Link>
        }
      />
    );
  }

  if (listQ.isLoading && tab === 'Sorteos') return <Loading label="Cargando sorteos…" />;
  if (listQ.isError && tab === 'Sorteos') {
    return <ErrorState title="No pudimos cargar sorteos" onRetry={() => void listQ.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Sorteos" subtitle="Sorteos provably-fair con moneda dedicada (gemas)" />

      <Toolbar
        filters={
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <FilterPill key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
            ))}
          </div>
        }
        right={
          tab === 'Sorteos' ? (
            <Button variant="primary" onClick={() => setEditor('new')}>
              <Plus className="mr-1 h-4 w-4" /> Nuevo sorteo
            </Button>
          ) : undefined
        }
      />

      {tab === 'Sorteos' ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {statusFilters.map((s) => (
              <FilterPill
                key={s}
                label={statusFilterLabels[s]}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar sorteo…" className="max-w-xs" />
          </div>
          {(listQ.data ?? []).length === 0 ? (
            <EmptyState title="Sin sorteos" description="Creá el primer sorteo en borrador y publicalo cuando esté listo." />
          ) : (
            <Table columns={columns} rows={listQ.data ?? []} rowKey={(r) => r.id} />
          )}
        </>
      ) : (
        <>
          {pendingQ.isLoading ? <Loading label="Cargando pendientes…" /> : null}
          {(pendingQ.data ?? []).length === 0 ? (
            <EmptyState title="Nada pendiente" description="No hay premios físicos sin despachar." />
          ) : (
            <Table
              rowKey={(w) => w.id}
              rows={pendingQ.data ?? []}
              columns={[
                { key: 'raffle', header: 'Sorteo', render: (w) => w.raffle_name ?? w.raffle_id.slice(0, 8) },
                { key: 'pos', header: 'Posición', render: (w) => `#${w.position}` },
                {
                  key: 'prize',
                  header: 'Premio',
                  render: (w) => w.prize_physical_name ?? (w.prize_type === 'bonus' ? 'Bono' : '—'),
                },
                { key: 'ticket', header: 'Ticket', render: (w) => `#${w.winning_ticket_number}` },
                { key: 'player', header: 'Jugador', render: (w) => w.player_external_id || w.player_state_id.slice(0, 8) },
                {
                  key: 'act',
                  header: '',
                  render: (w) => (
                    <Button variant="secondary" size="sm" onClick={() => setDeliverWinner(w)}>
                      Marcar entregado
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </>
      )}

      <RowContextMenu anchor={menuAnchor} onClose={closeMenu}>
        {menuRaffle && (menuRaffle.status === 'draft' || menuRaffle.status === 'open') && (
          <>
            {menuRaffle.status === 'draft' && (
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
                onClick={() => {
                  navigate(`/sorteos/${menuRaffle.code}`);
                  closeMenu();
                }}
              >
                Editar
              </button>
            )}
            <button
              type="button"
              className="block w-full px-3 py-2 text-left text-[14px] text-danger hover:bg-bg-tertiary"
              onClick={() => {
                setCancelTarget(menuRaffle);
                closeMenu();
              }}
            >
              Cancelar
            </button>
          </>
        )}
        {menuRaffle?.status === 'cancelled' && (
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-[14px] text-danger hover:bg-bg-tertiary"
            onClick={() => {
              setDeleteTarget(menuRaffle);
              closeMenu();
            }}
          >
            Eliminar definitivo
          </button>
        )}
      </RowContextMenu>

      <ArchiveConfirmModal
        open={cancelTarget !== null}
        title={cancelTarget ? `Cancelar "${cancelTarget.name}"` : 'Cancelar sorteo'}
        description="El sorteo se cancelará y se reembolsarán las gemas de las entradas."
        confirmLabel="Cancelar sorteo"
        loading={cancelRaffle.isPending}
        onClose={() => setCancelTarget(null)}
        onConfirm={async (reason) => {
          if (!cancelTarget) return;
          await cancelRaffle.mutateAsync({ code: cancelTarget.code, reason });
        }}
      />

      <PermanentDeleteModal
        open={deleteTarget !== null}
        itemKind="sorteo"
        itemName={deleteTarget?.name ?? ''}
        confirmCode={deleteTarget?.code ?? ''}
        loading={deletePermanent.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deletePermanent.mutateAsync(deleteTarget.code);
        }}
      />

      <RaffleFormModal open={editor !== null} raffle={editor === 'new' ? null : editor} onClose={() => setEditor(null)} />
      <DeliverPhysicalModal open={Boolean(deliverWinner)} winner={deliverWinner} onClose={() => setDeliverWinner(null)} />
    </div>
  );
}
