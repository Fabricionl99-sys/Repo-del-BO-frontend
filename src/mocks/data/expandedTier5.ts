import type { LeaderboardEntry, OperatorConfig, PredictionEvent, PredictionMarketDefinition, Ranking } from '@/types/expandedTier5';

const iso = (days: number) => new Date(Date.now() + days * 86400000).toISOString();

export const operatorConfig: OperatorConfig = {
  commercial_name: 'Casino Astral',
  legal_name: 'Casino Astral S.A.',
  country: 'AR',
  website: 'https://casinoastral.com',
  logo_url: 'https://cdn.casinoastral.com/logo.png',
  timezone: 'America/Argentina/Buenos_Aires',
  fiat_currency: 'ARS',
  bo_locale: 'es-AR',
  widget_default_locale: 'es-AR',
  date_format: 'DMY',
  time_format: 'H24',
  first_day_of_week: 'monday',
  daily_reset_policy: 'player_tz',
  weekly_reset_policy: 'operator_tz',
  mission_reset_policy: 'operator_tz',
  month_end_policy: 'calendar',
  alerts_email: 'admin@casinoastral.com',
  reports_email: 'reportes@casinoastral.com',
  webhook_url: '',
  terms_url: 'https://casinoastral.com/terminos',
  privacy_url: 'https://casinoastral.com/privacidad',
  min_player_age: 18,
  game_catalog: { deportes: true, casino: true, casino_vivo: true, virtuales: true, poker: true },
  billing_mode: 'wallet',
  wallet_balance_usd: 2840.5,
  wallet_low_balance_threshold_usd: 500,
  status: 'active',
};

export const rankings: Ranking[] = [
  { id: 'best_xp', name: 'Mejores en XP', description: 'XP total ganado en todas las categorías', icon: '⭐', metric_label: 'XP del mes', requires_category: null, active: true, window: 'monthly', visibility: 'public', prizes: [{ position_label: '#1', position_from: 1, position_to: 1, amount: 100000, prize_type: 'coins_plus_chest' }, { position_label: '#2', position_from: 2, position_to: 2, amount: 50000, prize_type: 'coins_plus_chest' }, { position_label: '#3', position_from: 3, position_to: 3, amount: 25000, prize_type: 'coins_plus_chest' }, { position_label: '#4-10', position_from: 4, position_to: 10, amount: 10000, prize_type: 'coins' }, { position_label: '#11-20', position_from: 11, position_to: 20, amount: 5000, prize_type: 'coins' }], current_participants: 13064, total_distributed_this_period: 0, closes_at: iso(20) },
  { id: 'best_casino', name: 'Mejores en Casino', description: 'Top jugadores por monto apostado en casino', icon: '🎰', metric_label: 'monto apostado', requires_category: 'casino', active: true, window: 'monthly', visibility: 'public', prizes: [{ position_label: '#1', position_from: 1, position_to: 1, amount: 50000, prize_type: 'coins_plus_chest' }], current_participants: 8742, total_distributed_this_period: 2400000, closes_at: iso(20) },
  { id: 'best_live_casino', name: 'Mejores en Casino en vivo', description: 'Sesiones jugadas con dealer humano', icon: '🎥', metric_label: 'sesiones live', requires_category: 'casino_vivo', active: false, window: 'weekly', visibility: 'public', prizes: [], current_participants: 0, total_distributed_this_period: 0, closes_at: iso(7) },
  { id: 'best_sports', name: 'Mejores en Deportes', description: 'Monto apostado en sportsbook', icon: '⚽', metric_label: 'monto apostado', requires_category: 'deportes', active: true, window: 'monthly', visibility: 'public', prizes: [], current_participants: 4312, total_distributed_this_period: 820000, closes_at: iso(20) },
  { id: 'best_virtuals', name: 'Mejores en Virtuales', description: 'Monto apostado en virtuales', icon: '🏇', metric_label: 'monto apostado', requires_category: 'virtuales', active: false, window: 'monthly', visibility: 'public', prizes: [], current_participants: 0, total_distributed_this_period: 0, closes_at: iso(20) },
  { id: 'best_poker', name: 'Mejores en Poker', description: 'Manos jugadas', icon: '♠️', metric_label: 'manos jugadas', requires_category: 'poker', active: false, window: 'weekly', visibility: 'vip_only', prizes: [], current_participants: 0, total_distributed_this_period: 0, closes_at: iso(7) },
  { id: 'best_depositors', name: 'Mejores depositadores', description: 'Monto depositado en la ventana', icon: '💳', metric_label: 'depósitos', requires_category: null, active: true, window: 'monthly', visibility: 'anonymous', prizes: [], current_participants: 2401, total_distributed_this_period: 0, closes_at: iso(20) },
  { id: 'best_vip', name: 'Mejores VIP', description: 'XP de jugadores tier VIP+ solamente', icon: '👑', metric_label: 'XP VIP', requires_category: null, active: false, window: 'monthly', visibility: 'vip_only', prizes: [], current_participants: 0, total_distributed_this_period: 0, closes_at: iso(20) },
];

export const leaderboard: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => ({ position: i + 1, player_handle: ['@tigre_loco_82', '@maria_apuestas', '@joaquin_play', '@sofia_bet', '@crypto_king_88'][i % 5] + (i > 4 ? `_${i}` : ''), player_avatar_seed: `seed_${i}`, metric_value: 1847220 - i * 84320, change: i === 4 ? null : i % 3 === 0 ? 1 : i % 3 === 1 ? -1 : 0, vip_tier: i < 2 ? 'gold' : i < 8 ? 'silver' : 'bronze', verified: i % 4 === 0 }));

export const markets: PredictionMarketDefinition[] = [
  { id: 'result_1x2', label: 'Resultado 1X2', buttons: [{ value: 'option1', label: 'gana opción 1' }, { value: 'draw', label: 'empata' }, { value: 'option2', label: 'gana opción 2' }] },
  { id: 'winner_2options', label: 'Ganador 2 opciones', buttons: [{ value: 'option1', label: 'gana opción 1' }, { value: 'option2', label: 'gana opción 2' }] },
  { id: 'total_goals', label: 'Total goles', buttons: [{ value: 'over', label: 'más 2.5' }, { value: 'under', label: 'menos 2.5' }] },
  { id: 'total_corners', label: 'Total córners', buttons: [{ value: 'over', label: 'más 9.5' }, { value: 'under', label: 'menos 9.5' }] },
  { id: 'both_score', label: 'Ambos marcan', buttons: [{ value: 'yes', label: 'sí' }, { value: 'no', label: 'no' }] },
  { id: 'exact_score', label: 'Resultado exacto', buttons: ['1-0', '1-1', '2-0', '2-1', '2-2', '3-0', '3-1', '3-2', 'otro'].map((v) => ({ value: v, label: v })) },
];

export const predictionEvents: PredictionEvent[] = [
  { id: 'evt_champ_07may', name: 'Miércoles de Champions · 7 mayo', description: 'Predecí ganador, total goles y córners de los 5 partidos', sport: 'football', status: 'active', closes_at: iso(2), entry_cost: 1000, grand_prize_amount: 5000, grand_prize_chest_id: 'chest_epic', participants_count: 1847, pool_accumulated: 1840000, completion_rate: 0.67, items: [{ id: 'item_1', position: 1, name: 'Real Madrid vs Barcelona', market: 'result_1x2', prize_amount: 150, predictions_count: 1847, predictions_breakdown: [{ value: 'option1', count: 868, percent: 47 }, { value: 'draw', count: 333, percent: 18 }, { value: 'option2', count: 646, percent: 35 }] }, { id: 'item_2', position: 2, name: 'PSG vs Bayern', market: 'total_goals', prize_amount: 120, predictions_count: 1847, predictions_breakdown: [{ value: 'over', count: 1089, percent: 59 }, { value: 'under', count: 758, percent: 41 }] }] },
  { id: 'evt_tennis_rome', name: 'Final ATP Roma', description: 'Predicción rápida de tenis', sport: 'tennis', status: 'active', closes_at: iso(5), entry_cost: 500, grand_prize_amount: 2500, participants_count: 612, pool_accumulated: 306000, completion_rate: 0.73, items: [{ id: 'tennis_1', position: 1, name: 'Sinner vs Alcaraz', market: 'winner_2options', prize_amount: 100, predictions_count: 612, predictions_breakdown: [{ value: 'option1', count: 320, percent: 52 }, { value: 'option2', count: 292, percent: 48 }] }] },
  { id: 'evt_closed', name: 'UFC Fight Night', description: 'Pendiente de resultados', sport: 'ufc', status: 'closed_pending_result', closes_at: iso(-1), entry_cost: 1000, grand_prize_amount: 5000, participants_count: 999, pool_accumulated: 999000, completion_rate: 0.61, items: [{ id: 'ufc_1', position: 1, name: 'Main event', market: 'winner_2options', prize_amount: 200, predictions_count: 999, predictions_breakdown: [{ value: 'option1', count: 600, percent: 60 }, { value: 'option2', count: 399, percent: 40 }] }] },
];
