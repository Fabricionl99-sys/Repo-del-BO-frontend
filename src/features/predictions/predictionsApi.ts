/**
 * Sprint #5 — predictionsApi adapter.
 *
 * El BO fue diseñado con un modelo rico de "pools" (audience targeting,
 * 4 reward structure types, hits tiers, etc.) pero el backend MVP solo
 * soporta:
 *   - 1 reward structure type: top_positions (premios por puesto top N)
 *   - audience: todos los jugadores del tenant (sin filtros)
 *   - status: draft / open / in_progress / closed / archived (no resolving)
 *
 * Este adapter mapea ambas direcciones:
 *   PredictionPool (BO) ↔ TournamentDetail/Row (backend)
 *
 * Campos no soportados en backend MVP:
 *   - target_audience, audience_config, restrictions: ignorados en send,
 *     default 'all' en read.
 *   - reward_structure_type !== 'top_positions': forzamos top_positions en
 *     create/update (Sprint #6 podemos extender).
 *   - resolves_at: derivado del max(events.predict_deadline_at).
 *   - status 'resolving': mapeamos a 'in_progress'.
 *   - max_predictions_per_player: ignorado (siempre 1 por evento).
 *   - category: ignorado por ahora (Sprint #6 podemos agregar columna).
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { getApiErrorMessage } from '@/api/errors';
import { unwrapData, unwrapDataList } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  PlayerPredictionEntry,
  PoolLeaderboardRow,
  PoolMatch,
  PredictionPool,
  PredictionPoolFilters,
  PredictionPoolPayload,
  PredictionPoolStats,
  PredictionPoolStatus,
  ResolvePoolPayload,
  ResolvePoolPreview,
  TopPositionReward,
} from '@/types/predictions';

// ─── Backend shapes (lo que el backend nuevo devuelve) ────────────────

interface BackendOption {
  id: string;
  event_id: string;
  order_index: number;
  label: string;
  image_url: string | null;
  created_at: string;
}

interface BackendEvent {
  id: string;
  tournament_id: string;
  order_index: number;
  question: string;
  image_url: string | null;
  predict_deadline_at: string;
  correct_option_id: string | null;
  resolved_at: string | null;
  options: BackendOption[];
}

interface BackendPrizeEntry {
  position: number;
  reward_type: 'coins' | 'xp' | 'manual';
  reward_config: Record<string, unknown>;
}

interface BackendTournament {
  id: string;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  entry_cost_type: 'free' | 'coins' | 'xp';
  entry_cost_amount: number;
  entry_cost_currency_id: string | null;
  prize_distribution: BackendPrizeEntry[];
  status: 'draft' | 'open' | 'in_progress' | 'closed' | 'archived';
  entry_deadline: string | null;
  starts_at: string | null;
  ends_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  events?: BackendEvent[];
}

// ─── Adapters ──────────────────────────────────────────────────────────

const STATUS_MAP: Record<BackendTournament['status'], PredictionPoolStatus> = {
  draft: 'draft',
  open: 'open',
  in_progress: 'resolving',
  closed: 'resolved',
  archived: 'cancelled',
};

function adaptOption(o: BackendOption): { id: string; text: string; display_order: number; image_url?: string } {
  return {
    id: o.id,
    text: o.label,
    display_order: o.order_index,
    image_url: o.image_url ?? undefined,
  };
}

function adaptEvent(e: BackendEvent): PoolMatch {
  return {
    id: e.id,
    pool_id: e.tournament_id,
    display_order: e.order_index,
    name: e.question,
    description: undefined,
    image_url: e.image_url ?? undefined,
    prediction_type: 'multiple_choice',
    options: e.options.map(adaptOption),
    winning_option_id: e.correct_option_id,
    resolved_at: e.resolved_at,
    predict_deadline_at: e.predict_deadline_at,
  };
}

function adaptPrizesToTopPositions(prizes: BackendPrizeEntry[]): TopPositionReward[] {
  return prizes.map((p) => ({
    id: `pos-${p.position}`,
    label: `Top ${p.position}`,
    position_from: p.position,
    position_to: p.position,
    reward: {
      reward_type: p.reward_type === 'coins' ? 'coins' : p.reward_type === 'xp' ? 'coins' : 'manual',
      reward_config: p.reward_config,
      currency_mode: 'manual_per_currency',
    },
  }));
}

function adaptTournamentToPool(t: BackendTournament): PredictionPool {
  const events = t.events ?? [];
  const resolvesAt = events.reduce<string | null>((latest, e) => {
    if (!latest) return e.predict_deadline_at;
    return e.predict_deadline_at > latest ? e.predict_deadline_at : latest;
  }, null);
  const opensAt = t.starts_at ?? t.created_at;
  const closesAt = t.entry_deadline ?? resolvesAt ?? t.ends_at ?? t.created_at;

  return {
    id: t.id,
    code: t.code,
    name: t.name,
    description: t.description,
    image_url: t.image_url,
    category: 'general',
    status: STATUS_MAP[t.status],
    opens_at: opensAt,
    closes_at: closesAt,
    resolves_at: resolvesAt ?? closesAt,
    participation_cost: {
      type: t.entry_cost_type === 'free' ? 'free' : 'paid',
      cost_in_coins: t.entry_cost_type === 'coins' ? t.entry_cost_amount : null,
    },
    reward_structure_type: 'top_positions',
    reward_config: {
      type: 'top_positions',
      positions: adaptPrizesToTopPositions(t.prize_distribution),
    },
    max_predictions_per_player: 1,
    target_audience: 'all',
    audience_config: {},
    restrictions: { min_level: null, vip_only: false, new_players_only: false },
    is_visible_to_players: t.status !== 'draft' && t.status !== 'archived',
    events: events.map(adaptEvent),
    total_events_count: events.length,
    total_entries_count: 0, // backend MVP no expone count
    created_at: t.created_at,
    updated_at: t.updated_at,
  };
}

function poolPayloadToTournamentBody(payload: PredictionPoolPayload): Record<string, unknown> {
  // Backend solo soporta prize_distribution = lista de (position, reward).
  // El BO tiene 4 reward_structure_type — convertimos cada una a position-based:
  //   top_positions       → 1 prize por cada posición en el rango
  //   all_correct_only    → 1 prize en posición 1 (el jackpot)
  //   by_hits_tiers       → 1 prize por tier, posiciones 1..N secuenciales
  //   every_correct_gives → 1 prize en posición 1 (operador entiende como genérico)
  // Sprint #7: enriquecer el backend para soportar tiered/jackpot reales.
  let prize_distribution: BackendPrizeEntry[] = [];
  const cfg = payload.reward_config;
  const mapReward = (
    position: number,
    rewardType: string,
    rewardConfig: unknown,
  ): BackendPrizeEntry => ({
    position,
    reward_type:
      rewardType === 'coins' ? 'coins' : rewardType === 'manual' ? 'manual' : 'manual',
    reward_config: rewardConfig as Record<string, unknown>,
  });
  if (cfg.type === 'top_positions') {
    prize_distribution = cfg.positions.flatMap((pos) => {
      const out: BackendPrizeEntry[] = [];
      for (let p = pos.position_from; p <= pos.position_to; p++) {
        out.push(mapReward(p, pos.reward.reward_type, pos.reward.reward_config));
      }
      return out;
    });
  } else if (cfg.type === 'all_correct_only') {
    prize_distribution = [mapReward(1, cfg.reward.reward_type, cfg.reward.reward_config)];
  } else if (cfg.type === 'by_hits_tiers') {
    prize_distribution = cfg.tiers.map((t, i) =>
      mapReward(i + 1, t.reward.reward_type, t.reward.reward_config),
    );
  } else if (cfg.type === 'every_correct_gives') {
    const r = (cfg as { reward?: { reward_type: string; reward_config: unknown } }).reward;
    if (r) prize_distribution = [mapReward(1, r.reward_type, r.reward_config)];
  }

  return {
    code: payload.code,
    name: payload.name,
    description: payload.description,
    image_url: payload.image_url ?? null,
    entry_cost_type: payload.participation_cost.type === 'free' ? 'free' : 'coins',
    entry_cost_amount: payload.participation_cost.cost_in_coins ?? 0,
    // entry_cost_currency_id: hay que enviarlo si type=coins. MVP sin currency
    // picker en el form → mandar el primero del tenant. Backend valida.
    // Por ahora null y backend va a fallar → operator-vista TODO.
    entry_cost_currency_id: null,
    prize_distribution,
    entry_deadline: payload.closes_at,
    starts_at: payload.opens_at,
    ends_at: payload.resolves_at,
  };
}

function eventsPayloadToBackend(payload: PredictionPoolPayload): Array<Record<string, unknown>> {
  // Cada evento toma su deadline del closes_at del pool (MVP simple).
  return payload.events.map((e, i) => ({
    order_index: e.display_order ?? i,
    question: e.name,
    image_url: e.image_url ?? null,
    predict_deadline_at: payload.closes_at,
    options: e.options.map((o, j) => ({
      order_index: o.display_order ?? j,
      label: o.text,
      image_url: o.image_url ?? null,
    })),
  }));
}

// ─── React Query hooks ────────────────────────────────────────────────

function filtersToParams(filters: PredictionPoolFilters): string {
  const sp = new URLSearchParams();
  if (filters.status && filters.status !== 'all') {
    // Mapear shape BO → backend status si corresponde.
    const backendStatus = Object.entries(STATUS_MAP).find(([, v]) => v === filters.status)?.[0];
    if (backendStatus) sp.set('status', backendStatus);
  }
  if (filters.search) sp.set('search', filters.search);
  const q = sp.toString();
  return q ? `?${q}` : '';
}

export function usePredictionPoolsList(filters: PredictionPoolFilters = {}) {
  return useQuery({
    queryKey: ['prediction-pools', filters],
    queryFn: () =>
      apiClient
        .get(`/admin/predictions${filtersToParams(filters)}`)
        .then((r) => unwrapDataList<BackendTournament>(r.data, ['pools', 'tournaments']))
        .then((arr) => arr.map(adaptTournamentToPool)),
  });
}

export function usePredictionPool(idOrCode: string | null) {
  return useQuery({
    queryKey: ['prediction-pool', idOrCode],
    enabled: Boolean(idOrCode),
    queryFn: () =>
      apiClient
        .get(`/admin/predictions/${idOrCode}`)
        .then((r) => unwrapData<BackendTournament>(r.data))
        .then(adaptTournamentToPool),
  });
}

export function usePredictionPoolStats() {
  return useQuery({
    queryKey: ['prediction-pools-stats'],
    // MVP: stats no implementado en backend, devolvemos shape vacío.
    queryFn: async (): Promise<PredictionPoolStats> => ({
      total_pools: 0,
      active_pools: 0,
      resolved_pools: 0,
      top_categories: [],
      avg_entries_per_pool: 0,
      hits_distribution: [],
    }),
  });
}

export function usePredictionPoolEntries(_poolId: string | null) {
  // MVP: backend tiene entries pero no expone admin endpoint todavía. Stub.
  return useQuery({
    queryKey: ['prediction-pool-entries', _poolId],
    enabled: Boolean(_poolId),
    queryFn: async (): Promise<PlayerPredictionEntry[]> => [],
  });
}

export function usePredictionPoolLeaderboard(poolId: string | null) {
  return useQuery({
    queryKey: ['prediction-pool-leaderboard', poolId],
    enabled: Boolean(poolId),
    // MVP: backend solo expone leaderboard en /player/predictions. Stub vacío
    // hasta Sprint #6 (admin leaderboard endpoint).
    queryFn: async (): Promise<PoolLeaderboardRow[]> => [],
  });
}

export function usePredictionPoolCategories() {
  return useQuery({
    queryKey: ['prediction-pools-categories'],
    // Hardcoded MVP. Sprint #6 podemos persistirlas en operators.
    queryFn: async () => ['Deportes', 'Trivia', 'Casino', 'General'] as string[],
  });
}

export function usePredictionTypes() {
  return useQuery({
    queryKey: ['prediction-pools-types'],
    queryFn: async () => ['multiple_choice'] as string[],
  });
}

export function useResolvePoolPreview(
  _poolId: string | null,
  _results: ResolvePoolPayload['results'],
) {
  // MVP: backend resuelve evento por evento sin preview. Stub.
  return useQuery({
    queryKey: ['prediction-pool-resolve-preview', _poolId],
    enabled: false,
    queryFn: async (): Promise<ResolvePoolPreview> => ({
      all_correct_count: 0,
      by_hits: [],
      total_prizes_summary: '',
    }),
  });
}

export function useSavePredictionPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: PredictionPoolPayload & { id?: string }) => {
      const body = poolPayloadToTournamentBody(payload);
      if (id) {
        // PATCH al existente (NO toca events — esos van por endpoints separados).
        const updated = await apiClient
          .patch(`/admin/predictions/${id}`, body)
          .then((r) => unwrapData<BackendTournament>(r.data));
        return adaptTournamentToPool(updated);
      } else {
        // Create torneo sin eventos primero.
        const created = await apiClient
          .post('/admin/predictions', body)
          .then((r) => unwrapData<BackendTournament>(r.data));
        // Después agregar eventos uno por uno.
        const events = eventsPayloadToBackend(payload);
        for (const event of events) {
          await apiClient.post(`/admin/predictions/${created.code}/events`, event);
        }
        // Refetch para tener events embedded.
        const full = await apiClient
          .get(`/admin/predictions/${created.code}`)
          .then((r) => unwrapData<BackendTournament>(r.data));
        return adaptTournamentToPool(full);
      }
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['prediction-pools'] });
      void qc.invalidateQueries({ queryKey: ['prediction-pools-stats'] });
    },
  });
}

export function useOpenPredictionPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idOrCode: string) =>
      apiClient
        .post(`/admin/predictions/${idOrCode}/publish`)
        .then((r) => unwrapData<BackendTournament>(r.data))
        .then(adaptTournamentToPool),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['prediction-pools'] }),
  });
}

export function useClosePredictionPool() {
  const qc = useQueryClient();
  // MVP: backend no tiene "close" separado del archive. El cierre real ocurre
  // automático al resolver el último evento. Acá hacemos archive.
  return useMutation({
    mutationFn: (idOrCode: string) =>
      apiClient
        .post(`/admin/predictions/${idOrCode}/archive`)
        .then((r) => unwrapData<BackendTournament>(r.data))
        .then(adaptTournamentToPool),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['prediction-pools'] }),
  });
}

export function useResolvePredictionPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id: _id, results }: ResolvePoolPayload & { id: string }) => {
      for (const r of results) {
        await apiClient.post(`/admin/predictions/events/${r.event_id}/resolve`, {
          correct_option_id: r.winning_option_id,
        });
      }
      return null as unknown as PredictionPool;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['prediction-pools'] });
      void qc.invalidateQueries({ queryKey: ['prediction-pools-stats'] });
      void qc.invalidateQueries({ queryKey: ['prediction-events-catalog'] });
    },
  });
}

export interface ResolvePredictionEventResult {
  event: BackendEvent;
  tournament_closed: boolean;
  winners_count?: number;
}

export function usePredictionEventsCatalog() {
  const listQ = usePredictionPoolsList({ status: 'all' });
  return useQuery({
    queryKey: ['prediction-events-catalog', listQ.dataUpdatedAt],
    enabled: Boolean(listQ.data?.length),
    queryFn: async () => {
      const pools = (listQ.data ?? []).filter((p) => p.status !== 'draft' && p.status !== 'cancelled');
      const details = await Promise.all(
        pools.map((p) =>
          apiClient
            .get(`/admin/predictions/${p.code ?? p.id}`)
            .then((r) => unwrapData<BackendTournament>(r.data))
            .then(adaptTournamentToPool),
        ),
      );
      return details;
    },
  });
}

export function useResolvePredictionEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, correctOptionId }: { eventId: string; correctOptionId: string }) =>
      apiClient
        .post(`/admin/predictions/events/${eventId}/resolve`, { correct_option_id: correctOptionId })
        .then((r) => unwrapData<ResolvePredictionEventResult>(r.data)),
    onSuccess: (data) => {
      toast.success('Resultado cargado. Premios calculados.');
      if (data.tournament_closed) {
        const count = data.winners_count;
        toast.success(
          count != null && Number.isFinite(count)
            ? `Torneo cerrado. ${count} jugadores reciben premios.`
            : 'Torneo cerrado. Los jugadores reciben premios.',
        );
      }
      void qc.invalidateQueries({ queryKey: ['prediction-pools'] });
      void qc.invalidateQueries({ queryKey: ['prediction-pools-stats'] });
      void qc.invalidateQueries({ queryKey: ['prediction-events-catalog'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo cargar el resultado'));
    },
  });
}

export function useCancelPredictionPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (idOrCode: string) =>
      apiClient
        .post(`/admin/predictions/${idOrCode}/archive`)
        .then((r) => unwrapData<BackendTournament>(r.data))
        .then(adaptTournamentToPool),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['prediction-pools'] });
      toast.success('Prode archivado');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo archivar el prode'));
    },
  });
}

/** Alias semántico — el backend expone POST …/archive, no "cancel". */
export const useArchivePredictionPool = useCancelPredictionPool;
