import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useRetrySpinDelivery } from '@/features/wheels/wheelsApi';
import { OCCASION_TYPE_LABELS, SPIN_DELIVERY_LABELS } from '@/features/wheels/wheelForm';
import { summarizeReward } from '@/features/rewards/rewardForm';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import type { SpinHistoryEntry } from '@/types/wheels';

const innerTabs = ['Premio', 'Entrega', 'Audit'] as const;

export function SpinDetailModal({
  open,
  entry,
  onClose,
}: {
  open: boolean;
  entry: SpinHistoryEntry | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<(typeof innerTabs)[number]>('Premio');
  const retry = useRetrySpinDelivery();

  if (!entry) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalle de Giro"
      size="lg"
      footer={
        <>
          {entry.delivery_status === 'failed' && (
            <Button variant="secondary" loading={retry.isPending} onClick={() => retry.mutate(entry.id)}>
              Reintentar entrega
            </Button>
          )}
          <Button variant="primary" onClick={onClose}>
            Cerrar
          </Button>
        </>
      }
    >
      <div className="mb-4 grid gap-2 text-[14px] sm:grid-cols-2">
        <p>
          <span className="text-text-tertiary">Timestamp:</span> {formatRelativeDate(entry.spun_at)}
        </p>
        <p>
          <span className="text-text-tertiary">Jugador:</span> {entry.player_handle ?? entry.player_id}
        </p>
        <p>
          <span className="text-text-tertiary">Rueda:</span> {entry.wheel_name}
        </p>
        <p>
          <span className="text-text-tertiary">Ocasión:</span> {OCCASION_TYPE_LABELS[entry.occasion_type]}
        </p>
        <p>
          <span className="text-text-tertiary">Estado entrega:</span>{' '}
          <span
            className={cn(
              'font-semibold',
              entry.delivery_status === 'delivered' && 'text-success',
              entry.delivery_status === 'failed' && 'text-danger',
            )}
          >
            {SPIN_DELIVERY_LABELS[entry.delivery_status]}
          </span>
        </p>
        <p>
          <span className="text-text-tertiary">Intentos:</span> {entry.delivery_attempts.length}
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle">
        {innerTabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-2 text-sm font-semibold',
              tab === t ? 'border-b-2 border-accent text-accent' : 'text-text-secondary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Premio' && (
        <div className="flex gap-4">
          {entry.prize_image_url ? (
            <img src={entry.prize_image_url} alt={entry.prize_name} className="h-20 w-20 rounded-lg object-cover" />
          ) : null}
          <div>
            <p className="font-semibold">{entry.prize_name}</p>
            <p className="text-[13px] text-text-tertiary">{entry.reward_type}</p>
            <p className="mt-2 text-[14px]">{summarizeReward({ reward_type: entry.reward_type, reward_config: entry.reward_config })}</p>
            <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-bg-tertiary p-3 font-mono text-[12px]">
              {JSON.stringify(entry.reward_config, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {tab === 'Entrega' && (
        <div className="space-y-2">
          {entry.delivery_attempts.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2 text-[13px]"
            >
              <span className="font-mono">{formatRelativeDate(a.attempted_at)}</span>
              <span className="mx-2 text-text-tertiary">·</span>
              <span className={a.status === 'success' ? 'text-success' : a.status === 'failed' ? 'text-danger' : 'text-warning'}>
                {a.status}
              </span>
              {a.error_message && <p className="mt-1 text-danger">{a.error_message}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'Audit' && (
        <div className="space-y-2">
          {entry.audit_log.map((log, i) => (
            <div key={i} className="rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2 text-[13px]">
              <span className="font-mono text-text-tertiary">{formatRelativeDate(log.at)}</span>
              <span className="mx-2">·</span>
              <span className="font-semibold">{log.action}</span>
              <span className="mx-2 text-text-tertiary">({log.actor})</span>
              {log.detail && <p className="mt-1 text-text-secondary">{log.detail}</p>}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
