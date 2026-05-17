import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  CreateWebhookEndpointResult,
  RewardEndpoint,
  RotateWebhookSecretResult,
  WebhookDelivery,
  WebhookEndpointPayload,
  WebhookPingResult,
  WebhookStatsDetail,
} from '@/types/webhooks';

export interface DeliveriesFilters {
  reward_endpoint_id?: string;
  status?: string;
  event_type?: string;
  q?: string;
}

export function useRewardEndpoints() {
  return useQuery({
    queryKey: ['webhooks', 'endpoints'],
    queryFn: () => apiClient.get('/admin/reward-endpoints').then((r) => unwrapData<RewardEndpoint[]>(r.data)),
  });
}

export function useWebhookDeliveries(filters: DeliveriesFilters) {
  return useQuery({
    queryKey: ['webhooks', 'deliveries', filters],
    queryFn: () =>
      apiClient
        .get('/admin/webhook-deliveries', { params: filters })
        .then((r) => unwrapData<WebhookDelivery[]>(r.data)),
  });
}

export function useEndpointStats(endpointId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['webhooks', 'stats', endpointId],
    enabled: Boolean(endpointId) && enabled,
    queryFn: () =>
      apiClient
        .get(`/admin/reward-endpoints/${endpointId}/stats`)
        .then((r) => unwrapData<WebhookStatsDetail>(r.data)),
  });
}

export function useCreateRewardEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WebhookEndpointPayload) =>
      apiClient.post('/admin/reward-endpoints', payload).then((r) => unwrapData<CreateWebhookEndpointResult>(r.data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Endpoint creado');
    },
    onError: () => toast.error('No se pudo crear el endpoint'),
  });
}

export function usePatchRewardEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<WebhookEndpointPayload> }) =>
      apiClient.patch(`/admin/reward-endpoints/${id}`, payload).then((r) => unwrapData<RewardEndpoint>(r.data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Endpoint actualizado');
    },
    onError: () => toast.error('No se pudo actualizar'),
  });
}

export function useArchiveRewardEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/reward-endpoints/${id}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Endpoint archivado');
    },
    onError: () => toast.error('No se pudo archivar'),
  });
}

export function useRotateWebhookSecret() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post(`/admin/reward-endpoints/${id}/rotate-secret`)
        .then((r) => unwrapData<RotateWebhookSecretResult>(r.data)),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['webhooks'] }),
    onError: () => toast.error('No se pudo rotar el secret'),
  });
}

export function useTestWebhookEndpoint() {
  return useMutation({
    mutationFn: ({ id, event_type }: { id: string; event_type?: string }) =>
      apiClient
        .post(`/admin/reward-endpoints/${id}/test`, { event_type })
        .then((r) => unwrapData<WebhookPingResult>(r.data)),
  });
}

export function useRetryWebhookDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post(`/admin/deliveries/${id}/retry`, { reason }).then((r) => unwrapData<WebhookDelivery>(r.data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Reintento programado');
    },
    onError: () => toast.error('No se pudo reintentar'),
  });
}

export function useCancelWebhookDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post(`/admin/deliveries/${id}/cancel`, { reason }).then((r) => unwrapData<WebhookDelivery>(r.data)),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Entrega cancelada');
    },
    onError: () => toast.error('No se pudo cancelar'),
  });
}
