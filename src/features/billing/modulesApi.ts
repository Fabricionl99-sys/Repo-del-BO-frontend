import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { trackModuleActivated } from '@/lib/analytics';
import { unwrapData } from '@/api/response';
import { env } from '@/config/env';
import type { ModuleCode, ModulePublic, OperatorActiveModulePublic } from '@/types/billing';

/** Raw catalog row from GET /admin/modules/catalog (snake_case variants). */
type BackendCatalogModule = {
  code?: string;
  module_code?: string;
  name: string;
  description?: string | null;
  price_usd_monthly?: number;
  monthly_price_usd?: number;
  category?: string;
};

export function mapCatalogModule(raw: BackendCatalogModule): ModulePublic {
  const code = (raw.module_code ?? raw.code) as ModuleCode;
  return {
    code,
    name: raw.name,
    description: raw.description ?? '',
    price_usd_monthly: Number(raw.price_usd_monthly ?? raw.monthly_price_usd ?? 0),
    category: raw.category ?? 'core',
  };
}

function mapCatalogResponse(body: unknown): ModulePublic[] {
  const rows = unwrapData<BackendCatalogModule[]>(body);
  return (Array.isArray(rows) ? rows : []).map(mapCatalogModule);
}

const MODULE_CATALOG_QUERY_KEY = ['module-catalog', env.appVersion] as const;

export function useModuleCatalog() {
  return useQuery({
    queryKey: MODULE_CATALOG_QUERY_KEY,
    queryFn: () => apiClient.get('/admin/modules/catalog').then((r) => mapCatalogResponse(r.data)),
    staleTime: 60_000,
  });
}

export function useActiveModules() {
  return useQuery({
    queryKey: ['active-modules', env.appVersion],
    queryFn: () =>
      apiClient.get('/admin/modules/active').then((r) => unwrapData<OperatorActiveModulePublic[]>(r.data)),
    staleTime: 60_000,
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
      qc.invalidateQueries({ queryKey: ['module-catalog'] });
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
      qc.invalidateQueries({ queryKey: ['module-catalog'] });
      qc.invalidateQueries({ queryKey: ['operator-billing'] });
    },
  });
}
