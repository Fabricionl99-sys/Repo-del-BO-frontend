import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useTestWebhookEndpoint } from '@/features/webhooks/webhooksApi';
import type { RewardEndpoint, WebhookEventType, WebhookPingResult } from '@/types/webhooks';
import { WEBHOOK_EVENT_OPTIONS } from '@/types/webhooks';

export function TestPingModal({
  open,
  endpoint,
  onClose,
}: {
  open: boolean;
  endpoint: RewardEndpoint | null;
  onClose: () => void;
}) {
  const test = useTestWebhookEndpoint();
  const [eventType, setEventType] = useState<WebhookEventType>('reward.granted');
  const [payloadPreview, setPayloadPreview] = useState('{\n  "test": true\n}');
  const [result, setResult] = useState<WebhookPingResult | null>(null);

  useEffect(() => {
    if (!open) {
      setResult(null);
      setEventType('reward.granted');
    }
  }, [open]);

  const send = async () => {
    if (!endpoint) return;
    const res = await test.mutateAsync({ id: endpoint.id, event_type: eventType });
    setResult(res);
  };

  return (
    <Modal open={open} onClose={onClose} title="Test ping" size="lg">
      <div className="space-y-4 text-[15px]">
        <div>
          <p className="label-section mb-1">Endpoint</p>
          <p className="font-mono text-[14px] text-text-secondary">{endpoint?.url}</p>
        </div>
        <label className="block">
          <span className="label-section mb-1">event_type</span>
          <select
            className="w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as WebhookEventType)}
          >
            {WEBHOOK_EVENT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label-section mb-1">Payload preview (editable)</span>
          <textarea
            className="w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2 font-mono text-[13px]"
            rows={5}
            value={payloadPreview}
            onChange={(e) => setPayloadPreview(e.target.value)}
          />
        </label>
        <Button variant="primary" onClick={() => void send()} disabled={test.isPending}>
          Enviar
        </Button>
        {result && (
          <div className={`rounded-lg border p-3 ${result.ok ? 'border-success/30 bg-success/10' : 'border-danger/30 bg-danger/10'}`}>
            <p className="font-medium">{result.message}</p>
            <p className="text-mono text-[14px]">
              HTTP {result.status_code} · {result.latency_ms}ms
            </p>
            <pre className="mt-2 overflow-x-auto font-mono text-[13px]">{result.response_body}</pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
