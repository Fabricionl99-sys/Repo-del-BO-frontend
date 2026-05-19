export type DocError = { code: number; message: string };
export type DocParam = {
  name: string;
  in: 'path' | 'query' | 'header';
  type: string;
  required: boolean;
  description: string;
};

export type DocEndpoint = {
  id: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  headers?: string[];
  parameters?: DocParam[];
  requestBody?: Record<string, unknown>;
  responseExample?: Record<string, unknown>;
  errors: DocError[];
};

export const API_BASE = 'https://api.social2game.com';

export const AUTH_SCOPES = [
  { scope: 'events:write', description: 'Enviar eventos de jugador' },
  { scope: 'players:read', description: 'Consultar perfiles gamificados' },
  { scope: 'players:write', description: 'Crear/actualizar jugadores' },
  { scope: 'rewards:write', description: 'Disparar entregas de premios' },
  { scope: 'bonuses:read', description: 'Listar bonos del operador' },
  { scope: 'bonuses:write', description: 'CRUD de bonos vía API' },
  { scope: 'currencies:read', description: 'Balances de monedas virtuales' },
  { scope: 'missions:read', description: 'Misiones publicadas' },
] as const;

export const BONUS_ENDPOINTS: DocEndpoint[] = [
  {
    id: 'list-bonuses',
    method: 'GET',
    path: '/v1/operator-bonuses',
    summary: 'Listar bonos',
    description: 'Devuelve bonos activos e inactivos del operador con paginación.',
    headers: ['Authorization: Bearer {api_key}', 'X-Operator-Id: {operator_id}'],
    parameters: [
      { name: 'status', in: 'query', type: 'string', required: false, description: 'active | inactive | all' },
      { name: 'page', in: 'query', type: 'integer', required: false, description: 'Página (default 1)' },
    ],
    responseExample: {
      data: [{ id: 'bn_01', external_id: 'FREESPIN_50', name: '50 FS Book of Dead', status: 'active' }],
      meta: { page: 1, total: 12 },
    },
    errors: [
      { code: 401, message: 'Invalid or missing API key' },
      { code: 403, message: 'Insufficient scope (bonuses:read)' },
    ],
  },
  {
    id: 'create-bonus',
    method: 'POST',
    path: '/v1/operator-bonuses',
    summary: 'Crear bono',
    description: 'Registra un bono sincronizable con tu plataforma iGaming.',
    headers: ['Authorization: Bearer {api_key}', 'Content-Type: application/json'],
    requestBody: {
      external_id: 'FREESPIN_50',
      name: '50 Free Spins',
      bonus_type: 'freespin',
      value: 50,
      currency: 'USD',
      wagering_requirement: 35,
    },
    responseExample: { data: { id: 'bn_01', status: 'active', created_at: '2026-05-18T12:00:00Z' } },
    errors: [
      { code: 400, message: 'Validation error' },
      { code: 409, message: 'external_id already exists' },
    ],
  },
  {
    id: 'update-bonus',
    method: 'PATCH',
    path: '/v1/operator-bonuses/{bonus_id}',
    summary: 'Actualizar bono',
    description: 'Actualiza campos parciales del bono.',
    parameters: [{ name: 'bonus_id', in: 'path', type: 'string', required: true, description: 'ID Social2Game' }],
    requestBody: { name: '50 FS — campaña mayo', status: 'inactive' },
    responseExample: { data: { id: 'bn_01', status: 'inactive' } },
    errors: [{ code: 404, message: 'Bonus not found' }],
  },
  {
    id: 'delete-bonus',
    method: 'DELETE',
    path: '/v1/operator-bonuses/{bonus_id}',
    summary: 'Eliminar bono',
    description: 'Soft-delete. No elimina grants históricos.',
    parameters: [{ name: 'bonus_id', in: 'path', type: 'string', required: true, description: 'ID Social2Game' }],
    responseExample: { data: { ok: true } },
    errors: [{ code: 404, message: 'Bonus not found' }],
  },
];

export const EVENT_ENDPOINTS: DocEndpoint[] = [
  {
    id: 'post-event',
    method: 'POST',
    path: '/v1/events',
    summary: 'Registrar evento',
    description: 'Envía eventos de gamificación (login, bet, deposit, etc.) desde tu backend.',
    headers: ['Authorization: Bearer {api_key}', 'Content-Type: application/json', 'Idempotency-Key: {uuid}'],
    requestBody: {
      event_type: 'bet',
      player_id: 'pl_12345',
      occurred_at: '2026-05-18T12:00:00Z',
      metadata: { amount: 25, currency: 'USD', game_id: 'slots_01' },
    },
    responseExample: { data: { id: 'evt_abc', status: 'accepted' } },
    errors: [
      { code: 400, message: 'Invalid payload' },
      { code: 401, message: 'Invalid API key' },
      { code: 429, message: 'Rate limit exceeded' },
    ],
  },
  {
    id: 'batch-events',
    method: 'POST',
    path: '/v1/events/batch',
    summary: 'Batch de eventos',
    description: 'Hasta 100 eventos por request. Recomendado para ETL nocturno.',
    requestBody: { events: [{ event_type: 'login', player_id: 'pl_1' }] },
    responseExample: { data: { accepted: 98, failed: 2, errors: [{ index: 3, message: 'player_id required' }] } },
    errors: [{ code: 413, message: 'Batch exceeds 100 events' }],
  },
];

export const CALLBACK_DOC = {
  method: 'POST' as const,
  path: 'https://{your-domain}/webhooks/social2game/rewards',
  headers: [
    'Content-Type: application/json',
    'X-S2G-Signature: sha256={hmac}',
    'X-S2G-Event: reward.granted',
    'X-S2G-Delivery-Id: del_abc123',
  ],
  body: {
    event: 'reward.granted',
    delivery_id: 'del_abc123',
    player_id: 'pl_12345',
    reward: { type: 'operator_bonus', bonus_external_id: 'FREESPIN_50', amount: 50 },
    granted_at: '2026-05-18T12:00:00Z',
  },
  response: { status: 200, body: { received: true } },
};

export const PLAYER_ENDPOINTS: DocEndpoint[] = [
  {
    id: 'get-player',
    method: 'GET',
    path: '/v1/players/{player_id}',
    summary: 'Obtener jugador',
    description: 'Perfil gamificado: nivel, XP, monedas, misiones activas.',
    parameters: [{ name: 'player_id', in: 'path', type: 'string', required: true, description: 'ID externo del operador' }],
    responseExample: {
      data: { player_id: 'pl_123', level: 12, xp: 4500, coins: [{ code: 'GOLD', amount: 120 }] },
    },
    errors: [{ code: 404, message: 'Player not found' }],
  },
  {
    id: 'sync-players',
    method: 'POST',
    path: '/v1/players/sync',
    summary: 'Sync masivo',
    description: 'Sincroniza jugadores desde tu CRM. Upsert por external_id.',
    requestBody: {
      players: [{ external_id: 'pl_1', country: 'AR', segment: 'vip', registered_at: '2025-01-01' }],
    },
    responseExample: { data: { synced: 1, created: 1, updated: 0 } },
    errors: [{ code: 400, message: 'Invalid players array' }],
  },
  {
    id: 'search-players',
    method: 'GET',
    path: '/v1/players/search',
    summary: 'Buscar jugadores',
    description: 'Búsqueda por ID parcial o email (admin scope).',
    parameters: [{ name: 'q', in: 'query', type: 'string', required: true, description: 'Query mín. 2 caracteres' }],
    responseExample: { data: [{ player_id: 'pl_123', display_name: 'Player 123' }] },
    errors: [],
  },
];

export const REFERENCE_CATEGORIES: { id: string; label: string; endpoints: DocEndpoint[] }[] = [
  { id: 'events', label: 'Events', endpoints: EVENT_ENDPOINTS },
  { id: 'players', label: 'Players', endpoints: PLAYER_ENDPOINTS },
  { id: 'bonuses', label: 'Operator bonuses', endpoints: BONUS_ENDPOINTS },
  {
    id: 'rewards',
    label: 'Rewards',
    endpoints: [
      {
        id: 'deliver-reward',
        method: 'POST',
        path: '/v1/rewards/deliver',
        summary: 'Entregar premio',
        description: 'Dispara entrega; Social2Game llama tu callback si el premio es operator_bonus.',
        requestBody: { player_id: 'pl_1', reward_id: 'rw_99', idempotency_key: 'grant-001' },
        responseExample: { data: { delivery_id: 'del_1', status: 'pending' } },
        errors: [{ code: 404, message: 'Reward not found' }],
      },
    ],
  },
  {
    id: 'currencies',
    label: 'Currencies',
    endpoints: [
      {
        id: 'balance',
        method: 'GET',
        path: '/v1/currencies/balance',
        summary: 'Balance de monedas',
        description: 'Consulta monedas virtuales del jugador.',
        parameters: [{ name: 'player_id', in: 'query', type: 'string', required: true, description: 'ID jugador' }],
        responseExample: { data: { coins: [{ code: 'XP', amount: 1200 }] } },
        errors: [],
      },
    ],
  },
  {
    id: 'missions',
    label: 'Missions',
    endpoints: [
      {
        id: 'list-missions',
        method: 'GET',
        path: '/v1/missions',
        summary: 'Listar misiones',
        description: 'Misiones publicadas para el operador.',
        responseExample: { data: { items: [{ id: 'ms_1', title: 'Login diario' }] } },
        errors: [],
      },
    ],
  },
  {
    id: 'shop',
    label: 'Shop',
    endpoints: [
      {
        id: 'catalog',
        method: 'GET',
        path: '/v1/shop/catalog',
        summary: 'Catálogo tienda',
        description: 'Items canjeables con monedas virtuales.',
        responseExample: { data: { items: [{ sku: 'bonus_10', price: 500 }] } },
        errors: [],
      },
    ],
  },
  {
    id: 'rankings',
    label: 'Rankings',
    endpoints: [
      {
        id: 'leaderboard',
        method: 'GET',
        path: '/v1/rankings/{code}/leaderboard',
        summary: 'Leaderboard',
        description: 'Top jugadores del ranking activo.',
        parameters: [{ name: 'code', in: 'path', type: 'string', required: true, description: 'Código del ranking' }],
        responseExample: { data: { entries: [{ rank: 1, player_id: 'pl_1', score: 9900 }] } },
        errors: [],
      },
    ],
  },
];

export const FLOW_DIAGRAMS = {
  integration: `sequenceDiagram
    participant Op as Tu backend
    participant S2G as Social2Game API
    participant WH as Tu webhook
    Op->>S2G: POST /v1/events
    S2G->>S2G: XP + misiones
    S2G->>WH: POST reward.granted (HMAC)
    WH-->>S2G: 200 OK`,
  bonusGrant: `flowchart LR
    A[Jugador completa misión] --> B[S2G calcula premio]
    B --> C{Tipo premio?}
    C -->|Moneda virtual| D[Acredita wallet S2G]
    C -->|Bono operador| E[POST a tu callback]
    E --> F[Tu iGaming entrega FS/FB]`,
};
