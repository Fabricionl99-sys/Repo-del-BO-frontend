/**
 * Sprint #5 — tournamentsApi adapter al backend.
 *
 * El BO usa shape rico (audience targeting con countries/players,
 * filters por bet amount/odds/games, competition_type incluye win_streak
 * y biggest_multiplier). El backend MVP soporta:
 *   - 4 competition_types (wagering, bets_count, xp_gained, coins_earned)
 *   - 3 registration_types (auto, opt_in_free, opt_in_paid)
 *   - 3 period_types (one_time, recurring_weekly, recurring_monthly)
 *   - restrictions: min_level, vip_only, new_players_only
 *   - activity_categories (array de strings)
 *
 * Adaptaciones:
 *   - 'win_streak'/'biggest_multiplier' (BO) → 'amount_wagered' (backend
 *     default; el operador puede cambiar)
 *   - audience targeting BO compleja → restrictions backend
 *   - filters.specific_games_only / min_bet / min_odds: IGNORED
 *   - BO usa "id" en URL → mapeamos como "code" backend
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { normalizeTournament, normalizeTournaments } from '@/features/tournaments/tournamentShape';
import { toast } from '@/stores/toastStore';
import type {
  Tournament,
  TournamentActivityType,
  TournamentAudienceType,
  TournamentFiltersQuery,
  TournamentLeaderboardEntry,
  TournamentPayload,
  TournamentRegistrationRecord,
  TournamentRegistrationsQuery,
  TournamentStatus,
} from '@/types/tournaments';

// ─── Backend shape ────────────────────────────────────────────────────

interface BackendPrize {
  id: string;
  position_from: number;
  position_to: number;
  reward_type: 'coins' | 'xp' | 'manual';
  reward_config: Record<string, unknown>;
  created_at: string;
}

interface BackendTournament {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  activity_categories: string[];
  competition_type: 'amount_wagered' | 'bets_count' | 'xp_gained' | 'coins_earned';
  competition_currency_id: string | null;
  registration_type: 'auto' | 'opt_in_free' | 'opt_in_paid';
  registration_cost_amount: number;
  registration_cost_currency_id: string | null;
  period_type: 'one_time' | 'recurring_weekly' | 'recurring_monthly';
  period_starts_at: string;
  period_ends_at: string;
  restrictions: { min_level?: number; vip_only?: boolean; new_players_only?: boolean };
  max_visible_positions: number;
  status: TournamentStatus;
  is_visible_to_players: boolean;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  prizes?: BackendPrize[];
  registrations_count?: number;
}

// ─── Adapters ──────────────────────────────────────────────────────────

const COMP_BO_TO_BACKEND: Record<string, BackendTournament['competition_type']> = {
  wagering: 'amount_wagered',
  bets_count: 'bets_count',
  xp_gained: 'xp_gained',
  coins_earned: 'coins_earned',
  win_streak: 'bets_count', // MVP fallback
  biggest_multiplier: 'amount_wagered', // MVP fallback
};
const COMP_BACKEND_TO_BO: Record<string, string> = {
  amount_wagered: 'wagering',
  bets_count: 'bets_count',
  xp_gained: 'xp_gained',
  coins_earned: 'coins_earned',
};

const REG_BO_TO_BACKEND: Record<string, BackendTournament['registration_type']> = {
  auto_enroll: 'auto',
  opt_in_free: 'opt_in_free',
  opt_in_paid: 'opt_in_paid',
};
const REG_BACKEND_TO_BO: Record<string, 'auto_enroll' | 'opt_in_free' | 'opt_in_paid'> = {
  auto: 'auto_enroll',
  opt_in_free: 'opt_in_free',
  opt_in_paid: 'opt_in_paid',
};

function backendToBo(t: BackendTournament): Tournament {
  // Restrictions → audience type heuristic.
  let audience_type: TournamentAudienceType = 'all_players';
  if (t.restrictions.vip_only) audience_type = 'vip_only';
  else if (t.restrictions.new_players_only) audience_type = 'new_players';
  else if (t.restrictions.min_level) audience_type = 'by_level';

  return {
    id: t.code, // BO usa "id" como string opaco → guardamos el code.
    code: t.code,
    name: t.name,
    description: t.description,
    image_url: t.image_url ?? '',
    activity_types: t.activity_categories as TournamentActivityType[],
    competition_type: (COMP_BACKEND_TO_BO[t.competition_type] ?? 'wagering') as Tournament['competition_type'],
    filters: { min_bet_amount_usd: null, specific_games_only: [], min_odds: null },
    participants: {
      audience_type,
      audience_config: {
        min_level: t.restrictions.min_level,
        max_level: undefined,
      },
    },
    registration: {
      type: REG_BACKEND_TO_BO[t.registration_type] ?? 'auto_enroll',
      cost_in_coins:
        t.registration_type === 'opt_in_paid' ? t.registration_cost_amount : null,
    },
    period: {
      starts_at: t.period_starts_at,
      ends_at: t.period_ends_at,
      type: t.period_type,
    },
    prizes: (t.prizes ?? []).map((p) => ({
      id: p.id,
      position_from: p.position_from,
      position_to: p.position_to,
      reward_type: p.reward_type === 'coins' ? 'coins' : p.reward_type === 'xp' ? 'coins' : 'manual',
      reward_config: p.reward_config,
      currency_mode: 'manual_per_currency',
    })),
    max_visible_positions: t.max_visible_positions,
    is_active: t.status === 'active',
    status: t.status,
    participants_count: t.registrations_count ?? 0,
    created_at: t.created_at,
    updated_at: t.updated_at,
  };
}

function boPayloadToBackend(payload: TournamentPayload): Record<string, unknown> {
  // Restrictions: audience BO → restrictions backend.
  const restrictions: Record<string, unknown> = {};
  if (payload.participants.audience_type === 'vip_only') restrictions.vip_only = true;
  if (payload.participants.audience_type === 'new_players') restrictions.new_players_only = true;
  if (payload.participants.audience_type === 'by_level' && payload.participants.audience_config.min_level) {
    restrictions.min_level = payload.participants.audience_config.min_level;
  }

  return {
    code: payload.code,
    name: payload.name,
    description: payload.description,
    image_url: payload.image_url || null,
    activity_categories: payload.activity_types,
    competition_type: COMP_BO_TO_BACKEND[payload.competition_type] ?? 'amount_wagered',
    registration_type: REG_BO_TO_BACKEND[payload.registration.type] ?? 'auto',
    registration_cost_amount: payload.registration.cost_in_coins ?? 0,
    // currency_id: el form no expone — backend valida y rechaza si opt_in_paid sin currency.
    registration_cost_currency_id: null,
    period_type: payload.period.type,
    period_starts_at: payload.period.starts_at,
    period_ends_at: payload.period.ends_at,
    restrictions,
    max_visible_positions: payload.max_visible_positions,
    is_visible_to_players: payload.is_active,
    prizes: payload.prizes.map((p) => ({
      position_from: p.position_from,
      position_to: p.position_to,
      reward_type: p.reward_type === 'coins' ? 'coins' : p.reward_type === 'manual' ? 'manual' : 'coins',
      reward_config: p.reward_config,
    })),
  };
}

// ─── Hooks ─────────────────────────────────────────────────────────────

function buildTournamentQuery(filters: TournamentFiltersQuery): string {
  const sp = new URLSearchParams();
  if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
  if (filters.search) sp.set('search', filters.search);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

function buildRegistrationsQuery(filters: TournamentRegistrationsQuery): string {
  const sp = new URLSearchParams();
  if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
  if (filters.player_search) sp.set('player_search', filters.player_search);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export function useTournamentsList(filters: TournamentFiltersQuery = {}) {
  return useQuery({
    queryKey: ['tournaments', filters],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/tournaments${buildTournamentQuery(filters)}`);
      const list = unwrapData<BackendTournament[]>(res.data);
      return normalizeTournaments(list.map(backendToBo));
    },
  });
}

export function useTournamentItem(idOrCode: string | null) {
  return useQuery({
    queryKey: ['tournaments', idOrCode],
    enabled: Boolean(idOrCode),
    queryFn: () =>
      apiClient
        .get(`/admin/tournaments/${idOrCode}`)
        .then((r) => unwrapData<BackendTournament>(r.data))
        .then((t) => normalizeTournament(backendToBo(t))),
  });
}

export function useTournamentLeaderboard(idOrCode: string | null) {
  return useQuery({
    queryKey: ['tournament-leaderboard', idOrCode],
    enabled: Boolean(idOrCode),
    queryFn: async () => {
      const res = await apiClient.get(`/admin/tournaments/${idOrCode}/leaderboard`);
      const data = unwrapData<{ entries: Array<{ position: number; player_state_id: string; player_handle: string; metric_value: number }> }>(res.data);
      return data.entries.map<TournamentLeaderboardEntry>((e) => ({
        position: e.position,
        player_id: e.player_state_id,
        player_handle: e.player_handle,
        metric_value: e.metric_value,
        change: null,
      }));
    },
  });
}

export function useTournamentRegistrations(filters: TournamentRegistrationsQuery = {}) {
  // Backend tiene /admin/tournaments/:code/registrations — necesita tournament_id.
  // Si BO pide "todas" sin tournament_id, stub vacío. Caso esperado: filter.tournament_id.
  return useQuery({
    queryKey: ['tournament-registrations', filters],
    enabled: Boolean(filters.tournament_id && filters.tournament_id !== 'all'),
    queryFn: async () => {
      const res = await apiClient.get(
        `/admin/tournaments/${filters.tournament_id}/registrations${buildRegistrationsQuery(filters)}`,
      );
      const raw = unwrapData<Array<{
        id: string;
        tournament_id: string;
        player_state_id: string;
        registered_at: string;
        registration_type_snapshot: string;
        cost_paid_amount: number;
        invalidated_at: string | null;
      }>>(res.data);
      return raw.map<TournamentRegistrationRecord>((r) => ({
        id: r.id,
        tournament_id: r.tournament_id,
        tournament_name: filters.tournament_id ?? '',
        player_id: r.player_state_id,
        player_handle: r.player_state_id.slice(0, 8),
        registered_at: r.registered_at,
        status: r.invalidated_at ? 'invalidated' : 'active',
        registration_type: REG_BACKEND_TO_BO[r.registration_type_snapshot] ?? 'auto_enroll',
        coins_paid: r.cost_paid_amount > 0 ? r.cost_paid_amount : null,
      }));
    },
  });
}

export function useOperatorGames() {
  // MVP: backend no expone catálogo de juegos del operador.
  // Stub con las categorías estándar.
  return useQuery({
    queryKey: ['operator-games'],
    queryFn: async () => [
      { id: 'deportes', name: 'Deportes' },
      { id: 'casino_vivo', name: 'Casino en vivo' },
      { id: 'slots', name: 'Slots' },
      { id: 'bingo', name: 'Bingo' },
      { id: 'crash', name: 'Crash' },
      { id: 'poker', name: 'Poker' },
    ],
  });
}

export function useSaveTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: TournamentPayload & { id?: string }) => {
      const body = boPayloadToBackend(payload);
      const result = id
        ? await apiClient.patch(`/admin/tournaments/${id}`, body).then((r) => unwrapData<BackendTournament>(r.data))
        : await apiClient.post('/admin/tournaments', body).then((r) => unwrapData<BackendTournament>(r.data));
      // Si lo crearon en draft + is_active=true en BO → publicarlo.
      if (!id && payload.is_active && result.status === 'draft') {
        const opened = await apiClient
          .post(`/admin/tournaments/${result.code}/open`)
          .then((r) => unwrapData<BackendTournament>(r.data));
        return backendToBo(opened);
      }
      return backendToBo(result);
    },
    onSuccess: () => {
      toast.success('Torneo guardado');
      qc.invalidateQueries({ queryKey: ['tournaments'] });
      qc.invalidateQueries({ queryKey: ['tournament-registrations'] });
    },
  });
}

export function useArchiveTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idOrCode: string) =>
      apiClient.post(`/admin/tournaments/${idOrCode}/cancel`),
    onSuccess: () => {
      toast.success('Torneo archivado');
      qc.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
}

export function useInvalidateRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .delete(`/admin/tournaments/registrations/${id}`, {
          data: { reason: 'Invalidated by operator' },
        })
        .then((r) => unwrapData<TournamentRegistrationRecord>(r.data)),
    onSuccess: () => {
      toast.success('Inscripción invalidada');
      qc.invalidateQueries({ queryKey: ['tournament-registrations'] });
    },
  });
}

export function useUploadTournamentBanner() {
  // MVP: usar el endpoint de uploads genérico.
  return useMutation({
    mutationFn: () =>
      apiClient.post('/admin/upload-image').then(
        (r) => r.data as { uploadUrl: string; finalUrl: string },
      ),
  });
}
