import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { Coin, CoinsConfig, CoinsGlobalRules } from '@/types/coins';

export function useCoins() {
  return useQuery({
    queryKey: ['coins'],
    queryFn: () => apiClient.get('/admin/coins').then((r) => r.data as Coin[]),
  });
}

export function useCoinsGlobalRules() {
  return useQuery({
    queryKey: ['coins', 'global-rules'],
    queryFn: () => apiClient.get('/admin/coins/global-rules').then((r) => r.data as CoinsGlobalRules),
  });
}

export function useCoinsConfig() {
  return useQuery({
    queryKey: ['coins-config'],
    queryFn: () => apiClient.get('/admin/coins-config').then((r) => r.data as CoinsConfig),
  });
}

export function useSaveCoinsConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CoinsConfig) =>
      apiClient.patch('/admin/coins-config', payload).then((r) => r.data as CoinsConfig),
    onSuccess: (data) => {
      toast.success('configuración de monedas guardada');
      qc.setQueryData(['coins-config'], data);
      qc.invalidateQueries({ queryKey: ['coins-config'] });
    },
  });
}

export function useSaveCoin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Coin>) =>
      payload.id
        ? apiClient.patch(`/admin/coins/${payload.id}`, payload).then((r) => r.data as Coin)
        : apiClient.post('/admin/coins', payload).then((r) => r.data as Coin),
    onSuccess: () => {
      toast.success('moneda guardada');
      qc.invalidateQueries({ queryKey: ['coins'] });
    },
  });
}

export function useDeleteCoin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/coins/${id}`),
    onSuccess: () => {
      toast.success('moneda eliminada');
      qc.invalidateQueries({ queryKey: ['coins'] });
    },
  });
}

export function useSaveGlobalRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CoinsGlobalRules) =>
      apiClient.patch('/admin/coins/global-rules', payload).then((r) => r.data as CoinsGlobalRules),
    onSuccess: () => {
      toast.success('reglas globales guardadas');
      qc.invalidateQueries({ queryKey: ['coins', 'global-rules'] });
    },
  });
}

export function useUploadCoinImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await apiClient.post<{ url: string }>('/admin/coins/upload-image', fd);
      return data.url;
    },
  });
}
