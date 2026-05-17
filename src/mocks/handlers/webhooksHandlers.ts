import { delay, http, HttpResponse, passthrough } from 'msw';

import { computeEndpointStats, generateHmacSecret, webhooksStore } from '@/mocks/data/webhooks';
import type { RewardEndpoint, WebhookEndpointPayload, WebhookEndpointStats } from '@/types/webhooks';

const wait = () => (import.meta.env.MODE === 'test' ? Promise.resolve() : delay(100));

function cardStats(ep: RewardEndpoint): WebhookEndpointStats {
  if (ep.stats) return ep.stats;
  const d = computeEndpointStats(ep.id);
  return {
    success_rate: d.success_rate,
    avg_latency_ms: d.avg_latency_ms,
    deliveries_24h: Math.min(d.total_deliveries, 2000),
    total_deliveries: d.total_deliveries,
    failed_count: d.failed_count,
    p95_latency_ms: d.p95_latency_ms,
  };
}

function attachStats(ep: RewardEndpoint): RewardEndpoint {
  return { ...ep, stats: cardStats(ep) };
}

export const webhooksHandlers = [
  http.get('*/admin/reward-endpoints', async () => {
    await wait();
    return HttpResponse.json({ data: webhooksStore.endpoints.map(attachStats) });
  }),

  http.post('*/admin/reward-endpoints', async ({ request }) => {
    await wait();
    const body = (await request.json()) as WebhookEndpointPayload;
    const secret = generateHmacSecret();
    const ep: RewardEndpoint = {
      id: `wh_ep_${Date.now()}`,
      operator_id: 'op_casino_astral',
      name: body.name,
      url: body.url,
      environment: body.environment,
      is_active: body.is_active,
      hmac_secret_prefix: secret.slice(0, 10),
      hmac_secret_rotated_at: new Date().toISOString(),
      subscribed_events: body.subscribed_events,
      retry_config: body.retry_config,
      timeout_seconds: body.timeout_seconds,
      filters: body.filters,
      created_at: new Date().toISOString(),
      last_used_at: null,
      last_success_at: null,
      last_failure_at: null,
    };
    webhooksStore.endpoints.unshift(ep);
    return HttpResponse.json({ data: { endpoint: attachStats(ep), hmac_secret: secret } }, { status: 201 });
  }),

  http.get('*/admin/webhook-deliveries', async ({ request }) => {
    await wait();
    const url = new URL(request.url);
    let list = [...webhooksStore.deliveries];
    const epId = url.searchParams.get('reward_endpoint_id');
    const status = url.searchParams.get('status');
    const eventType = url.searchParams.get('event_type');
    const q = url.searchParams.get('q')?.toLowerCase();
    if (epId) list = list.filter((d) => d.reward_endpoint_id === epId);
    if (status) list = list.filter((d) => d.status === status);
    if (eventType) list = list.filter((d) => d.event_type === eventType);
    if (q) list = list.filter((d) => d.player_id.includes(q) || d.event_id.includes(q));
    list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return HttpResponse.json({ data: list.slice(0, 200) });
  }),

  http.get('*/admin/reward-endpoints/:id/stats', async ({ params }) => {
    await wait();
    const id = String(params.id);
    return HttpResponse.json({ data: computeEndpointStats(id) });
  }),

  http.get('*/admin/reward-endpoints/:id/deliveries', async ({ params, request }) => {
    await wait();
    const id = String(params.id);
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') ?? 100);
    const list = webhooksStore.deliveries
      .filter((d) => d.reward_endpoint_id === id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
    return HttpResponse.json({ data: list });
  }),

  http.patch('*/admin/reward-endpoints/:id', async ({ params, request }) => {
    await wait();
    const id = String(params.id);
    const body = (await request.json()) as Partial<WebhookEndpointPayload>;
    const ep = webhooksStore.endpoints.find((e) => e.id === id);
    if (!ep) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    Object.assign(ep, body);
    return HttpResponse.json({ data: attachStats(ep) });
  }),

  http.delete('*/admin/reward-endpoints/:id', async ({ params }) => {
    await wait();
    const id = String(params.id);
    const ep = webhooksStore.endpoints.find((e) => e.id === id);
    if (ep) ep.is_active = false;
    return HttpResponse.json({ data: { ok: true } });
  }),

  http.post('*/admin/reward-endpoints/:id/test', async ({ params, request }) => {
    await wait();
    const id = String(params.id);
    const ep = webhooksStore.endpoints.find((e) => e.id === id);
    const body = (await request.json().catch(() => ({}))) as { event_type?: string };
    const ok = ep?.url.includes('example.com') === false;
    if (ep) ep.last_used_at = new Date().toISOString();
    return HttpResponse.json({
      data: {
        ok,
        status_code: ok ? 200 : 503,
        latency_ms: 45 + Math.floor(Math.random() * 80),
        response_body: ok ? JSON.stringify({ received: true, event: body.event_type ?? 'ping' }) : 'Service Unavailable',
        message: ok ? 'Ping exitoso' : 'El servidor no respondió',
      },
    });
  }),

  http.post('*/admin/reward-endpoints/:id/rotate-secret', async ({ params }) => {
    await wait();
    const id = String(params.id);
    const ep = webhooksStore.endpoints.find((e) => e.id === id);
    if (!ep) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    const secret = generateHmacSecret();
    ep.hmac_secret_prefix = secret.slice(0, 10);
    ep.hmac_secret_rotated_at = new Date().toISOString();
    return HttpResponse.json({ data: { hmac_secret: secret, rotated_at: ep.hmac_secret_rotated_at } });
  }),

  http.post('*/admin/deliveries/:id/retry', async ({ params, request }) => {
    const id = String(params.id);
    if (!id.startsWith('whd_')) return passthrough();
    await wait();
    const d = webhooksStore.deliveries.find((x) => x.id === id);
    if (!d) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    d.status = 'retrying';
    d.attempt_count += 1;
    d.next_retry_at = new Date(Date.now() + 60_000).toISOString();
    d.attempts_history = [
      ...(d.attempts_history ?? []),
      {
        id: `att_${Date.now()}`,
        attempted_at: new Date().toISOString(),
        status_code: null,
        duration_ms: 0,
        error_message: body.reason ?? 'Force retry',
      },
    ];
    return HttpResponse.json({ data: d });
  }),

  http.post('*/admin/deliveries/:id/cancel', async ({ params, request }) => {
    const id = String(params.id);
    if (!id.startsWith('whd_')) return passthrough();
    await wait();
    const d = webhooksStore.deliveries.find((x) => x.id === id);
    if (!d) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    void request;
    d.status = 'cancelled';
    d.next_retry_at = null;
    return HttpResponse.json({ data: d });
  }),
];
