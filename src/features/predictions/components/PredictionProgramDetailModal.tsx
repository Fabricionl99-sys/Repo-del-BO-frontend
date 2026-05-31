import { Link } from 'react-router-dom';

import { getApiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { StatusPill } from '@/components/ui/StatusPill';
import { EventFormModal } from '@/features/predictions/components/EventFormModal';
import { PoolLeaderboardModal } from '@/features/predictions/components/PoolLeaderboardModal';
import { ResolveEventModal } from '@/features/predictions/components/ResolveEventModal';
import {
  useDeletePredictionEvent,
  useOpenPredictionPool,
  usePredictionPool,
} from '@/features/predictions/predictionsApi';
import { STATUS_LABELS } from '@/features/predictions/poolForm';
import {
  buildEventRows,
  isEventPending,
  type PredictionEventRow,
} from '@/features/predictions/predictionResults';
import { formatRelativeDate } from '@/lib/format';
import { toast } from '@/stores/toastStore';
import type { PoolMatch, PredictionPool, PredictionPoolStatus } from '@/types/predictions';
import { useMemo, useState } from 'react';

function eventStatusLabel(event: PoolMatch): { status: 'live' | 'scheduled' | 'finished' | 'draft'; label: string } {
  if (event.winning_option_id) return { status: 'finished', label: 'Resuelto' };
  const deadline = event.predict_deadline_at ? new Date(event.predict_deadline_at).getTime() : 0;
  if (deadline && deadline <= Date.now()) return { status: 'scheduled', label: 'Cerrado' };
  return { status: 'live', label: 'Abierto' };
}

function programStatusPill(status: PredictionPoolStatus) {
  if (status === 'open') return <StatusPill status="live" label="Activo" />;
  if (status === 'draft') return <StatusPill status="draft" label={STATUS_LABELS.draft} />;
  if (status === 'cancelled') return <StatusPill status="error" label="Archivado" />;
  if (status === 'resolved') return <StatusPill status="finished" label="Resuelto" />;
  return <StatusPill status="scheduled" label={STATUS_LABELS[status] ?? status} />;
}

export function PredictionProgramDetailModal({
  pool,
  onClose,
  onEdit,
  onArchive,
}: {
  pool: PredictionPool | null;
  onClose: () => void;
  onEdit: (pool: PredictionPool) => void;
  onArchive: (pool: PredictionPool) => void;
}) {
  const detailQ = usePredictionPool(pool?.code ?? null);
  const publish = useOpenPredictionPool();
  const removeEvent = useDeletePredictionEvent();
  const [eventEditor, setEventEditor] = useState<PoolMatch | null | 'new'>(null);
  const [resolveRow, setResolveRow] = useState<PredictionEventRow | null>(null);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);

  const program = detailQ.data ?? pool;
  const eventRows = useMemo(
    () => (program ? buildEventRows([program]) : []),
    [program],
  );

  if (!pool) return null;

  const canEditEvents = program?.status === 'draft';
  const canAddEvents = program && program.status !== 'cancelled';

  const deleteEvent = async (eventId: string) => {
    if (!program) return;
    if (!window.confirm('¿Eliminar este evento? Solo es posible si no tiene predicciones.')) return;
    try {
      await removeEvent.mutateAsync({ eventId, programCode: program.code });
      toast.success('Evento eliminado');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar el evento'));
    }
  };

  const publishProgram = async () => {
    if (!program) return;
    if (!window.confirm(`¿Publicar "${program.name}"? Los jugadores podrán participar.`)) return;
    try {
      await publish.mutateAsync(program.code ?? program.id);
      toast.success('Programa publicado');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo publicar'));
    }
  };

  return (
    <>
      <Modal
        open={Boolean(pool)}
        onClose={onClose}
        title={program?.name ?? pool.name}
        description={program?.description}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
            {program?.status === 'draft' ? (
              <>
                <Button variant="secondary" onClick={() => onEdit(program)}>
                  Editar programa
                </Button>
                <Button variant="primary" loading={publish.isPending} onClick={publishProgram}>
                  Publicar
                </Button>
              </>
            ) : null}
            {program && ['open', 'closed', 'resolving'].includes(program.status) ? (
              <Button variant="danger" onClick={() => onArchive(program)}>
                Archivar
              </Button>
            ) : null}
          </>
        }
      >
        {detailQ.isLoading && !program?.events.length ? (
          <Loading label="Cargando eventos..." />
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {program ? programStatusPill(program.status) : null}
              <span className="text-[13px] text-text-secondary">
                {program?.total_events_count ?? 0} eventos · cierra {formatRelativeDate(program?.closes_at ?? pool.closes_at)}
              </span>
              <Button size="sm" variant="secondary" onClick={() => setLeaderboardOpen(true)}>
                Ver ranking
              </Button>
              <Link to="/predicciones/resultados" className="text-[13px] font-semibold text-accent hover:underline">
                Ir a Resultados
              </Link>
            </div>

            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-semibold">Eventos</h3>
              {canAddEvents ? (
                <Button size="sm" variant="primary" onClick={() => setEventEditor('new')}>
                  + Agregar evento
                </Button>
              ) : null}
            </div>

            {eventRows.length === 0 ? (
              <p className="text-[14px] text-text-tertiary">Sin eventos. Agregá partidos al programa.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border-subtle">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border-subtle bg-bg-tertiary/50">
                      <th className="px-3 py-2 text-left text-[13px] font-semibold">Evento</th>
                      <th className="px-3 py-2 text-left text-[13px] font-semibold">Cierra</th>
                      <th className="px-3 py-2 text-left text-[13px] font-semibold">Estado</th>
                      <th className="px-3 py-2 text-right text-[13px] font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventRows.map((row) => {
                      const pill = eventStatusLabel(row.event);
                      const pending = isEventPending(row);
                      return (
                        <tr key={row.event.id} className="border-b border-border-subtle last:border-b-0">
                          <td className="px-3 py-2 text-[14px]">{row.event.name}</td>
                          <td className="px-3 py-2 text-[13px] text-text-secondary">
                            {formatRelativeDate(row.predictDeadlineAt)}
                          </td>
                          <td className="px-3 py-2">
                            <StatusPill status={pill.status} label={pill.label} />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              {canEditEvents ? (
                                <>
                                  <Button size="sm" variant="ghost" onClick={() => setEventEditor(row.event)}>
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    loading={removeEvent.isPending}
                                    onClick={() => deleteEvent(row.event.id)}
                                  >
                                    Borrar
                                  </Button>
                                </>
                              ) : null}
                              {pending ? (
                                <Button size="sm" variant="primary" onClick={() => setResolveRow(row)}>
                                  Resolver
                                </Button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      {program ? (
        <>
          <EventFormModal
            open={eventEditor !== null}
            programCode={program.code}
            closesAt={program.closes_at}
            event={eventEditor === 'new' ? null : eventEditor}
            onClose={() => setEventEditor(null)}
          />
          <ResolveEventModal open={resolveRow !== null} row={resolveRow} onClose={() => setResolveRow(null)} />
          <PoolLeaderboardModal
            open={leaderboardOpen}
            pool={program}
            onClose={() => setLeaderboardOpen(false)}
          />
        </>
      ) : null}
    </>
  );
}
