import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { HmacSecretReveal } from '@/features/webhooks/components/HmacSecretReveal';
import {
  useCreateRewardEndpoint,
  usePatchRewardEndpoint,
  useTestWebhookEndpoint,
} from '@/features/webhooks/webhooksApi';
import { computeBackoffPreview } from '@/features/webhooks/webhooksBackoff';
import { validateEndpointPayload } from '@/features/webhooks/webhooksValidation';
import type { RewardEndpoint, WebhookEndpointPayload, WebhookEnvironment, WebhookEventType } from '@/types/webhooks';
import { WEBHOOK_EVENT_OPTIONS } from '@/types/webhooks';

const defaultPayload = (): WebhookEndpointPayload => ({
  name: '',
  url: 'https://',
  environment: 'test',
  is_active: true,
  subscribed_events: ['reward.granted'],
  retry_config: {
    max_retries: 5,
    backoff_strategy: 'exponential',
    initial_delay_seconds: 60,
    max_delay_seconds: 3600,
  },
  timeout_seconds: 30,
  filters: { min_amount: null, include_test_players: false },
});

export function EndpointFormModal({
  open,
  endpoint,
  onClose,
  onCreatedSecret,
}: {
  open: boolean;
  endpoint: RewardEndpoint | null;
  onClose: () => void;
  onCreatedSecret: (secret: string) => void;
}) {
  const isEdit = Boolean(endpoint);
  const create = useCreateRewardEndpoint();
  const patch = usePatchRewardEndpoint();
  const test = useTestWebhookEndpoint();
  const [form, setForm] = useState<WebhookEndpointPayload>(defaultPayload);
  const [error, setError] = useState<string | undefined>();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [createSecret, setCreateSecret] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(undefined);
    setCreateSecret(null);
    setPingResult(null);
    if (endpoint) {
      setForm({
        name: endpoint.name,
        url: endpoint.url,
        environment: endpoint.environment,
        is_active: endpoint.is_active,
        subscribed_events: [...endpoint.subscribed_events],
        retry_config: { ...endpoint.retry_config },
        timeout_seconds: endpoint.timeout_seconds,
        filters: { ...endpoint.filters },
      });
    } else {
      setForm(defaultPayload());
    }
  }, [open, endpoint]);

  const backoffPreview = useMemo(() => computeBackoffPreview(form.retry_config), [form.retry_config]);

  const toggleEvent = (ev: WebhookEventType) => {
    setForm((f) => ({
      ...f,
      subscribed_events: f.subscribed_events.includes(ev)
        ? f.subscribed_events.filter((x) => x !== ev)
        : [...f.subscribed_events, ev],
    }));
  };

  const submit = async () => {
    const err = validateEndpointPayload(form);
    if (err) {
      setError(err);
      return;
    }
    if (isEdit && endpoint) {
      await patch.mutateAsync({ id: endpoint.id, payload: form });
      onClose();
      return;
    }
    const res = await create.mutateAsync(form);
    setCreateSecret(res.hmac_secret);
    onCreatedSecret(res.hmac_secret);
  };

  const runTest = async () => {
    if (!endpoint) return;
    const res = await test.mutateAsync({ id: endpoint.id });
    setPingResult(`${res.status_code} · ${res.latency_ms}ms · ${res.message}`);
  };

  if (createSecret) {
    return (
      <Modal open={open} onClose={onClose} title="Guardá tu HMAC secret" size="md">
        <HmacSecretReveal plainText={createSecret} onDone={onClose} />
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar endpoint' : 'Nuevo endpoint'} size="lg">
      <div className="max-h-[70vh] space-y-5 overflow-y-auto pr-1 text-[15px]">
        <section>
          <h4 className="label-section mb-3">Datos básicos</h4>
          <div className="grid gap-3">
            <label>
              <span className="label-section mb-1 block">Nombre</span>
              <input
                className="w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              <span className="label-section mb-1 block">URL (HTTPS)</span>
              <input
                className="w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2 font-mono text-[14px]"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
            </label>
            <fieldset>
              <span className="label-section mb-2 block">Environment</span>
              <div className="flex gap-4">
                {(['test', 'production'] as WebhookEnvironment[]).map((env) => (
                  <label key={env} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={form.environment === env}
                      onChange={() => setForm({ ...form, environment: env })}
                    />
                    {env}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Activo
            </label>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="label-section">Eventos suscriptos</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setForm({ ...form, subscribed_events: WEBHOOK_EVENT_OPTIONS.map((o) => o.value) })}
              >
                Todos
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, subscribed_events: [] })}>
                Ninguno
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {WEBHOOK_EVENT_OPTIONS.map((o) => (
              <label key={o.value} className="flex cursor-pointer gap-2 rounded-lg border border-border-subtle p-2">
                <input
                  type="checkbox"
                  checked={form.subscribed_events.includes(o.value)}
                  onChange={() => toggleEvent(o.value)}
                />
                <span>
                  <span className="font-mono text-[14px]">{o.label}</span>
                  <span className="block text-[13px] text-text-tertiary">{o.description}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section>
          <h4 className="label-section mb-3">Reintentos</h4>
          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <label>
              max_retries
              <input
                type="number"
                min={0}
                max={10}
                className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2"
                value={form.retry_config.max_retries}
                onChange={(e) =>
                  setForm({
                    ...form,
                    retry_config: { ...form.retry_config, max_retries: Number(e.target.value) },
                  })
                }
              />
            </label>
            <label>
              initial_delay (s)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2"
                value={form.retry_config.initial_delay_seconds}
                onChange={(e) =>
                  setForm({
                    ...form,
                    retry_config: { ...form.retry_config, initial_delay_seconds: Number(e.target.value) },
                  })
                }
              />
            </label>
            <label>
              max_delay (s)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2"
                value={form.retry_config.max_delay_seconds}
                onChange={(e) =>
                  setForm({
                    ...form,
                    retry_config: { ...form.retry_config, max_delay_seconds: Number(e.target.value) },
                  })
                }
              />
            </label>
          </div>
          <fieldset className="mt-3">
            <span className="label-section mb-2 block">backoff_strategy</span>
            {(['exponential', 'linear', 'fixed'] as const).map((s) => (
              <label key={s} className="mr-4 inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={form.retry_config.backoff_strategy === s}
                  onChange={() => setForm({ ...form, retry_config: { ...form.retry_config, backoff_strategy: s } })}
                />
                {s}
              </label>
            ))}
          </fieldset>
          <p className="mt-2 text-[13px] text-text-tertiary">
            Si falla, reintentará: {backoffPreview.join(', ')}
            {form.retry_config.max_retries > backoffPreview.length ? '…' : ''}
          </p>
        </section>

        <section>
          <h4 className="label-section mb-2">Timeout</h4>
          <input
            type="number"
            min={5}
            max={60}
            title="Tiempo máximo de espera por respuesta del servidor"
            className="w-32 rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2"
            value={form.timeout_seconds}
            onChange={(e) => setForm({ ...form, timeout_seconds: Number(e.target.value) })}
          />
          <p className="mt-1 text-[13px] text-text-tertiary">Tiempo máximo de espera por respuesta (5–60s)</p>
        </section>

        <section>
          <button
            type="button"
            className="label-section flex items-center gap-1"
            onClick={() => setFiltersOpen((v) => !v)}
          >
            Filtros (opcional) {filtersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {filtersOpen && (
            <div className="mt-3 grid gap-3">
              <label>
                min_amount
                <input
                  type="number"
                  className="mt-1 w-full rounded-lg border border-border-subtle bg-bg-tertiary px-3 py-2"
                  value={form.filters.min_amount ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      filters: {
                        ...form.filters,
                        min_amount: e.target.value ? Number(e.target.value) : null,
                      },
                    })
                  }
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.filters.include_test_players}
                  onChange={(e) =>
                    setForm({ ...form, filters: { ...form.filters, include_test_players: e.target.checked } })
                  }
                />
                include_test_players
              </label>
            </div>
          )}
        </section>

        {isEdit && endpoint && (
          <section>
            <h4 className="label-section mb-2">HMAC</h4>
            <p className="font-mono text-[14px]">{endpoint.hmac_secret_prefix}…</p>
            <p className="text-[13px] text-text-tertiary">Usá &quot;Rotar HMAC&quot; desde la card para un nuevo secret.</p>
          </section>
        )}

        {!isEdit && (
          <section>
            <Button variant="secondary" onClick={() => void submit()} disabled={create.isPending}>
              Crear y generar secret
            </Button>
          </section>
        )}

        {isEdit && (
          <section>
            <Button variant="secondary" onClick={() => void runTest()} disabled={test.isPending}>
              Test ping
            </Button>
            {pingResult && <p className="mt-2 text-[14px] text-text-secondary">{pingResult}</p>}
          </section>
        )}

        {error && <p className="text-danger">{error}</p>}
        <div className="flex gap-2 border-t border-border-subtle pt-4">
          {isEdit && (
            <Button variant="primary" onClick={() => void submit()} disabled={patch.isPending}>
              Guardar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
