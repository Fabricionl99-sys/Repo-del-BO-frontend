import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { usePredictionPlayers, useResolvePrediction } from '@/features/predictions/predictionsApi';
import { cn } from '@/lib/cn';
import type { PredictionEvent } from '@/types/predictions';

export function PredictionResolveModal({
  open,
  event,
  onClose,
}: {
  open: boolean;
  event: PredictionEvent | null;
  onClose: () => void;
}) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const resolve = useResolvePrediction();
  const playersQ = usePredictionPlayers(open && event ? event.id : null);
  const players = playersQ.data ?? [];

  const winnerCount = useMemo(() => {
    if (!selectedOptionId) return 0;
    return players.filter((p) => p.option_id === selectedOptionId).length;
  }, [players, selectedOptionId]);

  const handleClose = () => {
    setSelectedOptionId(null);
    onClose();
  };

  const confirm = async () => {
    if (!event || !selectedOptionId) return;
    await resolve.mutateAsync({ id: event.id, winning_option_id: selectedOptionId });
    handleClose();
  };

  if (!event) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Resolver evento"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={!selectedOptionId}
            loading={resolve.isPending}
            onClick={confirm}
          >
            Confirmar y resolver
          </Button>
        </>
      }
    >
      <p className="mb-4 text-[14px] text-text-secondary">
        Elegí la opción ganadora de <strong>{event.name}</strong>
      </p>
      <div className="space-y-2">
        {event.options
          .sort((a, b) => a.display_order - b.display_order)
          .map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedOptionId(opt.id)}
              className={cn(
                'card w-full p-4 text-left transition-colors',
                selectedOptionId === opt.id && 'border-accent bg-accent-subtle',
              )}
            >
              <span className="font-semibold">{opt.text}</span>
              {opt.description && (
                <p className="mt-1 text-[13px] text-text-tertiary">{opt.description}</p>
              )}
            </button>
          ))}
      </div>
      {selectedOptionId && (
        <p className="mt-4 rounded-lg bg-success/10 px-4 py-3 text-[14px] text-success">
          {winnerCount} jugador{winnerCount !== 1 ? 'es' : ''} acertaron · se entregará premio a todos
        </p>
      )}
    </Modal>
  );
}
