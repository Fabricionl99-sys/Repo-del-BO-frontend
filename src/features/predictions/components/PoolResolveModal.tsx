import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useResolvePoolPreview, useResolvePredictionPool } from '@/features/predictions/predictionsApi';
import { cn } from '@/lib/cn';
import type { PredictionPool } from '@/types/predictions';

export function PoolResolveModal({
  open,
  pool,
  onClose,
}: {
  open: boolean;
  pool: PredictionPool | null;
  onClose: () => void;
}) {
  const resolve = useResolvePredictionPool();
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) setSelections({});
  }, [open]);

  const results = useMemo(
    () =>
      Object.entries(selections).map(([event_id, winning_option_id]) => ({
        event_id,
        winning_option_id,
      })),
    [selections],
  );

  const previewQ = useResolvePoolPreview(open && pool ? pool.id : null, results);
  const preview = previewQ.data;
  const allSelected = pool ? pool.events.every((e) => selections[e.id]) : false;

  const handleClose = () => {
    setSelections({});
    onClose();
  };

  const confirm = async () => {
    if (!pool || !allSelected) return;
    await resolve.mutateAsync({ id: pool.id, results });
    handleClose();
  };

  if (!pool) return null;

  const total = pool.events.length;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Resolver prode — ${pool.name}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            disabled={!allSelected}
            loading={resolve.isPending}
            onClick={confirm}
          >
            Confirmar y entregar
          </Button>
        </>
      }
    >
      <p className="mb-4 text-[14px] text-text-secondary">
        Marcá el resultado de cada partido. El sistema calculará aciertos y entregará premios.
      </p>

      <div className="space-y-4">
        {pool.events
          .sort((a, b) => a.display_order - b.display_order)
          .map((ev, idx) => (
            <div key={ev.id} className="card p-4">
              <p className="mb-1 text-[12px] font-semibold uppercase text-text-tertiary">
                Partido {idx + 1} · {ev.prediction_type}
              </p>
              <p className="mb-3 font-semibold">{ev.name}</p>
              <div className="flex flex-wrap gap-2">
                {ev.options
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelections((s) => ({ ...s, [ev.id]: opt.id }))}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors',
                        selections[ev.id] === opt.id
                          ? 'border-accent bg-accent text-text-onAccent'
                          : 'border-border-default hover:border-accent/50',
                      )}
                    >
                      {opt.text}
                    </button>
                  ))}
              </div>
            </div>
          ))}
      </div>

      {allSelected && preview && (
        <div className="mt-6 rounded-lg border border-border-subtle bg-bg-tertiary p-4">
          <h4 className="mb-3 text-[14px] font-semibold">Preview de resultados</h4>
          <ul className="space-y-1 text-[14px]">
            {preview.by_hits.map((row) => (
              <li key={row.hits}>
                · {row.count} jugador{row.count !== 1 ? 'es' : ''} acertaron {row.hits}/{total}
              </li>
            ))}
            <li className="mt-2 font-semibold text-accent">
              · {preview.all_correct_count} jugador{preview.all_correct_count !== 1 ? 'es' : ''}{' '}
              acertaron TODOS los partidos
            </li>
          </ul>
          <p className="mt-3 text-[13px] text-text-secondary">
            Total premios a entregar: {preview.total_prizes_summary}
          </p>
        </div>
      )}
    </Modal>
  );
}
