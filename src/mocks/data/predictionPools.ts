import type {
  PlayerPredictionEntry,
  PoolLeaderboardRow,
  PoolMatch,
  PoolRewardConfig,
  PredictionPool,
  PredictionPoolStats,
  PredictionSelection,
  ResolvePoolPreview,
} from '@/types/predictions';

const iso = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

const img = {
  champ: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200',
  liga: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200',
  mundial: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200',
};

const defaultRestrictions = { min_level: null, vip_only: false, new_players_only: false };

const coinsReward = (amount: number) => ({
  reward_type: 'coins' as const,
  reward_config: { amount, currency_code: 'main' },
  currency_mode: 'auto_usd' as const,
});

function makeOptions(
  eventId: string,
  labels: string[],
): PoolMatch['options'] {
  return labels.map((text, i) => ({
    id: `${eventId}_opt_${i}`,
    text,
    display_order: i,
  }));
}

function makeMatch(
  poolId: string,
  order: number,
  name: string,
  predictionType: string,
  optionLabels: string[],
  winningId: string | null = null,
): PoolMatch {
  const id = `${poolId}_ev_${order}`;
  return {
    id,
    pool_id: poolId,
    display_order: order,
    name,
    prediction_type: predictionType,
    options: makeOptions(id, optionLabels),
    winning_option_id: winningId,
    resolved_at: winningId ? ago(1) : null,
  };
}

const poolChampionsEvents = [
  makeMatch('pool_champions_s3', 0, 'Real Madrid vs Barcelona', 'Resultado', [
    'Real Madrid',
    'Empate',
    'Barcelona',
  ]),
  makeMatch('pool_champions_s3', 1, 'Juventus vs Inter', 'Resultado', ['Juventus', 'Empate', 'Inter']),
  makeMatch('pool_champions_s3', 2, 'Atlético vs Manchester United', 'Goles', ['+3.5 goles', '-3.5 goles']),
];

const poolLigaEvents = [
  makeMatch('pool_liga_j5', 0, 'Boca vs Racing', 'Resultado', ['Boca', 'Empate', 'Racing', '0-0']),
  makeMatch('pool_liga_j5', 1, 'River vs San Lorenzo', 'Goles', ['0-1', '2-3', '4+']),
  makeMatch('pool_liga_j5', 2, 'Independiente vs Huracán', 'Resultado', [
    'Independiente',
    'Empate',
    'Huracán',
    'Doble oportunidad local',
  ]),
  makeMatch('pool_liga_j5', 3, 'Talleres vs Belgrano', 'Corners', ['+8.5', '-8.5', 'Exactamente 8']),
  makeMatch('pool_liga_j5', 4, 'Estudiantes vs Gimnasia', 'Goleador', [
    'Más de 1 gol',
    'Sin goles',
    '2 o más',
    'Hat-trick',
    'Autogol',
  ]),
];

const poolMundialEvents = [
  makeMatch(
    'pool_mundial_u20',
    0,
    'Argentina vs Brasil',
    'Resultado',
    ['Argentina', 'Empate', 'Brasil', 'Penales'],
    'pool_mundial_u20_ev_0_opt_0',
  ),
  makeMatch(
    'pool_mundial_u20',
    1,
    'España vs Francia',
    'Goles',
    ['0-1', '2-3', '4+', '+2.5'],
    'pool_mundial_u20_ev_1_opt_1',
  ),
  makeMatch(
    'pool_mundial_u20',
    2,
    'México vs USA',
    'Resultado',
    ['México', 'Empate', 'USA'],
    'pool_mundial_u20_ev_2_opt_0',
  ),
  makeMatch(
    'pool_mundial_u20',
    3,
    'Alemania vs Italia',
    'Corners',
    ['+9.5', '-9.5', 'Empate en corners'],
    'pool_mundial_u20_ev_3_opt_0',
  ),
];

const topPositionsReward: PoolRewardConfig = {
  type: 'top_positions',
  positions: [
    { id: 'pos1', label: 'Posición 1', position_from: 1, position_to: 1, reward: coinsReward(5000) },
    { id: 'pos2', label: 'Posiciones 2-3', position_from: 2, position_to: 3, reward: coinsReward(2000) },
    { id: 'pos4', label: 'Posiciones 4-10', position_from: 4, position_to: 10, reward: coinsReward(500) },
  ],
};

const tiersReward: PoolRewardConfig = {
  type: 'by_hits_tiers',
  tiers: [
    { id: 't100', label: '100% aciertos', min_hits_percent: 100, reward: coinsReward(3000) },
    { id: 't80', label: '>= 80% aciertos', min_hits_percent: 80, reward: coinsReward(1000) },
    { id: 't50', label: '>= 50% aciertos', min_hits_percent: 50, reward: coinsReward(300) },
  ],
};

const jackpotReward: PoolRewardConfig = {
  type: 'all_correct_only',
  reward: coinsReward(10000),
};

export const predictionPools: PredictionPool[] = [
  {
    id: 'pool_champions_s3',
    code: 'champions_semana_3',
    name: 'Champions Semana 3',
    description: 'Prode de la semana de Champions con 3 partidos clave',
    image_url: img.champ,
    category: 'Champions League',
    status: 'open',
    opens_at: ago(2),
    closes_at: iso(3),
    resolves_at: iso(5),
    participation_cost: { type: 'paid', cost_in_coins: 100 },
    reward_structure_type: 'top_positions',
    reward_config: topPositionsReward,
    max_predictions_per_player: 1,
    target_audience: 'all',
    audience_config: {},
    restrictions: defaultRestrictions,
    is_visible_to_players: true,
    events: poolChampionsEvents,
    total_events_count: 3,
    total_entries_count: 42,
    created_at: ago(5),
    updated_at: ago(1),
  },
  {
    id: 'pool_liga_j5',
    code: 'liga_argentina_j5',
    name: 'Liga Argentina Jornada 5',
    description: 'Porra de la fecha 5 del torneo local',
    image_url: img.liga,
    category: 'Liga Local',
    status: 'closed',
    opens_at: ago(10),
    closes_at: ago(1),
    resolves_at: iso(2),
    participation_cost: { type: 'free', cost_in_coins: null },
    reward_structure_type: 'by_hits_tiers',
    reward_config: tiersReward,
    max_predictions_per_player: 1,
    target_audience: 'all',
    audience_config: {},
    restrictions: defaultRestrictions,
    is_visible_to_players: true,
    events: poolLigaEvents,
    total_events_count: 5,
    total_entries_count: 28,
    created_at: ago(12),
    updated_at: ago(1),
  },
  {
    id: 'pool_mundial_u20',
    code: 'mundial_sub20_j1',
    name: 'Mundial Sub-20 Jornada 1',
    description: 'Prode resuelto del mundial juvenil',
    image_url: img.mundial,
    category: 'Mundial',
    status: 'resolved',
    opens_at: ago(20),
    closes_at: ago(15),
    resolves_at: ago(14),
    participation_cost: { type: 'paid', cost_in_coins: 50 },
    reward_structure_type: 'all_correct_only',
    reward_config: jackpotReward,
    max_predictions_per_player: 1,
    target_audience: 'all',
    audience_config: {},
    restrictions: defaultRestrictions,
    is_visible_to_players: true,
    events: poolMundialEvents,
    total_events_count: 4,
    total_entries_count: 18,
    created_at: ago(25),
    updated_at: ago(14),
  },
  {
    id: 'pool_audit_cancel',
    code: 'prode_audit_mayo',
    name: 'Prode Auditoría Mayo',
    description: 'Cancelado por revisión de compliance',
    image_url: null,
    category: 'Interno',
    status: 'cancelled',
    opens_at: ago(8),
    closes_at: ago(5),
    resolves_at: ago(4),
    participation_cost: { type: 'paid', cost_in_coins: 25 },
    reward_structure_type: 'every_correct_gives',
    reward_config: { type: 'every_correct_gives', reward: coinsReward(50) },
    max_predictions_per_player: 1,
    target_audience: 'vip_only',
    audience_config: {},
    restrictions: { min_level: 5, vip_only: true, new_players_only: false },
    is_visible_to_players: false,
    events: [
      makeMatch('pool_audit_cancel', 0, 'Partido A vs B', 'Resultado', ['A', 'Empate', 'B']),
      makeMatch('pool_audit_cancel', 1, 'Partido C vs D', 'Goles', ['+2.5', '-2.5']),
      makeMatch('pool_audit_cancel', 2, 'Partido E vs F', 'Corners', ['+10.5', '-10.5']),
    ],
    total_events_count: 3,
    total_entries_count: 6,
    created_at: ago(9),
    updated_at: ago(4),
  },
  {
    id: 'pool_draft_clausura',
    code: 'clausura_borrador',
    name: 'Clausura 2026 (borrador)',
    description: 'Prode en preparación para la clausura',
    image_url: img.liga,
    category: 'Liga Local',
    status: 'draft',
    opens_at: iso(7),
    closes_at: iso(14),
    resolves_at: iso(16),
    participation_cost: { type: 'free', cost_in_coins: null },
    reward_structure_type: 'top_positions',
    reward_config: topPositionsReward,
    max_predictions_per_player: 1,
    target_audience: 'all',
    audience_config: {},
    restrictions: defaultRestrictions,
    is_visible_to_players: true,
    events: [
      makeMatch('pool_draft_clausura', 0, 'Fecha 1 - Partido 1', 'Resultado', ['Local', 'Empate', 'Visitante']),
      makeMatch('pool_draft_clausura', 1, 'Fecha 1 - Partido 2', 'Resultado', ['Local', 'Empate', 'Visitante']),
      makeMatch('pool_draft_clausura', 2, 'Fecha 1 - Partido 3', 'Goles', ['+2.5', '-2.5']),
      makeMatch('pool_draft_clausura', 3, 'Fecha 1 - Partido 4', 'Corners', ['+9.5', '-9.5']),
      makeMatch('pool_draft_clausura', 4, 'Fecha 1 - Partido 5', 'Resultado', ['Local', 'Empate', 'Visitante']),
      makeMatch('pool_draft_clausura', 5, 'Fecha 1 - Partido 6', 'Goleador', ['Sí', 'No']),
    ],
    total_events_count: 6,
    total_entries_count: 0,
    created_at: ago(1),
    updated_at: ago(0),
  },
];

const handles = [
  'tigre_loco_82', 'maria_apuestas', 'crypto_king_88', 'slot_hunter', 'vip_roller',
  'newbie_spin', 'retry_me', 'river_fan', 'boca_king', 'champions_pro',
];

function buildSelections(
  pool: PredictionPool,
  entryId: string,
  pattern?: number[],
): PredictionSelection[] {
  return pool.events.map((ev, i) => {
    const optIdx = pattern ? pattern[i]! % ev.options.length : Math.floor(Math.random() * ev.options.length);
    const opt = ev.options[optIdx]!;
    return {
      id: `${entryId}_sel_${ev.id}`,
      entry_id: entryId,
      event_id: ev.id,
      option_id: opt.id,
      event_name: ev.name,
      option_text: opt.text,
      prediction_type: ev.prediction_type,
      is_correct: null,
    };
  });
}

function generateEntries(): PlayerPredictionEntry[] {
  const entries: PlayerPredictionEntry[] = [];
  let n = 0;

  const addForPool = (poolId: string, count: number) => {
    const pool = predictionPools.find((p) => p.id === poolId);
    if (!pool) return;
    for (let i = 0; i < count; i++) {
      const id = `entry_${poolId}_${i}`;
      const handle = handles[n % handles.length]!;
      n++;
      entries.push({
        id,
        player_id: `pl_${handle}`,
        player_handle: handle,
        pool_id: poolId,
        predicted_at: ago(Math.floor(Math.random() * 5) + 1),
        coins_paid: pool.participation_cost.type === 'paid' ? pool.participation_cost.cost_in_coins : null,
        selections: buildSelections(pool, id),
        hits_count: pool.status === 'resolved' ? Math.floor(Math.random() * (pool.total_events_count + 1)) : null,
        total_events: pool.total_events_count,
        rank: pool.status === 'resolved' ? i + 1 : null,
        reward_delivered_at: pool.status === 'resolved' && i < 3 ? ago(14) : null,
        reward_delivered_amount: pool.status === 'resolved' && i < 3 ? '5000 coins' : null,
      });
    }
    const p = predictionPools.find((x) => x.id === poolId);
    if (p) p.total_entries_count = count;
  };

  addForPool('pool_champions_s3', 42);
  addForPool('pool_liga_j5', 28);
  addForPool('pool_mundial_u20', 18);
  addForPool('pool_audit_cancel', 6);

  return entries;
}

export let playerPredictionEntries: PlayerPredictionEntry[] = generateEntries();

export const seedPredictionPools: PredictionPool[] = JSON.parse(JSON.stringify(predictionPools));
export const seedPlayerEntries: PlayerPredictionEntry[] = JSON.parse(JSON.stringify(playerPredictionEntries));

export function resetPredictionPoolsStore() {
  predictionPools.length = 0;
  predictionPools.push(...JSON.parse(JSON.stringify(seedPredictionPools)));
  playerPredictionEntries = JSON.parse(JSON.stringify(seedPlayerEntries));
}

export function getPoolById(id: string): PredictionPool | undefined {
  return predictionPools.find((p) => p.id === id);
}

export function filterPredictionPools(params: URLSearchParams): PredictionPool[] {
  let list = [...predictionPools];
  const status = params.get('status');
  const category = params.get('category');
  const participation = params.get('participation');
  const search = params.get('search')?.toLowerCase();

  if (status && status !== 'all') list = list.filter((p) => p.status === status);
  if (category && category !== 'all') list = list.filter((p) => p.category === category);
  if (participation === 'free') list = list.filter((p) => p.participation_cost.type === 'free');
  if (participation === 'paid') list = list.filter((p) => p.participation_cost.type === 'paid');
  if (search) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.code.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search),
    );
  }
  return list;
}

export function computePredictionPoolStats(): PredictionPoolStats {
  const active = predictionPools.filter((p) => ['open', 'closed', 'resolving'].includes(p.status));
  const resolved = predictionPools.filter((p) => p.status === 'resolved');
  const catMap = new Map<string, number>();
  for (const p of predictionPools) {
    catMap.set(p.category, (catMap.get(p.category) ?? 0) + 1);
  }
  const top_categories = [...catMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const hitsMap = new Map<number, number>();
  for (const e of playerPredictionEntries) {
    if (e.hits_count != null) {
      hitsMap.set(e.hits_count, (hitsMap.get(e.hits_count) ?? 0) + 1);
    }
  }
  const hits_distribution = [...hitsMap.entries()]
    .map(([hits, count]) => ({ hits, count }))
    .sort((a, b) => b.hits - a.hits);

  const totalEntries = playerPredictionEntries.length;
  return {
    total_pools: predictionPools.length,
    active_pools: active.length,
    resolved_pools: resolved.length,
    top_categories,
    avg_entries_per_pool: predictionPools.length ? totalEntries / predictionPools.length : 0,
    hits_distribution,
  };
}

export function getUsedCategories(): string[] {
  return [...new Set(predictionPools.map((p) => p.category))];
}

export function getUsedPredictionTypes(): string[] {
  const types = new Set<string>();
  for (const p of predictionPools) {
    for (const e of p.events) types.add(e.prediction_type);
  }
  return [...types];
}

export function getPoolEntries(poolId: string): PlayerPredictionEntry[] {
  return playerPredictionEntries.filter((e) => e.pool_id === poolId);
}

export function computeLeaderboard(poolId: string): PoolLeaderboardRow[] {
  const pool = getPoolById(poolId);
  if (!pool) return [];
  const entries = getPoolEntries(poolId);
  const sorted = [...entries].sort((a, b) => (b.hits_count ?? 0) - (a.hits_count ?? 0));
  return sorted.map((e, i) => ({
    rank: i + 1,
    player_id: e.player_id,
    player_handle: e.player_handle,
    hits_count: e.hits_count ?? 0,
    total_events: e.total_events,
    reward_label: e.reward_delivered_amount,
    reward_delivered_at: e.reward_delivered_at,
  }));
}

export function computeResolvePreview(
  poolId: string,
  results: Array<{ event_id: string; winning_option_id: string }>,
): ResolvePoolPreview {
  const pool = getPoolById(poolId);
  if (!pool) {
    return { all_correct_count: 0, by_hits: [], total_prizes_summary: '' };
  }
  const winMap = new Map(results.map((r) => [r.event_id, r.winning_option_id]));
  const total = pool.events.length;
  const byHits = new Map<number, number>();

  for (const entry of getPoolEntries(poolId)) {
    let hits = 0;
    for (const sel of entry.selections) {
      if (winMap.get(sel.event_id) === sel.option_id) hits++;
    }
    byHits.set(hits, (byHits.get(hits) ?? 0) + 1);
  }

  const allCorrect = byHits.get(total) ?? 0;
  const by_hits = [...byHits.entries()]
    .map(([hits, count]) => ({ hits, count }))
    .sort((a, b) => b.hits - a.hits);

  const totalPrizesSummary =
    pool.reward_structure_type === 'all_correct_only'
      ? `${allCorrect} jackpot(s)`
      : pool.reward_structure_type === 'top_positions'
        ? `${allCorrect} premios top + ${by_hits.filter((x) => x.hits < total).reduce((s, x) => s + x.count, 0)} participantes con aciertos parciales`
        : pool.reward_structure_type === 'by_hits_tiers'
          ? by_hits.map((x) => `${x.count} con ${x.hits}/${total}`).join(', ')
          : `${by_hits.reduce((s, x) => s + x.hits * x.count, 0)} aciertos totales`;

  return {
    all_correct_count: allCorrect,
    by_hits,
    total_prizes_summary: totalPrizesSummary,
  };
}

export function applyPoolResolve(
  poolId: string,
  results: Array<{ event_id: string; winning_option_id: string }>,
): PredictionPool | null {
  const pool = getPoolById(poolId);
  if (!pool || pool.status !== 'closed') return null;

  const winMap = new Map(results.map((r) => [r.event_id, r.winning_option_id]));
  const now = new Date().toISOString();

  for (const ev of pool.events) {
    const winId = winMap.get(ev.id);
    if (winId) {
      ev.winning_option_id = winId;
      ev.resolved_at = now;
    }
  }

  const total = pool.events.length;
  const entries = getPoolEntries(poolId);

  for (const entry of entries) {
    let hits = 0;
    for (const sel of entry.selections) {
      const correct = winMap.get(sel.event_id) === sel.option_id;
      sel.is_correct = correct;
      if (correct) hits++;
    }
    entry.hits_count = hits;
    entry.total_events = total;
  }

  const sorted = [...entries].sort((a, b) => (b.hits_count ?? 0) - (a.hits_count ?? 0));
  sorted.forEach((e, i) => {
    e.rank = i + 1;
    if (pool.reward_structure_type === 'all_correct_only' && e.hits_count === total) {
      e.reward_delivered_at = now;
      e.reward_delivered_amount = 'Jackpot';
    } else if (pool.reward_structure_type === 'top_positions' && i < 10) {
      e.reward_delivered_at = now;
      e.reward_delivered_amount = i === 0 ? '1° premio' : i < 3 ? '2°-3° premio' : '4°-10° premio';
    } else if (pool.reward_structure_type === 'by_hits_tiers') {
      const pct = total ? (e.hits_count! / total) * 100 : 0;
      if (pct >= 100) e.reward_delivered_amount = 'Tier 100%';
      else if (pct >= 80) e.reward_delivered_amount = 'Tier 80%';
      else if (pct >= 50) e.reward_delivered_amount = 'Tier 50%';
      if (e.reward_delivered_amount) e.reward_delivered_at = now;
    } else if (pool.reward_structure_type === 'every_correct_gives' && e.hits_count) {
      e.reward_delivered_at = now;
      e.reward_delivered_amount = `${e.hits_count} × premio`;
    }
  });

  pool.status = 'resolved';
  pool.updated_at = now;
  return pool;
}

export function buildPoolFromPayload(
  body: import('@/types/predictions').PredictionPoolPayload,
  id?: string,
): PredictionPool {
  const poolId = id ?? `pool_${Date.now()}`;
  const events: PoolMatch[] = body.events.map((ev, i) => {
    const eventId = `${poolId}_ev_${i}`;
    return {
      id: eventId,
      pool_id: poolId,
      display_order: ev.display_order,
      name: ev.name,
      description: ev.description,
      image_url: ev.image_url,
      prediction_type: ev.prediction_type,
      options: ev.options.map((o, j) => ({
        id: `${eventId}_opt_${j}`,
        text: o.text,
        description: o.description,
        image_url: o.image_url,
        display_order: o.display_order,
      })),
      winning_option_id: null,
      resolved_at: null,
    };
  });

  return {
    id: poolId,
    code: body.code,
    name: body.name,
    description: body.description,
    image_url: body.image_url ?? null,
    category: body.category,
    status: 'draft',
    opens_at: body.opens_at,
    closes_at: body.closes_at,
    resolves_at: body.resolves_at,
    participation_cost: body.participation_cost,
    reward_structure_type: body.reward_structure_type,
    reward_config: body.reward_config,
    max_predictions_per_player: body.max_predictions_per_player,
    target_audience: body.target_audience,
    audience_config: body.audience_config,
    restrictions: body.restrictions,
    is_visible_to_players: body.is_visible_to_players,
    events,
    total_events_count: events.length,
    total_entries_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
