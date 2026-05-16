import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { useOperatorStore } from '@/stores/operatorStore';
import type { OperatorActiveModulePublic, OperatorBillingSnapshot } from '@/types/billing';
import type { OperatorConfig } from '@/types/expandedTier5';

export type OperatorConfigResponse = OperatorConfig & OperatorBillingSnapshot;

export function useOperatorBillingBootstrap() {
  const setBillingSnapshot = useOperatorStore((s) => s.setBillingSnapshot);
  const setActiveModules = useOperatorStore((s) => s.setActiveModules);

  return useQuery({
    queryKey: ['operator-billing'],
    queryFn: async () => {
      const [config, activeModules] = await Promise.all([
        apiClient.get('/admin/operator-config').then((r) => unwrapData<OperatorConfigResponse>(r.data)),
        apiClient.get('/admin/modules/active').then((r) => unwrapData<OperatorActiveModulePublic[]>(r.data)),
      ]);

      setBillingSnapshot({
        billing_mode: config.billing_mode,
        wallet_balance_usd: config.wallet_balance_usd,
        wallet_low_balance_threshold_usd: config.wallet_low_balance_threshold_usd,
        status: config.status,
      });
      setActiveModules(activeModules.map((m) => m.code));

      return { config, activeModules };
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
