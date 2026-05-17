import type {
  Tournament,
  TournamentLeaderboardEntry,
  TournamentRegistrationRecord,
} from '@/types/tournaments';

const iso = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

const defaultPrize = {
  position_from: 1,
  position_to: 1,
  reward_type: 'coins' as const,
  reward_config: { amount: 5000, currency_code: 'main' },
  currency_mode: 'auto_usd' as const,
};

export const tournaments: Tournament[] = [
  {
    id: 'tourn_wagering_casino',
    code: 'wagering_casino_semanal',
    name: 'Wagering Madness Semanal',
    description: 'Mayor monto apostado en casino esta semana',
    image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800',
    activity_types: ['casino', 'slots'],
    competition_type: 'wagering',
    filters: { min_bet_amount_usd: 1, specific_games_only: [], min_odds: null },
    participants: { audience_type: 'all_players', audience_config: {} },
    registration: { type: 'auto_enroll', cost_in_coins: null },
    period: { starts_at: ago(2), ends_at: iso(5), type: 'recurring_weekly' },
    prizes: [
      { id: 'prize_wc_1', ...defaultPrize },
      {
        id: 'prize_wc_2',
        position_from: 2,
        position_to: 5,
        reward_type: 'coins',
        reward_config: { amount: 2000, currency_code: 'main' },
        currency_mode: 'auto_usd',
      },
    ],
    max_visible_positions: 100,
    is_active: true,
    status: 'active',
    participants_count: 847,
    created_at: ago(10),
    updated_at: ago(1),
  },
  {
    id: 'tourn_xp_sports',
    code: 'xp_sports_master',
    name: 'XP Sports Master',
    description: 'Mayor XP ganado en deportes del mes',
    image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba9681?w=800',
    activity_types: ['sports'],
    competition_type: 'xp_gained',
    filters: { min_bet_amount_usd: 5, specific_games_only: [], min_odds: 1.5 },
    participants: { audience_type: 'all_players', audience_config: {} },
    registration: { type: 'opt_in_free', cost_in_coins: null },
    period: { starts_at: ago(5), ends_at: iso(25), type: 'recurring_monthly' },
    prizes: [
      {
        id: 'prize_xs_1',
        position_from: 1,
        position_to: 3,
        reward_type: 'freespin',
        reward_config: { quantity: 50 },
        currency_mode: 'auto_usd',
      },
    ],
    max_visible_positions: 50,
    is_active: true,
    status: 'active',
    participants_count: 412,
    created_at: ago(15),
    updated_at: ago(2),
  },
  {
    id: 'tourn_live_vip',
    code: 'live_casino_vip',
    name: 'Live Casino VIP Challenge',
    description: 'Competencia exclusiva para jugadores VIP en live casino',
    image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    activity_types: ['live_casino'],
    competition_type: 'bets_count',
    filters: { min_bet_amount_usd: 10, specific_games_only: ['blackjack_live', 'roulette_live'], min_odds: null },
    participants: { audience_type: 'vip_only', audience_config: {} },
    registration: { type: 'auto_enroll', cost_in_coins: null },
    period: { starts_at: ago(1), ends_at: iso(6), type: 'recurring_weekly' },
    prizes: [
      {
        id: 'prize_lv_1',
        position_from: 1,
        position_to: 1,
        reward_type: 'cashback',
        reward_config: { percentage: 10, max_amount: 500 },
        currency_mode: 'manual_per_currency',
      },
    ],
    max_visible_positions: 20,
    is_active: true,
    status: 'active',
    participants_count: 128,
    created_at: ago(8),
    updated_at: ago(1),
  },
  {
    id: 'tourn_slot_premium',
    code: 'slot_mania_premium',
    name: 'Slot Mania Premium',
    description: 'Torneo premium de slots con inscripción pagada',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    activity_types: ['slots'],
    competition_type: 'biggest_multiplier',
    filters: { min_bet_amount_usd: 0.5, specific_games_only: [], min_odds: null },
    participants: { audience_type: 'by_level', audience_config: { min_level: 5, max_level: 99 } },
    registration: { type: 'opt_in_paid', cost_in_coins: 500 },
    period: { starts_at: iso(3), ends_at: iso(10), type: 'one_time' },
    prizes: [
      {
        id: 'prize_sp_1',
        position_from: 1,
        position_to: 10,
        reward_type: 'coins',
        reward_config: { amount: 10000, currency_code: 'main' },
        currency_mode: 'auto_usd',
      },
    ],
    max_visible_positions: 100,
    is_active: false,
    status: 'draft',
    participants_count: 0,
    created_at: ago(2),
    updated_at: ago(1),
  },
  {
    id: 'tourn_crash_race',
    code: 'crash_race_marzo',
    name: 'Crash Race',
    description: 'Torneo finalizado de crash games para auditoría',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
    activity_types: ['crash_games'],
    competition_type: 'win_streak',
    filters: { min_bet_amount_usd: 1, specific_games_only: ['aviator', 'jetx'], min_odds: null },
    participants: { audience_type: 'all_players', audience_config: {} },
    registration: { type: 'opt_in_free', cost_in_coins: null },
    period: { starts_at: ago(30), ends_at: ago(23), type: 'one_time' },
    prizes: [
      {
        id: 'prize_cr_1',
        position_from: 1,
        position_to: 1,
        reward_type: 'coins',
        reward_config: { amount: 15000, currency_code: 'main' },
        currency_mode: 'auto_usd',
      },
      {
        id: 'prize_cr_2',
        position_from: 2,
        position_to: 5,
        reward_type: 'coins',
        reward_config: { amount: 3000, currency_code: 'main' },
        currency_mode: 'auto_usd',
      },
    ],
    max_visible_positions: 50,
    is_active: false,
    status: 'finished',
    participants_count: 623,
    created_at: ago(35),
    updated_at: ago(23),
  },
];

const leaderboardPlayers = [
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
  'poker_face_99',
  'crash_king',
  'vip_diamond',
  'new_player_01',
  'sports_fan_ar',
];

export const tournamentLeaderboards: Record<string, TournamentLeaderboardEntry[]> = {};

for (const t of tournaments) {
  if (t.status !== 'active' && t.status !== 'finished') continue;
  tournamentLeaderboards[t.id] = leaderboardPlayers.slice(0, 12).map((handle, i) => ({
    position: i + 1,
    player_id: `player_${handle}`,
    player_handle: `@${handle}`,
    metric_value: 150000 - i * 8200,
    change: i % 3 === 0 ? 1 : i % 3 === 1 ? -1 : 0,
  }));
}

export const tournamentRegistrations: TournamentRegistrationRecord[] = [];

for (const t of tournaments) {
  if (t.participants_count === 0) continue;
  const count = Math.min(t.participants_count, 15);
  for (let i = 0; i < count; i++) {
    const handle = leaderboardPlayers[i % leaderboardPlayers.length];
    tournamentRegistrations.push({
      id: `reg_${t.id}_${i}`,
      tournament_id: t.id,
      tournament_name: t.name,
      player_id: `player_${handle}`,
      player_handle: `@${handle}`,
      registered_at: ago(Math.floor(Math.random() * 10) + 1),
      status: 'active',
      registration_type: t.registration.type,
      coins_paid: t.registration.type === 'opt_in_paid' ? t.registration.cost_in_coins : null,
    });
  }
}

export const seedTournaments: Tournament[] = JSON.parse(JSON.stringify(tournaments));
export const seedTournamentRegistrations: TournamentRegistrationRecord[] = JSON.parse(
  JSON.stringify(tournamentRegistrations),
);

export function resetTournamentsStore() {
  tournaments.length = 0;
  tournaments.push(...JSON.parse(JSON.stringify(seedTournaments)));
  tournamentRegistrations.length = 0;
  tournamentRegistrations.push(...JSON.parse(JSON.stringify(seedTournamentRegistrations)));
}

export function filterTournaments(params: URLSearchParams): Tournament[] {
  const status = params.get('status');
  const competition = params.get('competition_type');
  const audience = params.get('audience_type');
  const search = params.get('search')?.toLowerCase();
  return tournaments.filter((t) => {
    if (status && status !== 'all' && t.status !== status) return false;
    if (competition && competition !== 'all' && t.competition_type !== competition) return false;
    if (audience && audience !== 'all' && t.participants.audience_type !== audience) return false;
    if (search && !t.name.toLowerCase().includes(search) && !t.code.toLowerCase().includes(search)) {
      return false;
    }
    return true;
  });
}

export function filterRegistrations(params: URLSearchParams): TournamentRegistrationRecord[] {
  const tournamentId = params.get('tournament_id');
  const status = params.get('status');
  const playerSearch = params.get('player_search')?.toLowerCase();
  return tournamentRegistrations.filter((r) => {
    if (tournamentId && tournamentId !== 'all' && r.tournament_id !== tournamentId) return false;
    if (status && status !== 'all' && r.status !== status) return false;
    if (
      playerSearch &&
      !r.player_handle.toLowerCase().includes(playerSearch) &&
      !r.player_id.toLowerCase().includes(playerSearch)
    ) {
      return false;
    }
    return true;
  });
}

export const operatorGames = [
  { id: 'book_of_dead', name: 'Book of Dead' },
  { id: 'starburst', name: 'Starburst' },
  { id: 'sweet_bonanza', name: 'Sweet Bonanza' },
  { id: 'blackjack_live', name: 'Blackjack Live' },
  { id: 'roulette_live', name: 'Roulette Live' },
  { id: 'aviator', name: 'Aviator' },
  { id: 'jetx', name: 'JetX' },
];
