import { useState } from 'react';
import { Copy } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { copyToClipboard } from '@/features/apiKeys/apiKeysUtils';
import { formatRelativeDate } from '@/lib/format';
import { toast } from '@/stores/toastStore';
import type { WebhookDelivery } from '@/types/webhooks';

const innerTabs = ['Payload', 'Request', 'Response', 'Intentos'] as const;

export function DeliveryDetailModal({
  open,
  delivery,
  onClose,
}: {
  open: boolean;
  delivery: WebhookDelivery | null;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<(typeof innerTabs)[number]>('Payload');
  if (!delivery) return null;

  const copyPayload = async () => {
    const ok = await copyToClipboard(JSON.stringify(delivery.payload, null, 2));
    if (ok) toast.success('Payload copiado');
  };

  const curl = `curl -X POST '${delivery.reward_endpoint_id}' \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(delivery.payload)}'`;

  return (
    <Modal open={open} onClose={onClose} title="Detalle de delivery" size="lg">
      <div className="mb-4 grid grid-cols-2 gap-3 text-[14px] max-md:grid-cols-1">
        <div>
          <p className="label-section">event_id</p>
          <code className="font-mono">{delivery.event_id}</code>
        </div>
        <div>
          <p className="label-section">timestamp</p>
          <p>{formatRelativeDate(delivery.created_at)}</p>
        </div>
        <div>
          <p className="label-section">status</p>
          <p>{delivery.status}</p>
        </div>
        <div>
          <p className="label-section">HTTP</p>
          <p className="text-mono">{delivery.response_status_code ?? '—'}</p>
        </div>
      </div>
      <div className="mb-3 flex gap-2 border-b border-border-subtle">
        {innerTabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`border-b-2 px-3 py-2 text-[14px] ${tab === t ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary'}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'Payload' && (
        <pre className="max-h-64 overflow-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px]">
          {JSON.stringify(delivery.payload, null, 2)}
        </pre>
      )}
      {tab === 'Request' && (
        <pre className="max-h-64 overflow-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px]">
          {JSON.stringify(delivery.request_headers ?? {}, null, 2)}
        </pre>
      )}
      {tab === 'Response' && (
        <div className="space-y-3">
          <pre className="overflow-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px]">
            {JSON.stringify(delivery.response_headers, null, 2)}
          </pre>
          <pre className="overflow-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px]">
            {delivery.response_body_snippet}
          </pre>
          {delivery.error_message && <p className="text-danger">{delivery.error_message}</p>}
        </div>
      )}
      {tab === 'Intentos' && (
        <ul className="space-y-2 text-[14px]">
          {(delivery.attempts_history ?? []).map((a) => (
            <li key={a.id} className="rounded-lg border border-border-subtle bg-bg-tertiary p-2">
              {formatRelativeDate(a.attempted_at)} · HTTP {a.status_code ?? '—'} · {a.duration_ms}ms
              {a.error_message && <span className="text-danger"> · {a.error_message}</span>}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="secondary" icon={<Copy size={13} />} onClick={() => void copyPayload()}>
          Copy payload
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<Copy size={13} />}
          onClick={() => void copyToClipboard(curl).then((ok) => ok && toast.success('curl copiado'))}
        >
          Copy curl
        </Button>
      </div>
    </Modal>
  );
}
