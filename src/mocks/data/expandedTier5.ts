import type { LeaderboardEntry, OperatorConfig, Ranking } from '@/types/expandedTier5';

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

