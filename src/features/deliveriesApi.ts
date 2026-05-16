import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { DeliveriesListResponse, MarkManualBody, PendingDelivery } from '@/types/deliveries';

export function useDeliveries(params: {
  status?: string[];
  reward_type?: string;
  date_from?: string;
  date_to?: string;
  player_id?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['deliveries', params],
    queryFn: () => {
      const sp = new URLSearchParams();
      if (params.limit != null) sp.set('limit', String(params.limit));
      if (params.offset != null) sp.set('offset', String(params.offset));
      if (params.reward_type) sp.set('reward_type', params.reward_type);
      if (params.date_from) sp.set('date_from', params.date_from);
      if (params.date_to) sp.set('date_to', params.date_to);
      if (params.player_id) sp.set('player_id', params.player_id);
      for (const s of params.status ?? []) sp.append('status', s);
      const qs = sp.toString();
      return apiClient.get(qs ? `/admin/deliveries?${qs}` : '/admin/deliveries').then((r) => r.data as DeliveriesListResponse);
    },
  });
}

export function usePendingDeliveriesTray() {
  return useQuery({
    queryKey: ['deliveries', 'pending-tray'],
    queryFn: () => apiClient.get('/admin/pending-deliveries').then((r) => r.data as { items: PendingDelivery[]; total: number }),
  });
}

export function useDelivery(id: string | null) {
  return useQuery({
    queryKey: ['deliveries', id],
    enabled: Boolean(id),
    queryFn: () => apiClient.get(`/admin/deliveries/${id}`).then((r) => r.data as PendingDelivery),
  });
}

export function useRetryDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/deliveries/${id}/retry`).then((r) => r.data as PendingDelivery),
    onSuccess: () => {
      toast.success('Reintento encolado');
      qc.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
}

export function useMarkDeliveryManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: MarkManualBody }) =>
      apiClient.post(`/admin/deliveries/${id}/mark-manual`, body).then((r) => r.data as PendingDelivery),
    onSuccess: () => {
      toast.success('Marcado como entregado manualmente');
      qc.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });
}
