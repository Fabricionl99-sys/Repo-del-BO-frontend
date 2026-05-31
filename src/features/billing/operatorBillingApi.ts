import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { mapActiveModule } from '@/features/billing/modulesApi';
import { useOperatorStore } from '@/stores/operatorStore';
import type { OperatorConfigApiResponse } from '@/types/operatorConfig';

export type OperatorConfigResponse = OperatorConfigApiResponse;

export function useOperatorBillingBootstrap() {
  const setBillingSnapshot = useOperatorStore((s) => s.setBillingSnapshot);
  const setActiveModules = useOperatorStore((s) => s.setActiveModules);

  return useQuery({
    queryKey: ['operator-billing'],
    queryFn: async () => {
      const [config, activeModules] = await Promise.all([
        apiClient.get('/admin/operator-config').then((r) => unwrapData<OperatorConfigResponse>(r.data)),
        apiClient.get('/admin/modules/active').then((r) => {
          const rows = unwrapData<unknown[]>(r.data);
          return (Array.isArray(rows) ? rows : []).map((row) =>
            mapActiveModule(row as Parameters<typeof mapActiveModule>[0]),
          );
        }),
      ]);

      setBillingSnapshot({
        billing_mode: config.billing_mode,
        wallet_balance_usd: config.wallet_balance_usd,
        wallet_low_balance_threshold_usd: config.wallet_low_balance_threshold_usd,
        status: config.status,
      });
      // BUG FIX (Operator-Ready): el backend de /v1/admin/modules/active
      // devuelve `module_code` (snake_case full), no `code`. Mapear a `.code`
      // producía [undefined,...] → Sidebar marcaba todos los módulos como
      // inactivos → click en cualquier link redirigía a /modulos (UX rota
      // donde todas las páginas mostraban la misma).
      const codes = activeModules.filter((m) => !m.deactivated_at).map((m) => m.code);
      setActiveModules(codes);

      return { config, activeModules };
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
