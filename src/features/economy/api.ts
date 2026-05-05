import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import type { EconomyConfig } from './types';

export const useEconomyConfig = () =>
  useQuery({ queryKey: ['economy-config'], queryFn: () => apiClient.get('/admin/economy-config').then((r) => r.data as EconomyConfig) });

export const useSaveEconomyConfig = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<EconomyConfig>) => apiClient.patch('/admin/economy-config', payload).then((r) => r.data as EconomyConfig),
    onSuccess: (data) => {
      qc.setQueryData(['economy-config'], data);
      qc.invalidateQueries({ queryKey: ['economy-config'] });
    },
  });
};
