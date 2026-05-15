import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { RewardEndpoint, RewardEndpointPingResult, RewardEndpointSecretReveal } from '@/types/rewardEndpoints';

export function useRewardEndpoints() {
  return useQuery({
    queryKey: ['reward-endpoints'],
    queryFn: () => apiClient.get('/admin/reward-endpoints').then((r) => r.data as RewardEndpoint[]),
  });
}

export function useRewardEndpoint(rewardTypeId: number | null) {
  return useQuery({
    queryKey: ['reward-endpoints', rewardTypeId],
    enabled: rewardTypeId !== null,
    queryFn: () => apiClient.get(`/admin/reward-endpoints/${rewardTypeId}`).then((r) => r.data as RewardEndpoint),
  });
}

export function useCreateRewardEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { reward_type_code: string; url: string }) =>
      apiClient.post('/admin/reward-endpoints', body).then((r) => r.data as RewardEndpointSecretReveal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reward-endpoints'] });
    },
  });
}

export function usePatchRewardEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rewardTypeId, body }: { rewardTypeId: number; body: Partial<RewardEndpoint> }) =>
      apiClient.patch(`/admin/reward-endpoints/${rewardTypeId}`, body).then((r) => r.data as RewardEndpoint),
    onSuccess: () => {
      toast.success('Webhook actualizado');
      qc.invalidateQueries({ queryKey: ['reward-endpoints'] });
    },
  });
}

export function usePingRewardEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardTypeId: number) =>
      apiClient.post(`/admin/reward-endpoints/${rewardTypeId}/ping`).then((r) => r.data as RewardEndpointPingResult),
    onSuccess: (_, rewardTypeId) => {
      qc.invalidateQueries({ queryKey: ['reward-endpoints'] });
      qc.invalidateQueries({ queryKey: ['reward-endpoints', rewardTypeId] });
    },
  });
}

export function useRegenerateRewardEndpointSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardTypeId: number) =>
      apiClient.post(`/admin/reward-endpoints/${rewardTypeId}/regenerate-secret`).then((r) => r.data as RewardEndpointSecretReveal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reward-endpoints'] });
    },
  });
}

export function useDeleteRewardEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardTypeId: number) => apiClient.delete(`/admin/reward-endpoints/${rewardTypeId}`),
    onSuccess: () => {
      toast.success('Webhook eliminado');
      qc.invalidateQueries({ queryKey: ['reward-endpoints'] });
    },
  });
}
