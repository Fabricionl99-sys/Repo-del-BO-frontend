import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
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
      return unwrapData<RankingConfig[]>(res.data);
    },
  });
}

export function useRanking(code: string | null) {
  return useQuery({
    queryKey: ['rankings', code],
    enabled: Boolean(code),
    queryFn: () =>
      apiClient.get(`/admin/rankings/${code}`).then((r) => unwrapData<RankingConfig>(r.data)),
  });
}

export function useCreateRanking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RankingCreatePayload) =>
      apiClient.post('/admin/rankings', payload).then((r) => unwrapData<RankingConfig>(r.data)),
    onSuccess: () => {
      toast.success('Ranking creado');
      qc.invalidateQueries({ queryKey: ['rankings'] });
    },
  });
}

export function useUpdateRanking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }: RankingMetadataPayload & { code: string }) =>
      apiClient.patch(`/admin/rankings/${code}`, payload).then((r) => unwrapData<RankingConfig>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Ranking actualizado');
      qc.invalidateQueries({ queryKey: ['rankings'] });
      qc.invalidateQueries({ queryKey: ['rankings', vars.code] });
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
        .post(`/admin/rankings/${code}/prizes`, payload)
        .then((r) => unwrapData<RankingPrize>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Premio agregado');
      qc.invalidateQueries({ queryKey: ['rankings'] });
      qc.invalidateQueries({ queryKey: ['rankings', vars.code] });
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
        .patch(`/admin/rankings/${code}/prizes/${prizeId}`, payload)
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
