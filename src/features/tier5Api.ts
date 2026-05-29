import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { ModerationItem, ModerationStats } from '@/types/tier5';

export const useModerationQueue = (kind?: string) =>
  useQuery({
    queryKey: ['moderation', 'queue', kind],
    queryFn: () =>
      apiClient.get('/admin/moderation/queue', { params: { kind } }).then((r) => r.data as ModerationItem[]),
    refetchInterval: 30000,
  });

export const useModerationStats = () =>
  useQuery({
    queryKey: ['moderation', 'stats'],
    queryFn: () => apiClient.get('/admin/moderation/stats').then((r) => r.data as ModerationStats),
    refetchInterval: 30000,
  });

export function useModerationAction(action: 'approve' | 'reject' | 'warn') {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/moderation/queue/${id}/${action}`),
    onSuccess: () => {
      toast.success(`acción ${action} registrada`);
      qc.invalidateQueries({ queryKey: ['moderation'] });
    },
  });
}

export const useBanUser = () =>
  useMutation({
    mutationFn: (payload: { userId: string; duration: string; reason: string }) =>
      apiClient.post(`/admin/moderation/users/${payload.userId}/ban`, payload),
  });
