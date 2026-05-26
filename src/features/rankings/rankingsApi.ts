import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { getApiErrorMessage } from '@/api/errors';
import { unwrapData } from '@/api/response';
import { normalizeRankingConfig, normalizeRankingConfigs } from '@/features/rankings/rankingShape';
import { toast } from '@/stores/toastStore';
import type {
  LeaderboardResponse,
  RankingConfig,
  RankingCreatePayload,
  RankingMetadataPayload,
  RankingPrize,
  RankingPrizePayload,
  RankingsFilters,
} from '@/types/rankings';

/**
 * Sprint #6 fix — adapter para ranking prizes.
 * Backend `reward_config` es discriminated union por `.kind`. BO manda
 * `reward_type` separado y reward_config sin kind. Inyectamos.
 * Backend además hace cross-check: reward_config.kind === reward_type.
 */
const VALID_RANKING_KINDS = new Set([
  'coins',
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'chest',
  'avatar_pack',
  'manual',
]);

function adaptRankingPrizeForBackend(p: RankingPrizePayload | Omit<RankingPrize, 'id'>): Record<string, unknown> {
  const rawType = String((p as { reward_type?: string }).reward_type ?? 'manual');
  const rawCfg = ((p as { reward_config?: unknown }).reward_config ?? {}) as Record<string, unknown>;
  let kind: string;
  let cfg: Record<string, unknown>;
  if (rawType === 'xp') {
    const amount = Number(rawCfg.amount ?? 0);
    kind = 'manual';
    cfg = { kind: 'manual', description: `${amount} XP bonus`, value_usd: 0 };
  } else if (VALID_RANKING_KINDS.has(rawType)) {
    kind = rawType;
    cfg = { ...rawCfg, kind: rawType };
    if (kind === 'coins') {
      if (typeof cfg.amount !== 'number' || (cfg.amount as number) <= 0) cfg.amount = 1;
      if (!cfg.currency_code) cfg.currency_code = 'main';
    }
    if (kind === 'manual') {
      if (typeof cfg.description !== 'string' || !(cfg.description as string).trim()) {
        cfg.description = 'Premio manual';
      }
      if (typeof cfg.value_usd !== 'number') cfg.value_usd = 0;
    }
    if (kind === 'chest' && !cfg.chest_type_code) cfg.chest_type_code = 'default_chest';
    if (kind === 'avatar_pack' && !cfg.avatar_slugs) {
      cfg.avatar_slugs = Array.isArray(cfg.avatar_ids) ? cfg.avatar_ids : ['default'];
    }
    // freespin/freebet/cashback/bonus_deposit requieren bonus_id (S18) o
    // todos los campos legacy. Si vienen vacíos, dejamos cfg pelado y el
    // backend devolverá error específico — el operador tiene que elegir
    // un bonus válido en el BO.
  } else {
    kind = 'manual';
    cfg = {
      kind: 'manual',
      description: `Premio posición ${(p as { position_from?: number }).position_from ?? 1}`,
      value_usd: 0,
    };
  }
  return {
    position_from: Number((p as { position_from?: number }).position_from ?? 1),
    position_to: Number((p as { position_to?: number }).position_to ?? 1),
    reward_type: kind,
    reward_config: cfg,
    is_active: (p as { is_active?: boolean }).is_active !== false,
    // Sub-etapa 16 — currency mode defaults.
    currency_mode: 'auto_usd',
    base_amount_usd: null,
    values_per_currency: {},
  };
}

function adaptRankingForBackend(payload: RankingCreatePayload): Record<string, unknown> {
  const body: Record<string, unknown> = { ...payload };
  if (Array.isArray(payload.prizes)) {
    body.prizes = payload.prizes.map((p) => adaptRankingPrizeForBackend(p));
  }
  // Drop campos que el backend no usa en upsert (vienen del row response).
  delete (body as Record<string, unknown>).period_resets_at;
  delete (body as Record<string, unknown>).is_active;
  // Backend exige period_reset_day para weekly (1-7) y monthly (1-31).
  // Si el BO no lo manda, ponemos defaults sensatos: lunes / día 1.
  const periodType = String(payload.period_type ?? '');
  const currentDay = (body as { period_reset_day?: number | null }).period_reset_day;
  if (periodType === 'weekly' && (currentDay == null || currentDay < 1 || currentDay > 7)) {
    body.period_reset_day = 1; // lunes ISO
  } else if (periodType === 'monthly' && (currentDay == null || currentDay < 1 || currentDay > 31)) {
    body.period_reset_day = 1; // día 1 del mes
  } else if (periodType === 'daily' || periodType === 'all_time') {
    body.period_reset_day = null;
  }
  if ((body as { period_reset_hour?: number | null }).period_reset_hour == null) {
    body.period_reset_hour = 0;
  }
  if (!(body as { timezone?: string }).timezone) {
    body.timezone = 'UTC';
  }
  return body;
}

export function useRankings(filters: RankingsFilters = {}) {
  return useQuery({
    queryKey: ['rankings', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
      if (filters.period_type) sp.set('period_type', filters.period_type);
      if (filters.metric_type) sp.set('metric_type', filters.metric_type);
      if (filters.search) sp.set('search', filters.search);
      const qs = sp.toString();
      const res = await apiClient.get(`/admin/rankings${qs ? `?${qs}` : ''}`);
      return normalizeRankingConfigs(unwrapData<RankingConfig[]>(res.data));
    },
  });
}

export function useRanking(code: string | null) {
  return useQuery({
    queryKey: ['rankings', code],
    enabled: Boolean(code),
    queryFn: () =>
      apiClient
        .get(`/admin/rankings/${code}`)
        .then((r) => normalizeRankingConfig(unwrapData<RankingConfig>(r.data))),
  });
}

export function useCreateRanking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RankingCreatePayload) =>
      apiClient
        .post('/admin/rankings', adaptRankingForBackend(payload))
        .then((r) => unwrapData<RankingConfig>(r.data)),
    onSuccess: () => {
      toast.success('Ranking creado');
      qc.invalidateQueries({ queryKey: ['rankings'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo crear el ranking'));
    },
  });
}

export function useUpdateRanking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }: RankingMetadataPayload & { code: string }) => {
      // Para PATCH, droppeamos los campos que el backend rechaza/computa.
      const body = { ...payload } as Record<string, unknown>;
      delete body.period_resets_at;
      delete body.is_active;
      return apiClient
        .patch(`/admin/rankings/${code}`, body)
        .then((r) => unwrapData<RankingConfig>(r.data));
    },
    onSuccess: (_data, vars) => {
      toast.success('Ranking actualizado');
      qc.invalidateQueries({ queryKey: ['rankings'] });
      qc.invalidateQueries({ queryKey: ['rankings', vars.code] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el ranking'));
    },
  });
}

export function useArchiveRanking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => apiClient.delete(`/admin/rankings/${code}`),
    onSuccess: () => {
      toast.success('Ranking archivado');
      qc.invalidateQueries({ queryKey: ['rankings'] });
    },
  });
}

export function useAddRankingPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }: RankingPrizePayload & { code: string }) =>
      apiClient
        .post(`/admin/rankings/${code}/prizes`, adaptRankingPrizeForBackend(payload))
        .then((r) => unwrapData<RankingPrize>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Premio agregado');
      qc.invalidateQueries({ queryKey: ['rankings'] });
      qc.invalidateQueries({ queryKey: ['rankings', vars.code] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo agregar el premio'));
    },
  });
}

export function useUpdateRankingPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      code,
      prizeId,
      ...payload
    }: RankingPrizePayload & { code: string; prizeId: string }) =>
      apiClient
        .patch(`/admin/rankings/${code}/prizes/${prizeId}`, adaptRankingPrizeForBackend(payload))
        .then((r) => unwrapData<RankingPrize>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Premio actualizado');
      qc.invalidateQueries({ queryKey: ['rankings'] });
      qc.invalidateQueries({ queryKey: ['rankings', vars.code] });
    },
  });
}

export function useDeleteRankingPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, prizeId }: { code: string; prizeId: string }) =>
      apiClient.delete(`/admin/rankings/${code}/prizes/${prizeId}`),
    onSuccess: (_data, vars) => {
      toast.success('Premio eliminado');
      qc.invalidateQueries({ queryKey: ['rankings'] });
      qc.invalidateQueries({ queryKey: ['rankings', vars.code] });
    },
  });
}

export function useRankingLeaderboard(code: string | null) {
  return useQuery({
    queryKey: ['rankings', code, 'leaderboard'],
    enabled: Boolean(code),
    queryFn: () =>
      apiClient
        .get(`/admin/rankings/${code}/leaderboard`)
        .then((r) => unwrapData<LeaderboardResponse>(r.data)),
  });
}

export function useRecomputeRanking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      apiClient
        .post(`/admin/rankings/${code}/recompute`)
        .then((r) => unwrapData<LeaderboardResponse>(r.data)),
    onSuccess: (_data, code) => {
      toast.success('Leaderboard recalculado');
      qc.invalidateQueries({ queryKey: ['rankings'] });
      qc.invalidateQueries({ queryKey: ['rankings', code, 'leaderboard'] });
    },
  });
}
