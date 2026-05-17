import type {
  RewardEndpoint,
  WebhookDelivery,
  WebhookDeliveryAttempt,
  WebhookEventType,
  WebhookStatsDetail,
} from '@/types/webhooks';

const OPERATOR_ID = 'op_casino_astral';
const now = Date.now();
const iso = (ms: number) => new Date(now - ms).toISOString();

const defaultRetry = {
  max_retries: 5,
  backoff_strategy: 'exponential' as const,
  initial_delay_seconds: 60,
  max_delay_seconds: 3600,
};

export const seedWebhookEndpoints: RewardEndpoint[] = [
  {
    id: 'wh_ep_prod_01',
    operator_id: OPERATOR_ID,
    name: 'Backend Producción',
    url: 'https://api.casinoastral.com/webhooks/niveles/production',
    environment: 'production',
    is_active: true,
    hmac_secret_prefix: 'whsec_prd',
    hmac_secret_rotated_at: iso(90 * 24 * 60 * 60 * 1000),
    subscribed_events: ['reward.granted', 'reward.delivered', 'reward.failed', 'player.level_up'],
    retry_config: { ...defaultRetry },
    timeout_seconds: 30,
    filters: { min_amount: 10, include_test_players: false },
    created_at: iso(120 * 24 * 60 * 60 * 1000),
    last_used_at: iso(30 * 1000),
    last_success_at: iso(45 * 1000),
    last_failure_at: iso(2 * 60 * 60 * 1000),
    stats: { success_rate: 97, avg_latency_ms: 142, deliveries_24h: 1842, total_deliveries: 45200, failed_count: 120, p95_latency_ms: 310 },
  },
  {
    id: 'wh_ep_test_01',
    operator_id: OPERATOR_ID,
    name: 'Backend Testing',
    url: 'https://staging.casinoastral.com/webhooks/niveles',
    environment: 'test',
    is_active: true,
    hmac_secret_prefix: 'whsec_tst',
    hmac_secret_rotated_at: null,
    subscribed_events: ['reward.granted', 'player.mission_completed', 'player.chest_opened'],
    retry_config: { ...defaultRetry, max_retries: 3 },
    timeout_seconds: 45,
    filters: { min_amount: null, include_test_players: true },
    created_at: iso(60 * 24 * 60 * 60 * 1000),
    last_used_at: iso(5 * 60 * 1000),
    last_success_at: iso(8 * 60 * 1000),
    last_failure_at: null,
    stats: { success_rate: 99, avg_latency_ms: 98, deliveries_24h: 234, total_deliveries: 8900, failed_count: 12, p95_latency_ms: 180 },
  },
  {
    id: 'wh_ep_prod_legacy',
    operator_id: OPERATOR_ID,
    name: 'Backend Legacy',
    url: 'https://legacy.casinoastral.com/hooks/wingoat',
    environment: 'production',
    is_active: false,
    hmac_secret_prefix: 'whsec_leg',
    hmac_secret_rotated_at: iso(200 * 24 * 60 * 60 * 1000),
    subscribed_events: ['reward.granted'],
    retry_config: { ...defaultRetry },
    timeout_seconds: 30,
    filters: { min_amount: null, include_test_players: false },
    created_at: iso(400 * 24 * 60 * 60 * 1000),
    last_used_at: iso(30 * 24 * 60 * 60 * 1000),
    last_success_at: iso(31 * 24 * 60 * 60 * 1000),
    last_failure_at: iso(30 * 24 * 60 * 60 * 1000),
    stats: { success_rate: 82, avg_latency_ms: 220, deliveries_24h: 0, total_deliveries: 12000, failed_count: 2100, p95_latency_ms: 890 },
  },
  {
    id: 'wh_ep_prod_mig',
    operator_id: OPERATOR_ID,
    name: 'Backend Migración',
    url: 'https://new.casinoastral.com/v2/webhooks',
    environment: 'production',
    is_active: true,
    hmac_secret_prefix: 'whsec_mig',
    hmac_secret_rotated_at: iso(2 * 24 * 60 * 60 * 1000),
    subscribed_events: ['reward.granted', 'reward.delivered', 'player.shop_purchased', 'player.ranking_won'],
    retry_config: { ...defaultRetry },
    timeout_seconds: 30,
    filters: { min_amount: 5, include_test_players: false },
    created_at: iso(3 * 24 * 60 * 60 * 1000),
    last_used_at: iso(10 * 60 * 1000),
    last_success_at: iso(12 * 60 * 1000),
    last_failure_at: null,
    stats: { success_rate: 100, avg_latency_ms: 88, deliveries_24h: 45, total_deliveries: 120, failed_count: 0, p95_latency_ms: 120 },
  },
];

const eventTypes: WebhookEventType[] = [
  'reward.granted',
  'reward.delivered',
  'reward.failed',
  'player.level_up',
  'player.mission_completed',
];

const statuses: WebhookDelivery['status'][] = ['success', 'success', 'success', 'failed', 'retrying', 'pending', 'cancelled'];

function buildDeliveries(): WebhookDelivery[] {
  const list: WebhookDelivery[] = [];
  const endpointIds = seedWebhookEndpoints.map((e) => e.id);
  for (let i = 0; i < 150; i += 1) {
    const epId = endpointIds[i % endpointIds.length];
    const ep = seedWebhookEndpoints.find((e) => e.id === epId)!;
    const status = statuses[i % statuses.length];
    const ok = status === 'success';
    const attempts: WebhookDeliveryAttempt[] = Array.from({ length: Math.min(status === 'failed' ? 3 : 1, 5) }).map(
      (_, j) => ({
        id: `att_${i}_${j}`,
        attempted_at: iso(i * 120_000 + j * 30_000),
        status_code: ok ? 200 : [500, 502, 408][j % 3],
        duration_ms: 80 + j * 40,
        error_message: ok ? null : 'Connection timeout',
      }),
    );
    list.push({
      id: `whd_${String(i).padStart(5, '0')}`,
      reward_endpoint_id: epId,
      reward_endpoint_name: ep.name,
      event_type: eventTypes[i % eventTypes.length],
      event_id: `evt_${i}`,
      player_id: `pl_${1000 + (i % 50)}`,
      payload: {
        event_type: eventTypes[i % eventTypes.length],
        player_id: `pl_${1000 + (i % 50)}`,
        reward: { amount: 10 + (i % 100), currency: 'USD' },
      },
      status,
      attempt_count: attempts.length,
      last_attempt_at: attempts[attempts.length - 1]?.attempted_at ?? null,
      next_retry_at: status === 'retrying' ? iso(-60_000) : null,
      response_status_code: attempts[attempts.length - 1]?.status_code ?? null,
      response_body_snippet: ok ? '{"ok":true}' : '{"error":"timeout"}',
      response_headers: { 'Content-Type': 'application/json' },
      request_headers: { 'X-Niveles-Signature': 'sha256=...', 'Content-Type': 'application/json' },
      error_message: ok ? null : 'Connection timeout after 30s',
      duration_ms: attempts[attempts.length - 1]?.duration_ms ?? null,
      created_at: iso(i * 120_000),
      attempts_history: attempts,
    });
  }
  return list;
}

export const seedWebhookDeliveries = buildDeliveries();

export const webhooksStore = {
  endpoints: [...seedWebhookEndpoints],
  deliveries: [...seedWebhookDeliveries],
};

export function computeEndpointStats(endpointId: string): WebhookStatsDetail {
  const recent = webhooksStore.deliveries.filter((d) => d.reward_endpoint_id === endpointId);
  const success = recent.filter((d) => d.status === 'success').length;
  const failed = recent.filter((d) => ['failed', 'cancelled'].includes(d.status)).length;
  const latencies = recent.map((d) => d.duration_ms ?? 0).filter(Boolean).sort((a, b) => a - b);
  const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;

  const hourMap = new Map<string, { success: number; failed: number }>();
  for (const d of recent.slice(0, 48)) {
    const h = new Date(d.created_at).toISOString().slice(0, 13);
    const cur = hourMap.get(h) ?? { success: 0, failed: 0 };
    if (d.status === 'success') cur.success += 1;
    else cur.failed += 1;
    hourMap.set(h, cur);
  }

  const eventMap = new Map<string, number>();
  for (const d of recent) {
    eventMap.set(d.event_type, (eventMap.get(d.event_type) ?? 0) + 1);
  }

  const errorMap = new Map<number, { count: number; message: string }>();
  for (const d of recent.filter((x) => x.status === 'failed')) {
    const code = d.response_status_code ?? 0;
    const cur = errorMap.get(code) ?? { count: 0, message: d.error_message ?? 'Unknown' };
    cur.count += 1;
    errorMap.set(code, cur);
  }

  return {
    total_deliveries: recent.length,
    success_rate: recent.length ? Math.round((success / recent.length) * 100) : 100,
    failed_count: failed,
    avg_latency_ms: latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
    p95_latency_ms: p95,
    deliveries_by_hour: [...hourMap.entries()].map(([hour, v]) => ({ hour, ...v })),
    events_by_type: [...eventMap.entries()].map(([event_type, count]) => ({ event_type, count })),
    common_errors: [...errorMap.entries()].map(([status_code, v]) => ({ status_code, ...v })),
  };
}

export function generateHmacSecret(): string {
  const rand = Array.from({ length: 32 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
  return `whsec_${rand}`;
}
