import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ArchiveConfirmModal } from '@/components/lifecycle/ArchiveConfirmModal';
import { PermanentDeleteModal } from '@/components/lifecycle/PermanentDeleteModal';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table } from '@/components/ui/Table';
import { RaffleFormModal } from '@/features/raffles/components/RaffleFormModal';
import { RaffleStatusBadge } from '@/features/raffles/components/RaffleStatusBadge';
import {
  useCancelRaffle,
  useDeleteRafflePermanent,
  useOpenRaffle,
  useRaffleDetail,
  useRaffleWinners,
} from '@/features/raffles/rafflesApi';
import { formatCurrencyAmount, useCurrency } from '@/features/currencies/useCurrencies';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';

export default function RaffleDetailPage() {
  const { code = '' } = useParams();
  const tenantId = useOperatorStore((s) => s.current?.id ?? '');
  const detailQ = useRaffleDetail(code);
  const winnersQ = useRaffleWinners(code);
  const { currency: entryCurrency } = useCurrency(detailQ.data?.entry_cost_currency_id);
  const openRaffle = useOpenRaffle();
  const cancelRaffle = useCancelRaffle();
  const deletePermanent = useDeleteRafflePermanent();
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (detailQ.isLoading) return <Loading label="Cargando sorteo…" />;
  if (detailQ.isError || !detailQ.data) {
    return <ErrorState title="Sorteo no encontrado" onRetry={() => void detailQ.refetch()} />;
  }

  const raffle = detailQ.data;
  const gemsCollected = raffle.total_entries * raffle.entry_cost_amount;
  const verifyUrl = tenantId
    ? `https://api.social2game.com/v1/public/raffles/${tenantId}/${raffle.code}/verify`
    : null;

  const handleCancel = async (reason?: string) => {
    await cancelRaffle.mutateAsync({ code: raffle.code, reason });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={raffle.name}
        subtitle={`Código ${raffle.code}`}
        actions={
          <Link to="/sorteos">
            <Button variant="ghost">← Volver</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <RaffleStatusBadge status={raffle.status} />
        <span className="text-sm text-text-secondary">{formatNumber(raffle.total_entries)} entradas</span>
        <span className="text-sm text-text-secondary">
          Recaudado: {formatCurrencyAmount(gemsCollected, entryCurrency)}
        </span>
        <span className="text-sm text-text-secondary">Cierra {formatRelativeDate(raffle.deadline)}</span>
      </div>

      <div className="rounded-lg border border-border-default bg-bg-secondary p-4 text-sm">
        <p className="text-text-secondary">{raffle.description || 'Sin descripción'}</p>
        <p className="mt-2 font-mono text-xs text-text-tertiary">Commitment: {raffle.server_seed_commitment.slice(0, 16)}…</p>
        {raffle.server_seed_revealed ? (
          <p className="mt-1 font-mono text-xs text-accent">Seed revelada: {raffle.server_seed_revealed.slice(0, 16)}…</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {raffle.status === 'draft' ? (
          <>
            <Button variant="primary" disabled={openRaffle.isPending} onClick={() => void openRaffle.mutateAsync(raffle.code)}>
              Publicar
            </Button>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
            <Button variant="danger" disabled={cancelRaffle.isPending} onClick={() => setCancelOpen(true)}>
              Cancelar
            </Button>
          </>
        ) : null}
        {raffle.status === 'open' ? (
          <Button variant="danger" disabled={cancelRaffle.isPending} onClick={() => setCancelOpen(true)}>
            Cancelar (reembolso gemas)
          </Button>
        ) : null}
        {raffle.status === 'closed' && verifyUrl ? (
          <a href={verifyUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary">Verificación pública</Button>
          </a>
        ) : null}
        {raffle.status === 'cancelled' ? (
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            Eliminar definitivo
          </Button>
        ) : null}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Premios</h2>
        <Table
          rowKey={(p) => p.id}
          rows={raffle.prizes}
          columns={[
            { key: 'pos', header: '#', render: (p) => p.position },
            { key: 'type', header: 'Tipo', render: (p) => p.prize_type },
            {
              key: 'name',
              header: 'Detalle',
              render: (p) => (p.prize_type === 'physical' ? p.prize_physical_name : p.prize_bonus_id?.slice(0, 8)),
            },
          ]}
        />
      </section>

      {raffle.status === 'closed' ? (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Ganadores</h2>
          {winnersQ.isLoading ? <Loading label="Ganadores…" /> : null}
          <Table
            rowKey={(w) => w.id}
            rows={winnersQ.data ?? []}
            columns={[
              { key: 'pos', header: 'Posición', render: (w) => `#${w.position}` },
              { key: 'ticket', header: 'Ticket', render: (w) => `#${w.winning_ticket_number}` },
              { key: 'player', header: 'Jugador', render: (w) => w.player_external_id || '—' },
              {
                key: 'prize',
                header: 'Premio',
                render: (w) =>
                  w.prize_type === 'physical' ? w.prize_physical_name ?? 'Premio físico' : 'Bono (automático)',
              },
            ]}
          />
        </section>
      ) : null}

      <RaffleFormModal open={editOpen} raffle={raffle} onClose={() => setEditOpen(false)} />

      <ArchiveConfirmModal
        open={cancelOpen}
        title={`Cancelar "${raffle.name}"`}
        description="El sorteo se cancelará y se reembolsarán las gemas de las entradas."
        confirmLabel="Cancelar sorteo"
        loading={cancelRaffle.isPending}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />

      <PermanentDeleteModal
        open={deleteOpen}
        itemKind="sorteo"
        itemName={raffle.name}
        confirmCode={raffle.code}
        loading={deletePermanent.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await deletePermanent.mutateAsync(raffle.code);
        }}
      />
    </div>
  );
}
