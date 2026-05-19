import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { trackModuleActivated } from '@/lib/analytics';
import { unwrapData } from '@/api/response';
import type { ModuleCode, ModulePublic, OperatorActiveModulePublic } from '@/types/billing';

export function useModuleCatalog() {
  return useQuery({
    queryKey: ['module-catalog'],
    queryFn: () => apiClient.get('/admin/modules/catalog').then((r) => unwrapData<ModulePublic[]>(r.data)),
    staleTime: 10 * 60_000,
  });
}

export function useActiveModules() {
  return useQuery({
    queryKey: ['active-modules'],
    queryFn: () =>
      apiClient.get('/admin/modules/active').then((r) => unwrapData<OperatorActiveModulePublic[]>(r.data)),
  });
}

export function useActivateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: ModuleCode) =>
      apiClient.post(`/admin/modules/${code}/activate`).then((r) => unwrapData<OperatorActiveModulePublic>(r.data)),
    onSuccess: (_data, code) => {
      trackModuleActivated(code);
      qc.invalidateQueries({ queryKey: ['active-modules'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
    },
  });
}

export function useDeactivateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: ModuleCode) =>
      apiClient.post(`/admin/modules/${code}/deactivate`).then((r) => unwrapData<OperatorActiveModulePublic>(r.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['active-modules'] });
    },
  });
}
