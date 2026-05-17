import { Modal } from '@/components/ui/Modal';
import { Table, type Column } from '@/components/ui/Table';
import { usePredictionPlayers } from '@/features/predictions/predictionsApi';
import { formatRelativeDate } from '@/lib/format';
import type { PlayerPrediction, PredictionEvent } from '@/types/predictions';

export function PredictionParticipantsModal({
  open,
  event,
  onClose,
}: {
  open: boolean;
  event: PredictionEvent | null;
  onClose: () => void;
}) {
  const playersQ = usePredictionPlayers(open && event ? event.id : null);
  const players = playersQ.data ?? [];

  const columns: Column<PlayerPrediction>[] = [
    { key: 'player', header: 'Jugador', render: (r) => r.player_handle },
    { key: 'option', header: 'Opción elegida', render: (r) => r.option_text },
    {
      key: 'predicted_at',
      header: 'Predijo',
      render: (r) => formatRelativeDate(r.predicted_at),
    },
    {
      key: 'is_winner',
      header: 'Ganador',
      render: (r) =>
        r.is_winner === null ? '—' : r.is_winner ? 'Sí' : 'No',
    },
    {
      key: 'reward',
      header: 'Premio entregado',
      render: (r) => (r.reward_delivered_at ? formatRelativeDate(r.reward_delivered_at) : '—'),
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Participantes" size="lg">
      {event && (
        <p className="mb-4 text-[14px] text-text-secondary">
          {event.name} · {players.length} predicciones
        </p>
      )}
      <Table
        columns={columns}
        rows={players}
        rowKey={(r) => r.id}
        emptyState={<p className="py-8 text-center text-[14px] text-text-tertiary">Sin participantes</p>}
      />
    </Modal>
  );
}
