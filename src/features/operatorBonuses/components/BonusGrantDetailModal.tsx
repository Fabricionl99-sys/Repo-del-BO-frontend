import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useRetryBonusGrant } from '@/features/operatorBonuses/operatorBonusesApi';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import type { BonusGrantHistoryEntry } from '@/types/operatorBonuses';

const innerTabs = ['Request', 'Response', 'Intentos', 'Audit'] as const;

export function BonusGrantDetailModal({
  open,
  entry,
  onClose,
}: {
  open: boolean;
  entry: BonusGrantHistoryEntry | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<(typeof innerTabs)[number]>('Request');
  const retry = useRetryBonusGrant();

  if (!entry) return null;

  const copyPayload = () => {
    void navigator.clipboard.writeText(JSON.stringify(entry.request_payload, null, 2));
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalle de entrega"
      size="lg"
      footer={
        <>
          {entry.status === 'failed' && (
            <Button variant="secondary" loading={retry.isPending} onClick={() => retry.mutate(entry.id)}>
              Reintentar entrega
            </Button>
          )}
          <Button variant="secondary" onClick={copyPayload}>Copy payload</Button>
          <Button variant="primary" onClick={onClose}>Cerrar</Button>
        </>
      }
    >
      <p className="mb-4 text-[14px] text-text-secondary">
        {entry.bonus_name} → {entry.player_handle} · {entry.source_module}
      </p>

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

      {tab === 'Request' && (
        <pre className="max-h-64 overflow-auto rounded-lg bg-bg-tertiary p-4 font-mono text-[13px]">
          {JSON.stringify(entry.request_payload, null, 2)}
        </pre>
      )}
      {tab === 'Response' && (
        <pre className="max-h-64 overflow-auto rounded-lg bg-bg-tertiary p-4 font-mono text-[13px]">
          {JSON.stringify(entry.last_response, null, 2)}
        </pre>
      )}
      {tab === 'Intentos' && (
        <div className="space-y-2">
          {entry.attempts.map((a) => (
            <div key={a.id} className="card p-3 text-[13px]">
              <p>{formatRelativeDate(a.attempted_at)} · HTTP {a.http_status ?? '—'} · {a.status}</p>
              {a.error_message && <p className="text-danger">{a.error_message}</p>}
            </div>
          ))}
        </div>
      )}
      {tab === 'Audit' && (
        <div className="space-y-2 text-[14px]">
          <p>ID: {entry.id}</p>
          <p>Intentos: {entry.attempts_count}</p>
          <p>Status: {entry.status}</p>
          <p>External ID: {entry.bonus_external_id}</p>
        </div>
      )}
    </Modal>
  );
}
