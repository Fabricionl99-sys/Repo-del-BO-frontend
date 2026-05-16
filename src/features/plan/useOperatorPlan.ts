import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { useOperatorStore } from '@/stores/operatorStore';

export interface OperatorPlanPayload {
  plan?: {
    code: string;
    name: string;
    modules_enabled: string[];
  };
}

export function useOperatorPlanBootstrap() {
  const setModules = useOperatorStore((s) => s.setModulesEnabled);

  return useQuery({
    queryKey: ['operator-plan'],
    queryFn: async () => {
      const raw = await apiClient.get('/admin/operator-config').then((r) => unwrapData<OperatorPlanPayload>(r.data));
      const modules = raw.plan?.modules_enabled ?? null;
      setModules(modules);
      return modules;
    },
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
