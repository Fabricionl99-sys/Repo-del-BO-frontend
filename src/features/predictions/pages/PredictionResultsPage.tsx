import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { PredictionsSubNav } from '@/features/predictions/components/PredictionsSubNav';
import { ResolveEventModal } from '@/features/predictions/components/ResolveEventModal';
import { usePredictionEventsCatalog } from '@/features/predictions/predictionsApi';
import {
  buildEventRows,
  filterEventRows,
  isEventPending,
  sortEventRows,
  winningOptionLabel,
  type EventResultFilter,
  type PredictionEventRow,
} from '@/features/predictions/predictionResults';
import { formatRelativeDate } from '@/lib/format';

export default function PredictionResultsPage() {
  const catalogQ = usePredictionEventsCatalog();
  const [filter, setFilter] = useState<EventResultFilter>('pending');
  const [resolveRow, setResolveRow] = useState<PredictionEventRow | null>(null);

  const rows = useMemo(() => {
    const all = buildEventRows(catalogQ.data ?? []);
    return sortEventRows(filterEventRows(all, filter));
  }, [catalogQ.data, filter]);

  if (catalogQ.isLoading) return <Loading label="Cargando eventos..." />;

  if (catalogQ.isError) {
    return (
      <>
        <PageHeader title="Predicciones" subtitle="Subí el resultado real de cada evento" />
        <PredictionsSubNav />
        <ErrorState onRetry={() => catalogQ.refetch()} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Predicciones" subtitle="Subí el resultado real de cada evento — el backend entrega rewards automáticamente" />

      <PredictionsSubNav />

      <div className="mb-4 flex flex-wrap gap-2">
        <FilterPill active={filter === 'pending'} onClick={() => setFilter('pending')} label="Pendientes" />
        <FilterPill active={filter === 'resolved'} onClick={() => setFilter('resolved')} label="Histórico" />
        <FilterPill active={filter === 'all'} onClick={() => setFilter('all')} label="Todos" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={filter === 'pending' ? 'Sin eventos pendientes de resultado' : 'Sin eventos para mostrar'}
          description={
            filter === 'pending'
              ? 'Cuando venza el plazo de predicción de un evento, aparecerá acá para cargar el resultado.'
              : 'Probá otro filtro o creá eventos en un programa activo.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary shadow-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-tertiary/50">
                <th className="px-4 py-3 text-left label-section font-semibold">Programa</th>
                <th className="px-4 py-3 text-left label-section font-semibold">Evento</th>
                <th className="px-4 py-3 text-left label-section font-semibold">Cierra</th>
                <th className="px-4 py-3 text-left label-section font-semibold">Estado</th>
                <th className="px-4 py-3 text-right label-section font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const resolved = Boolean(row.event.winning_option_id);
                const pending = isEventPending(row);
                const winner = winningOptionLabel(row);
                return (
                  <tr key={row.event.id} className="border-b border-border-subtle last:border-b-0">
                    <td className="px-4 py-3 text-[14px] text-text-secondary">{row.pool.name}</td>
                    <td className="px-4 py-3 text-[14px] font-medium">{row.event.name}</td>
                    <td className="px-4 py-3 text-[13px] text-text-secondary">
                      {formatRelativeDate(row.predictDeadlineAt)}
                    </td>
                    <td className="px-4 py-3">
                      {resolved ? (
                        <div className="space-y-1">
                          <StatusPill status="finished" label="Resuelto" />
                          {winner ? (
                            <p className="text-[13px] font-semibold text-success">✓ {winner}</p>
                          ) : null}
                        </div>
                      ) : pending ? (
                        <StatusPill status="scheduled" label="Pendiente" />
                      ) : (
                        <StatusPill status="draft" label="En curso" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {pending ? (
                        <Button size="sm" variant="primary" onClick={() => setResolveRow(row)}>
                          Resolver
                        </Button>
                      ) : resolved ? (
                        <span className="text-[13px] text-text-tertiary">—</span>
                      ) : (
                        <span className="text-[13px] text-text-tertiary">Aún no vence</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ResolveEventModal open={resolveRow !== null} row={resolveRow} onClose={() => setResolveRow(null)} />
    </>
  );
}
