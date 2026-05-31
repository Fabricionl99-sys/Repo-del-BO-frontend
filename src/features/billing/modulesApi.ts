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

/** Raw row from module lifecycle endpoints (activate / deactivate / force-stop). */
type BackendActiveModule = {
  code?: string;
  module_code?: string;
  module_name?: string;
  activated_at: string;
  next_renewal_at?: string | null;
  last_cycle_amount_usd?: string | number | null;
  deactivation_pending_cycle_end?: boolean;
  deactivated_at?: string | null;
  pending_deactivation?: boolean;
  pending_deactivation_at?: string | null;
  operator_price_usd_monthly?: number;
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

export function mapActiveModule(raw: BackendActiveModule): OperatorActiveModulePublic {
  const code = (raw.module_code ?? raw.code) as ModuleCode;
  const deactivationPending =
    raw.deactivation_pending_cycle_end ?? raw.pending_deactivation ?? false;
  const nextRenewalAt = raw.next_renewal_at ?? raw.pending_deactivation_at ?? null;
  const lastCycleRaw = raw.last_cycle_amount_usd;

  return {
    code,
    module_name: raw.module_name,
    activated_at: raw.activated_at,
    next_renewal_at: nextRenewalAt,
    last_cycle_amount_usd:
      lastCycleRaw != null && lastCycleRaw !== '' ? Number(lastCycleRaw) : null,
    deactivation_pending_cycle_end: deactivationPending,
    deactivated_at: raw.deactivated_at ?? null,
    operator_price_usd_monthly: Number(raw.operator_price_usd_monthly ?? 0),
  };
}

function mapCatalogResponse(body: unknown): ModulePublic[] {
  const rows = unwrapData<BackendCatalogModule[]>(body);
  return (Array.isArray(rows) ? rows : []).map(mapCatalogModule);
}

function mapActiveModulesResponse(body: unknown): OperatorActiveModulePublic[] {
  const rows = unwrapData<BackendActiveModule[]>(body);
  return (Array.isArray(rows) ? rows : []).map(mapActiveModule);
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
      apiClient.get('/admin/modules/active').then((r) => mapActiveModulesResponse(r.data)),
    staleTime: 60_000,
  });
}

export function useActivateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: ModuleCode) =>
      apiClient
        .post(`/admin/modules/${code}/activate`)
        .then((r) => mapActiveModule(unwrapData<BackendActiveModule>(r.data))),
    onSuccess: (_data, code) => {
      trackModuleActivated(code);
      qc.invalidateQueries({ queryKey: ['active-modules'] });
      qc.invalidateQueries({ queryKey: ['module-catalog'] });
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
      qc.invalidateQueries({ queryKey: ['operator-billing'] });
    },
  });
}

export function useDeactivateModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: ModuleCode) =>
      apiClient
        .post(`/admin/modules/${code}/deactivate`)
        .then((r) => mapActiveModule(unwrapData<BackendActiveModule>(r.data))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['active-modules'] });
      qc.invalidateQueries({ queryKey: ['module-catalog'] });
      qc.invalidateQueries({ queryKey: ['operator-billing'] });
    },
  });
}

export function useForceStopModule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: ModuleCode) =>
      apiClient
        .post(`/admin/modules/${code}/force-stop`)
        .then((r) => mapActiveModule(unwrapData<BackendActiveModule>(r.data))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['active-modules'] });
      qc.invalidateQueries({ queryKey: ['module-catalog'] });
      qc.invalidateQueries({ queryKey: ['operator-billing'] });
    },
  });
}
