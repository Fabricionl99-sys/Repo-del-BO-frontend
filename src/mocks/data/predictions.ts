import type {
  PlayerPrediction,
  PredictionEvent,
  PredictionStats,
} from '@/types/predictions';

const iso = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

const defaultReward = {
  reward_type: 'coins' as const,
  reward_config: { amount: 500, currency_code: 'main' },
  currency_mode: 'auto_usd' as const,
};

const defaultRestrictions = {
  min_level: null,
  vip_only: false,
  new_players_only: false,
};

export const predictionEvents: PredictionEvent[] = [
  {
    id: 'pred_river_boca',
    code: 'river_boca_resultado',
    name: 'River vs Boca - Resultado final',
    description: 'Predicción del resultado del superclásico',
    category: 'Deportes',
    prediction_type: 'Resultado',
    options: [
      { id: 'opt_rb_1', text: 'Gana River', display_order: 0 },
      { id: 'opt_rb_2', text: 'Empate', display_order: 1 },
      { id: 'opt_rb_3', text: 'Gana Boca', display_order: 2 },
    ],
    opens_at: ago(2),
    closes_at: iso(1),
    resolves_at: iso(2),
    status: 'open',
    winning_option_id: null,
    participation_cost: { type: 'free', cost_in_coins: null },
    reward_config: defaultReward,
    max_predictions_per_player: 1,
    is_visible_to_players: true,
    restrictions: defaultRestrictions,
    predictions_count: 28,
    created_at: ago(5),
    updated_at: ago(1),
  },
  {
    id: 'pred_mundial_gol',
    code: 'mundial_primer_gol',
    name: 'Próximo gol Mundial - Primer goleador',
    description: '¿Qué selección marca el primer gol del partido?',
    category: 'Deportes',
    prediction_type: 'Goleador',
    options: [
      { id: 'opt_mg_1', text: 'Argentina', display_order: 0 },
      { id: 'opt_mg_2', text: 'Brasil', display_order: 1 },
      { id: 'opt_mg_3', text: 'Francia', display_order: 2 },
      { id: 'opt_mg_4', text: 'España', display_order: 3 },
      { id: 'opt_mg_5', text: 'Sin gol en 1er tiempo', display_order: 4 },
    ],
    opens_at: ago(1),
    closes_at: iso(3),
    resolves_at: iso(4),
    status: 'open',
    winning_option_id: null,
    participation_cost: { type: 'paid_with_coins', cost_in_coins: 100 },
    reward_config: {
      reward_type: 'freespin',
      reward_config: { bonus_id: 'ob_fs_book_dead' },
      currency_mode: 'auto_usd',
    },
    max_predictions_per_player: 1,
    is_visible_to_players: true,
    restrictions: { min_level: 3, vip_only: false, new_players_only: false },
    predictions_count: 19,
    created_at: ago(4),
    updated_at: ago(1),
  },
  {
    id: 'pred_casino_jackpot',
    code: 'casino_jackpot_mayo',
    name: '¿Quién gana el jackpot de slots?',
    description: 'Predicción resuelta del torneo de casino',
    category: 'Casino',
    prediction_type: 'Ganador',
    options: [
      { id: 'opt_cj_1', text: 'crypto_king_88', display_order: 0 },
      { id: 'opt_cj_2', text: 'MariaG_bet', display_order: 1 },
      { id: 'opt_cj_3', text: 'slot_master_ar', display_order: 2 },
    ],
    opens_at: ago(14),
    closes_at: ago(7),
    resolves_at: ago(6),
    status: 'resolved',
    winning_option_id: 'opt_cj_1',
    participation_cost: { type: 'free', cost_in_coins: null },
    reward_config: {
      reward_type: 'coins',
      reward_config: { amount: 2000, currency_code: 'main' },
      currency_mode: 'manual_per_currency',
    },
    max_predictions_per_player: 1,
    is_visible_to_players: true,
    restrictions: defaultRestrictions,
    predictions_count: 15,
    created_at: ago(20),
    updated_at: ago(6),
  },
  {
    id: 'pred_cancelled',
    code: 'evento_cancelado_qa',
    name: 'Evento cancelado - Tenis ATP',
    description: 'Partido suspendido por lluvia',
    category: 'Deportes',
    prediction_type: 'Resultado',
    options: [
      { id: 'opt_ca_1', text: 'Gana Sinner', display_order: 0 },
      { id: 'opt_ca_2', text: 'Gana Alcaraz', display_order: 1 },
    ],
    opens_at: ago(10),
    closes_at: ago(8),
    resolves_at: ago(7),
    status: 'cancelled',
    winning_option_id: null,
    participation_cost: { type: 'paid_with_coins', cost_in_coins: 50 },
    reward_config: defaultReward,
    max_predictions_per_player: 1,
    is_visible_to_players: false,
    restrictions: defaultRestrictions,
    predictions_count: 8,
    created_at: ago(12),
    updated_at: ago(7),
  },
  {
    id: 'pred_corners',
    code: 'river_boca_corners',
    name: 'River vs Boca - Corners totales',
    description: 'Rango de córners en el partido',
    category: 'Deportes',
    prediction_type: 'Corners',
    options: [
      { id: 'opt_co_1', text: 'Menos de 8.5', display_order: 0 },
      { id: 'opt_co_2', text: 'Entre 9 y 10', display_order: 1 },
      { id: 'opt_co_3', text: 'Entre 11 y 12', display_order: 2 },
      { id: 'opt_co_4', text: 'Entre 13 y 14', display_order: 3 },
      { id: 'opt_co_5', text: 'Más de 14.5', display_order: 4 },
    ],
    opens_at: ago(5),
    closes_at: ago(1),
    resolves_at: iso(1),
    status: 'closed',
    winning_option_id: null,
    participation_cost: { type: 'free', cost_in_coins: null },
    reward_config: {
      reward_type: 'freebet',
      reward_config: { bonus_id: 'ob_fb_sports_25' },
      currency_mode: 'auto_usd',
    },
    max_predictions_per_player: 1,
    is_visible_to_players: true,
    restrictions: defaultRestrictions,
    predictions_count: 22,
    created_at: ago(8),
    updated_at: ago(1),
  },
  {
    id: 'pred_draft',
    code: 'draft_eventos_especiales',
    name: 'Evento especial - Draft',
    description: 'Borrador para evento de entretenimiento',
    category: 'Eventos',
    prediction_type: 'Ganador',
    options: [
      { id: 'opt_dr_1', text: 'Opción A', display_order: 0 },
      { id: 'opt_dr_2', text: 'Opción B', display_order: 1 },
    ],
    opens_at: iso(5),
    closes_at: iso(10),
    resolves_at: iso(12),
    status: 'draft',
    winning_option_id: null,
    participation_cost: { type: 'free', cost_in_coins: null },
    reward_config: defaultReward,
    max_predictions_per_player: 1,
    is_visible_to_players: false,
    restrictions: defaultRestrictions,
    predictions_count: 0,
    created_at: ago(1),
    updated_at: ago(1),
  },
];

const players = [
  'crypto_king_88',
  'MariaG_bet',
  'tigre_loco_82',
  'joaquin_play',
  'sofia_bet',
  'slot_master_ar',
  'bet_pro_ar',
  'lucas_777',
  'ana_slots',
  'river_fan_12',
];

function buildPlayerPredictions(): PlayerPrediction[] {
  const records: PlayerPrediction[] = [];
  let idx = 0;
  for (const event of predictionEvents) {
    if (event.predictions_count === 0) continue;
    const optionIds = event.options.map((o) => o.id);
    for (let i = 0; i < event.predictions_count; i++) {
      const optionId = optionIds[i % optionIds.length];
      const option = event.options.find((o) => o.id === optionId)!;
      const player = players[i % players.length];
      const isWinner =
        event.status === 'resolved' && event.winning_option_id
          ? optionId === event.winning_option_id
          : null;
      records.push({
        id: `pp_${idx++}`,
        player_id: `player_${player}`,
        player_handle: `@${player}`,
        event_id: event.id,
        option_id: optionId,
        option_text: option.text,
        predicted_at: ago(Math.floor(Math.random() * 5) + 1),
        is_winner: isWinner,
        reward_delivered_at:
          isWinner === true ? ago(5) : null,
        coins_paid:
          event.participation_cost.type === 'paid_with_coins'
            ? event.participation_cost.cost_in_coins
            : null,
      });
    }
  }
  return records;
}

export let playerPredictions: PlayerPrediction[] = buildPlayerPredictions();

export function computePredictionStats(events: PredictionEvent[]): PredictionStats {
  const active = events.filter((e) => e.status === 'open').length;
  const resolved = events.filter((e) => e.status === 'resolved').length;
  const categoryMap = new Map<string, number>();
  for (const e of events) {
    categoryMap.set(e.category, (categoryMap.get(e.category) ?? 0) + 1);
  }
  const top_categories = [...categoryMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
  const totalPredictions = events.reduce((s, e) => s + e.predictions_count, 0);
  return {
    total_events: events.length,
    active_events: active,
    resolved_events: resolved,
    top_categories,
    avg_predictions_per_event: events.length ? totalPredictions / events.length : 0,
  };
}

export const seedPredictionEvents: PredictionEvent[] = JSON.parse(JSON.stringify(predictionEvents));
export const seedPlayerPredictions: PlayerPrediction[] = JSON.parse(JSON.stringify(playerPredictions));

export function resetPredictionsStore() {
  predictionEvents.length = 0;
  predictionEvents.push(...JSON.parse(JSON.stringify(seedPredictionEvents)));
  playerPredictions = JSON.parse(JSON.stringify(seedPlayerPredictions));
}

export function filterPredictionEvents(params: URLSearchParams): PredictionEvent[] {
  const status = params.get('status');
  const category = params.get('category');
  const participation = params.get('participation');
  const search = params.get('search')?.toLowerCase();
  return predictionEvents.filter((e) => {
    if (status && status !== 'all' && e.status !== status) return false;
    if (category && category !== 'all' && e.category !== category) return false;
    if (participation === 'free' && e.participation_cost.type !== 'free') return false;
    if (participation === 'paid' && e.participation_cost.type !== 'paid_with_coins') return false;
    if (search && !e.name.toLowerCase().includes(search) && !e.code.toLowerCase().includes(search)) {
      return false;
    }
    return true;
  });
}

export function getUsedCategories(): string[] {
  return [...new Set(predictionEvents.map((e) => e.category))].sort();
}
