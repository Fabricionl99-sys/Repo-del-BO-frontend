import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import type {
  PlayerPredictionEntry,
  PoolLeaderboardRow,
  PredictionPool,
  PredictionPoolFilters,
  PredictionPoolPayload,
  PredictionPoolStats,
  ResolvePoolPayload,
  ResolvePoolPreview,
} from '@/types/predictions';

function filtersToParams(filters: PredictionPoolFilters): string {
  const sp = new URLSearchParams();
  if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
  if (filters.category && filters.category !== 'all') sp.set('category', filters.category);
  if (filters.participation && filters.participation !== 'all') sp.set('participation', filters.participation);
  if (filters.search) sp.set('search', filters.search);
  const q = sp.toString();
  return q ? `?${q}` : '';
}

export function usePredictionPoolsList(filters: PredictionPoolFilters = {}) {
  return useQuery({
    queryKey: ['prediction-pools', filters],
    queryFn: () =>
      apiClient
        .get(`/admin/prediction-pools${filtersToParams(filters)}`)
        .then((r) => unwrapData<PredictionPool[]>(r.data)),
  });
}

export function usePredictionPool(id: string | null) {
  return useQuery({
    queryKey: ['prediction-pool', id],
    enabled: Boolean(id),
    queryFn: () =>
      apiClient.get(`/admin/prediction-pools/${id}`).then((r) => unwrapData<PredictionPool>(r.data)),
  });
}

export function usePredictionPoolStats() {
  return useQuery({
    queryKey: ['prediction-pools-stats'],
    queryFn: () =>
      apiClient.get('/admin/prediction-pools/stats').then((r) => unwrapData<PredictionPoolStats>(r.data)),
  });
}

export function usePredictionPoolEntries(poolId: string | null) {
  return useQuery({
    queryKey: ['prediction-pool-entries', poolId],
    enabled: Boolean(poolId),
    queryFn: () =>
      apiClient
        .get(`/admin/prediction-pools/${poolId}/entries`)
        .then((r) => unwrapData<PlayerPredictionEntry[]>(r.data)),
  });
}

export function usePredictionPoolLeaderboard(poolId: string | null) {
  return useQuery({
    queryKey: ['prediction-pool-leaderboard', poolId],
    enabled: Boolean(poolId),
    queryFn: () =>
      apiClient
        .get(`/admin/prediction-pools/${poolId}/leaderboard`)
        .then((r) => unwrapData<PoolLeaderboardRow[]>(r.data)),
  });
}

export function usePredictionPoolCategories() {
  return useQuery({
    queryKey: ['prediction-pools-categories'],
    queryFn: () =>
      apiClient.get('/admin/prediction-pools/categories').then((r) => unwrapData<string[]>(r.data)),
  });
}

export function usePredictionTypes() {
  return useQuery({
    queryKey: ['prediction-pools-types'],
    queryFn: () =>
      apiClient
        .get('/admin/prediction-pools/prediction-types')
        .then((r) => unwrapData<string[]>(r.data)),
  });
}

export function useResolvePoolPreview(poolId: string | null, results: ResolvePoolPayload['results']) {
  return useQuery({
    queryKey: ['prediction-pool-resolve-preview', poolId, results],
    enabled: Boolean(poolId) && results.length > 0,
    queryFn: () =>
      apiClient
        .post(`/admin/prediction-pools/${poolId}/resolve-preview`, { results })
        .then((r) => unwrapData<ResolvePoolPreview>(r.data)),
  });
}

export function useSavePredictionPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: PredictionPoolPayload & { id?: string }) =>
      id
        ? apiClient.patch(`/admin/prediction-pools/${id}`, payload).then((r) => unwrapData<PredictionPool>(r.data))
        : apiClient.post('/admin/prediction-pools', payload).then((r) => unwrapData<PredictionPool>(r.data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['prediction-pools'] });
      void qc.invalidateQueries({ queryKey: ['prediction-pools-stats'] });
    },
  });
}

export function useOpenPredictionPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/prediction-pools/${id}/open`).then((r) => unwrapData<PredictionPool>(r.data)),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['prediction-pools'] }),
  });
}

export function useClosePredictionPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/prediction-pools/${id}/close`).then((r) => unwrapData<PredictionPool>(r.data)),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['prediction-pools'] }),
  });
}

export function useResolvePredictionPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: ResolvePoolPayload & { id: string }) =>
      apiClient
        .post(`/admin/prediction-pools/${id}/resolve`, payload)
        .then((r) => unwrapData<PredictionPool>(r.data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['prediction-pools'] });
      void qc.invalidateQueries({ queryKey: ['prediction-pools-stats'] });
    },
  });
}

export function useCancelPredictionPool() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/prediction-pools/${id}/cancel`).then((r) => unwrapData<PredictionPool>(r.data)),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['prediction-pools'] }),
  });
}
