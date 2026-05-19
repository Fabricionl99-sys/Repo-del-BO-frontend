import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { env } from '@/config/env';
import type { InternalMetrics } from '@/types/internalMetrics';
import { useAuthStore } from '@/stores/authStore';

export function canViewInternalMetrics(userId: string | undefined): boolean {
  if (!userId) return false;
  const allow = env.internalMetricsUserIds;
  if (allow.length === 0) return false;
  return allow.includes(userId);
}

export function useInternalMetrics() {
  const userId = useAuthStore((s) => s.user?.id);
  const enabled = canViewInternalMetrics(userId);

  return useQuery({
    queryKey: ['internal-metrics'],
    enabled,
    queryFn: () =>
      apiClient.get('/admin/internal-metrics').then((r) => unwrapData<InternalMetrics>(r.data)),
    staleTime: 60_000,
  });
}
