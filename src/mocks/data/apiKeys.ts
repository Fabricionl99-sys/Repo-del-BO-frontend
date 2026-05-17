import type {
  ApiConnectedIp,
  ApiKey,
  ApiKeysStats,
  ApiReferenceDoc,
  ApiRequestLog,
} from '@/types/apiKeys';

const OPERATOR_ID = 'op_casino_astral';

const now = Date.now();
const iso = (offsetMs: number) => new Date(now - offsetMs).toISOString();

export const seedApiKeys: ApiKey[] = [
  {
    id: 'key_test_01',
    operator_id: OPERATOR_ID,
    environment: 'test',
    name: 'Backend Staging',
    prefix: 'wgpk_tst',
    key_hash: 'sha256:abc111',
    last_used_at: iso(2 * 60 * 1000),
    is_active: true,
    created_at: iso(30 * 24 * 60 * 60 * 1000),
    expires_at: null,
    permissions: ['events:write', 'players:read', 'rewards:write'],
  },
  {
    id: 'key_test_02',
    operator_id: OPERATOR_ID,
    environment: 'test',
    name: 'CI Pipeline',
    prefix: 'wgpk_ci9',
    key_hash: 'sha256:abc222',
    last_used_at: null,
    is_active: true,
    created_at: iso(14 * 24 * 60 * 60 * 1000),
    expires_at: iso(-60 * 24 * 60 * 60 * 1000),
    permissions: ['events:write', 'players:read'],
  },
  {
    id: 'key_prod_01',
    operator_id: OPERATOR_ID,
    environment: 'production',
    name: 'Backend Servidor 1',
    prefix: 'wgpk_prd',
    key_hash: 'sha256:def111',
    last_used_at: iso(45 * 1000),
    is_active: true,
    created_at: iso(90 * 24 * 60 * 60 * 1000),
    expires_at: null,
    permissions: ['events:write', 'rewards:write', 'players:read', 'players:write', 'currencies:read'],
  },
  {
    id: 'key_prod_02',
    operator_id: OPERATOR_ID,
    environment: 'production',
    name: 'Mobile App Gateway',
    prefix: 'wgpk_mob',
    key_hash: 'sha256:def222',
    last_used_at: iso(3 * 60 * 60 * 1000),
    is_active: true,
    created_at: iso(2 * 24 * 60 * 60 * 1000),
    expires_at: null,
    permissions: ['players:read', 'missions:read'],
  },
];

const endpoints = [
  '/v1/events',
  '/v1/events/batch',
  '/v1/players/sync',
  '/v1/rewards/deliver',
  '/v1/currencies/balance',
  '/v1/missions/progress',
  '/v1/shop/catalog',
  '/v1/chests/open',
  '/v1/rankings/leaderboard',
];

const methods = ['GET', 'POST', 'PATCH'] as const;
const ips = [
  { ip: '52.84.122.18', country: 'US' },
  { ip: '52.84.122.19', country: 'US' },
  { ip: '191.83.42.55', country: 'AR' },
  { ip: '200.58.112.10', country: 'AR' },
  { ip: '187.45.201.33', country: 'BR' },
  { ip: '181.43.88.90', country: 'CL' },
  { ip: '190.196.44.12', country: 'CO' },
  { ip: '201.234.55.78', country: 'MX' },
  { ip: '85.214.132.44', country: 'DE' },
  { ip: '103.21.244.8', country: 'SG' },
];

function buildLogs(): ApiRequestLog[] {
  const logs: ApiRequestLog[] = [];
  const keyIds = seedApiKeys.map((k) => k.id);
  for (let i = 0; i < 80; i += 1) {
    const keyId = keyIds[i % keyIds.length];
    const endpoint = endpoints[i % endpoints.length];
    const method = methods[i % methods.length];
    const status = [200, 201, 202, 400, 401, 404, 409, 500, 503][i % 9];
    const ok = status < 400;
    const ip = ips[i % ips.length];
    logs.push({
      id: `log_${String(i).padStart(4, '0')}`,
      api_key_id: keyId,
      endpoint,
      method,
      status_code: status,
      duration_ms: 40 + (i % 20) * 30,
      ip_address: ip.ip,
      user_agent: 'NivelesSDK/1.2.0 (Node.js)',
      request_body_snippet: JSON.stringify({ event_type: 'login', player_id: `pl_${i}` }).slice(0, 120),
      response_status: ok ? 'success' : 'error',
      error_message: ok ? null : 'Validation failed: player_id required',
      created_at: iso(i * 90_000),
      request_headers: {
        Authorization: 'Bearer wgpk_***',
        'Content-Type': 'application/json',
        'X-Request-Id': `req_${i}`,
      },
      response_headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(9000 - (i % 100)),
      },
    });
  }
  return logs;
}

export const seedRequestLogs = buildLogs();

export function buildConnectedIps(logs: ApiRequestLog[], keys: ApiKey[]): ApiConnectedIp[] {
  const map = new Map<string, ApiConnectedIp>();
  for (const log of logs) {
    const key = keys.find((k) => k.id === log.api_key_id);
    const country = ips.find((x) => x.ip === log.ip_address)?.country ?? 'XX';
    const existing = map.get(log.ip_address);
    if (!existing) {
      map.set(log.ip_address, {
        ip_address: log.ip_address,
        first_seen_at: log.created_at,
        last_seen_at: log.created_at,
        request_count: 1,
        country_code: country,
        last_api_key_id: log.api_key_id,
        last_api_key_name: key?.name ?? '—',
      });
    } else {
      existing.request_count += 1;
      if (log.created_at > existing.last_seen_at) {
        existing.last_seen_at = log.created_at;
        existing.last_api_key_id = log.api_key_id;
        existing.last_api_key_name = key?.name ?? existing.last_api_key_name;
      }
      if (log.created_at < existing.first_seen_at) {
        existing.first_seen_at = log.created_at;
      }
    }
  }
  return [...map.values()].sort((a, b) => b.last_seen_at.localeCompare(a.last_seen_at));
}

export const seedConnectedIps = buildConnectedIps(seedRequestLogs, seedApiKeys);

export function computeStats(logs: ApiRequestLog[], keys: ApiKey[]): ApiKeysStats {
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recent = logs.filter((l) => new Date(l.created_at).getTime() >= weekAgo);
  const success = recent.filter((l) => l.response_status === 'success').length;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = logs.filter((l) => new Date(l.created_at) >= todayStart);
  return {
    total_requests_7d: recent.length,
    success_rate: recent.length ? Math.round((success / recent.length) * 100) : 100,
    avg_duration_ms: recent.length
      ? Math.round(recent.reduce((s, l) => s + l.duration_ms, 0) / recent.length)
      : 0,
    active_keys: keys.filter((k) => k.is_active).length,
    requests_today: today.length,
  };
}

export const apiKeysQuickStartMarkdown = `# Guía rápida de integración

Bienvenido a la API de Niveles. Con una API key tu equipo puede integrar gamificación sin depender de nuestro equipo de implementación.

## Requisitos

- Backend propio (Node, Python, PHP, etc.)
- API key de **test** para desarrollo
- API key de **production** solo cuando completes el checklist

## Autenticación

Todas las requests usan el header \`Authorization: Bearer YOUR_API_KEY\`.
`;

export const apiReferenceDoc: ApiReferenceDoc = {
  base_url: 'https://api.social2game.com',
  categories: [
    {
      id: 'events',
      label: 'Events',
      endpoints: [
        {
          method: 'POST',
          path: '/v1/events',
          summary: 'Registrar evento de jugador',
          description: 'Envía un evento de gamificación (login, apuesta, depósito, etc.).',
          request_body: { event_type: 'login', player_id: 'pl_123', metadata: {} },
          response_example: { id: 'evt_abc', status: 'accepted' },
          errors: [
            { code: 400, message: 'Invalid payload' },
            { code: 401, message: 'Invalid API key' },
          ],
        },
        {
          method: 'POST',
          path: '/v1/events/batch',
          summary: 'Batch de eventos',
          description: 'Hasta 100 eventos por request.',
          request_body: { events: [{ event_type: 'bet', player_id: 'pl_1' }] },
          response_example: { accepted: 98, failed: 2 },
        },
      ],
    },
    {
      id: 'players',
      label: 'Players',
      endpoints: [
        {
          method: 'GET',
          path: '/v1/players/{player_id}',
          summary: 'Obtener jugador',
          description: 'Perfil gamificado del jugador.',
          parameters: [
            { name: 'player_id', in: 'path', type: 'string', required: true, description: 'ID externo' },
          ],
          response_example: { player_id: 'pl_123', level: 12, xp: 4500 },
        },
        {
          method: 'POST',
          path: '/v1/players/sync',
          summary: 'Sync masivo',
          description: 'Sincroniza jugadores desde tu CRM.',
          request_body: { players: [{ external_id: 'pl_1', country: 'AR' }] },
          response_example: { synced: 1 },
        },
      ],
    },
    {
      id: 'rewards',
      label: 'Rewards',
      endpoints: [
        {
          method: 'POST',
          path: '/v1/rewards/deliver',
          summary: 'Entregar premio',
          description: 'Dispara entrega de premio al jugador.',
          request_body: { player_id: 'pl_1', reward_id: 'rw_99' },
          response_example: { delivery_id: 'del_1', status: 'pending' },
        },
      ],
    },
    {
      id: 'webhooks',
      label: 'Webhooks',
      endpoints: [
        {
          method: 'GET',
          path: '/v1/webhooks',
          summary: 'Listar webhooks',
          description: 'Endpoints configurados para premios.',
          response_example: { items: [{ url: 'https://operator.com/hooks' }] },
        },
      ],
    },
    {
      id: 'currencies',
      label: 'Currencies',
      endpoints: [
        {
          method: 'GET',
          path: '/v1/currencies/balance',
          summary: 'Balance de monedas',
          description: 'Consulta monedas del jugador.',
          parameters: [
            { name: 'player_id', in: 'query', type: 'string', required: true, description: 'ID jugador' },
          ],
          response_example: { coins: [{ code: 'XP', amount: 1200 }] },
        },
      ],
    },
    {
      id: 'missions',
      label: 'Missions',
      endpoints: [
        {
          method: 'GET',
          path: '/v1/missions',
          summary: 'Listar misiones activas',
          description: 'Misiones publicadas para el operador.',
          response_example: { items: [{ id: 'ms_1', title: 'Login diario' }] },
        },
      ],
    },
    {
      id: 'streaks',
      label: 'Streaks',
      endpoints: [
        {
          method: 'GET',
          path: '/v1/streaks/programs',
          summary: 'Programas de racha',
          description: 'Programas activos.',
          response_example: { items: [] },
        },
      ],
    },
    {
      id: 'shop',
      label: 'Shop',
      endpoints: [
        {
          method: 'GET',
          path: '/v1/shop/catalog',
          summary: 'Catálogo tienda',
          description: 'Items disponibles.',
          response_example: { items: [{ sku: 'bonus_10' }] },
        },
      ],
    },
    {
      id: 'chests',
      label: 'Chests',
      endpoints: [
        {
          method: 'POST',
          path: '/v1/chests/open',
          summary: 'Abrir cofre',
          description: 'Abre cofre para un jugador.',
          request_body: { player_id: 'pl_1', chest_id: 'ch_1' },
          response_example: { reward: { type: 'coins', amount: 50 } },
        },
      ],
    },
    {
      id: 'rankings',
      label: 'Rankings',
      endpoints: [
        {
          method: 'GET',
          path: '/v1/rankings/{code}/leaderboard',
          summary: 'Leaderboard',
          description: 'Top jugadores del ranking.',
          response_example: { entries: [{ rank: 1, player_id: 'pl_1' }] },
        },
      ],
    },
    {
      id: 'avatars',
      label: 'Avatars',
      endpoints: [
        {
          method: 'GET',
          path: '/v1/avatars/catalog',
          summary: 'Catálogo avatares',
          description: 'Avatares desbloqueables.',
          response_example: { items: [{ id: 'av_1', name: 'VIP Gold' }] },
        },
      ],
    },
  ],
};

/** Mutable store para MSW */
export const apiKeysStore = {
  keys: [...seedApiKeys],
  logs: [...seedRequestLogs],
};

export function generatePlainKey(environment: 'test' | 'production'): string {
  const base = environment === 'production' ? 'wgpk_prod' : 'wgpk_test';
  const rand = Array.from({ length: 28 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
  return `${base}_${rand}`;
}

export function maskKey(prefix: string): string {
  return `${prefix}...XXX`;
}
