import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { Coin, CoinsConfig, CoinsGlobalRules } from '@/types/coins';

/**
 * Sprint #6 fix — backend usa `/admin/currencies` (no `/admin/coins`).
 * Plus: backend usa PUT para edit (no PATCH). No tiene endpoint
 * global-rules ni coins-config — stubs hardcoded.
 */

export function useCoins() {
  return useQuery({
    queryKey: ['coins'],
    queryFn: () => apiClient.get('/admin/currencies').then((r) => unwrapData<Coin[]>(r.data)),
  });
}

export function useCoinsGlobalRules() {
  // Backend MVP no tiene este endpoint. Stub con defaults.
  return useQuery({
    queryKey: ['coins', 'global-rules'],
    queryFn: async (): Promise<CoinsGlobalRules> => ({} as CoinsGlobalRules),
  });
}

export function useCoinsConfig() {
  // Backend MVP no tiene este endpoint. Stub con defaults.
  return useQuery({
    queryKey: ['coins-config'],
    queryFn: async (): Promise<CoinsConfig> => ({} as CoinsConfig),
  });
}

export function useSaveCoinsConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CoinsConfig) => {
      // Stub: backend MVP no persiste config global de coins.
      toast.success('Configuración global no soportada — Sprint #7');
      return payload;
    },
    onSuccess: (data) => {
      qc.setQueryData(['coins-config'], data);
    },
  });
}

export function useSaveCoin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Coin>) =>
      payload.id
        ? apiClient
            .put(`/admin/currencies/${payload.id}`, payload)
            .then((r) => unwrapData<Coin>(r.data))
        : apiClient
            .post('/admin/currencies', payload)
            .then((r) => unwrapData<Coin>(r.data)),
    onSuccess: () => {
      toast.success('moneda guardada');
      qc.invalidateQueries({ queryKey: ['coins'] });
    },
  });
}

export function useDeleteCoin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Backend NO tiene DELETE de currencies (solo soft-delete via PUT
      // is_active=false). Hacemos eso.
      return apiClient.put(`/admin/currencies/${id}`, { is_active: false });
    },
    onSuccess: () => {
      toast.success('moneda desactivada');
      qc.invalidateQueries({ queryKey: ['coins'] });
    },
  });
}

export function useSaveGlobalRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CoinsGlobalRules) => {
      toast.warning('Reglas globales no soportadas — Sprint #7');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coins', 'global-rules'] });
    },
  });
}

export function useUploadCoinImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      // Backend usa /admin/upload-image genérico (no /admin/coins/upload-image).
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await apiClient.post<{ url: string }>('/admin/upload-image', fd);
      return data.url;
    },
  });
}
