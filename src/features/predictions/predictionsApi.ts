import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  PlayerPrediction,
  PredictionEvent,
  PredictionEventPayload,
  PredictionFilters,
  PredictionStats,
  ResolvePredictionPayload,
} from '@/types/predictions';

function buildQuery(filters: PredictionFilters): string {
  const sp = new URLSearchParams();
  if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
  if (filters.category && filters.category !== 'all') sp.set('category', filters.category);
  if (filters.participation && filters.participation !== 'all') sp.set('participation', filters.participation);
  if (filters.search) sp.set('search', filters.search);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export function usePredictionsList(filters: PredictionFilters = {}) {
  return useQuery({
    queryKey: ['predictions', filters],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/predictions${buildQuery(filters)}`);
      return unwrapData<PredictionEvent[]>(res.data);
    },
  });
}

export function usePredictionItem(id: string | null) {
  return useQuery({
    queryKey: ['predictions', id],
    enabled: Boolean(id),
    queryFn: () => apiClient.get(`/admin/predictions/${id}`).then((r) => unwrapData<PredictionEvent>(r.data)),
  });
}

export function usePredictionStats() {
  return useQuery({
    queryKey: ['predictions-stats'],
    queryFn: () => apiClient.get('/admin/predictions/stats').then((r) => unwrapData<PredictionStats>(r.data)),
  });
}

export function usePredictionPlayers(eventId: string | null) {
  return useQuery({
    queryKey: ['predictions-players', eventId],
    enabled: Boolean(eventId),
    queryFn: () =>
      apiClient
        .get(`/admin/predictions/${eventId}/players`)
        .then((r) => unwrapData<PlayerPrediction[]>(r.data)),
  });
}

export function usePredictionCategories() {
  return useQuery({
    queryKey: ['predictions-categories'],
    queryFn: () =>
      apiClient.get('/admin/predictions/categories').then((r) => unwrapData<string[]>(r.data)),
  });
}

export function useSavePrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: PredictionEventPayload & { id?: string }) =>
      id
        ? apiClient.patch(`/admin/predictions/${id}`, payload).then((r) => unwrapData<PredictionEvent>(r.data))
        : apiClient.post('/admin/predictions', payload).then((r) => unwrapData<PredictionEvent>(r.data)),
    onSuccess: () => {
      toast.success('Evento guardado');
      qc.invalidateQueries({ queryKey: ['predictions'] });
      qc.invalidateQueries({ queryKey: ['predictions-stats'] });
      qc.invalidateQueries({ queryKey: ['predictions-categories'] });
    },
  });
}

export function useArchivePrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/predictions/${id}`),
    onSuccess: () => {
      toast.success('Evento archivado');
      qc.invalidateQueries({ queryKey: ['predictions'] });
      qc.invalidateQueries({ queryKey: ['predictions-stats'] });
    },
  });
}

export function useOpenPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/predictions/${id}/open`).then((r) => unwrapData<PredictionEvent>(r.data)),
    onSuccess: () => {
      toast.success('Predicciones abiertas');
      qc.invalidateQueries({ queryKey: ['predictions'] });
      qc.invalidateQueries({ queryKey: ['predictions-stats'] });
    },
  });
}

export function useClosePrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/predictions/${id}/close`).then((r) => unwrapData<PredictionEvent>(r.data)),
    onSuccess: () => {
      toast.success('Predicciones cerradas');
      qc.invalidateQueries({ queryKey: ['predictions'] });
      qc.invalidateQueries({ queryKey: ['predictions-stats'] });
    },
  });
}

export function useResolvePrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: ResolvePredictionPayload & { id: string }) =>
      apiClient
        .post(`/admin/predictions/${id}/resolve`, payload)
        .then((r) => unwrapData<PredictionEvent>(r.data)),
    onSuccess: () => {
      toast.success('Evento resuelto · premios en cola');
      qc.invalidateQueries({ queryKey: ['predictions'] });
      qc.invalidateQueries({ queryKey: ['predictions-stats'] });
      qc.invalidateQueries({ queryKey: ['predictions-players'] });
    },
  });
}

export function useCancelPrediction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/predictions/${id}/cancel`).then((r) => unwrapData<PredictionEvent>(r.data)),
    onSuccess: () => {
      toast.success('Evento cancelado');
      qc.invalidateQueries({ queryKey: ['predictions'] });
      qc.invalidateQueries({ queryKey: ['predictions-stats'] });
    },
  });
}
