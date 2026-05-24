import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useReviewAntiFraudAlert } from '@/features/antiFraud/antiFraudApi';
import { getApiErrorStatus } from '@/lib/apiErrorMessage';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import type { AntiFraudAlert } from '@/types/antiFraud';

interface Props {
  alert: AntiFraudAlert | null;
  onClose: () => void;
  onReviewed: () => void;
}

function formatWindow(start: string, end: string) {
  const fmt = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${fmt.format(new Date(start))} → ${fmt.format(new Date(end))}`;
}

export function AlertReviewModal({ alert, onClose, onReviewed }: Props) {
  const [notes, setNotes] = useState('');
  const review = useReviewAntiFraudAlert();

  useEffect(() => {
    if (alert) setNotes('');
  }, [alert]);

  if (!alert) return null;

  const submit = async (action: 'dismiss' | 'action_taken') => {
    if (action === 'action_taken' && notes.trim().length === 0) return;
    try {
      await review.mutateAsync({
        alertId: alert.alert_id,
        payload: {
          action,
          notes: notes.trim() || undefined,
        },
      });
    } catch (err) {
      if (getApiErrorStatus(err) === 409) {
        onReviewed();
        onClose();
      }
      return;
    }
    onReviewed();
    onClose();
  };

  return (
    <Modal
      open={Boolean(alert)}
      onClose={onClose}
      title="Revisar alerta"
      description={alert.external_player_id}
      size="lg"
    >
      <div className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-warning/15 px-2 py-1 text-xs font-semibold text-warning">
            {alert.velocity_multiplier.toFixed(1)}x umbral
          </span>
          {alert.total_alerts_30d > 1 ? (
            <span className="rounded-full bg-danger/15 px-2 py-1 text-xs font-semibold text-danger">
              Reincidente · {alert.total_alerts_30d} en 30d
            </span>
          ) : null}
        </div>
        <p>
          <span className="text-text-tertiary">XP ganado:</span>{' '}
          <strong>{formatNumber(alert.actual_xp)}</strong> (umbral {formatNumber(alert.threshold_snapshot)}/h)
        </p>
        <p>
          <span className="text-text-tertiary">Ventana:</span> {formatWindow(alert.window_start, alert.window_end)}
        </p>
        <p>
          <span className="text-text-tertiary">Detectada:</span> {formatRelativeDate(alert.created_at)}
        </p>
      </div>

      <label className="mt-4 block text-sm">
        Notas (obligatorias si tomás acción)
        <textarea
          className="field mt-1 min-h-24"
          value={notes}
          maxLength={2000}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: Player baneado / congelé wallet / refund + ban / etc."
        />
      </label>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          className="flex-1"
          variant="secondary"
          loading={review.isPending}
          onClick={() => void submit('dismiss')}
        >
          Descartar (falso positivo)
        </Button>
        <Button
          className="flex-1"
          variant="danger"
          loading={review.isPending}
          disabled={notes.trim().length === 0}
          onClick={() => void submit('action_taken')}
        >
          Tomé acción
        </Button>
      </div>
    </Modal>
  );
}
