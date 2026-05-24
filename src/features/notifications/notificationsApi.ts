import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData, unwrapPaginatedList } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  ChannelPatchPayload,
  ChannelType,
  ManualSendPayload,
  NotificationChannel,
  NotificationHistoryItem,
  NotificationStats,
  NotificationTemplate,
  NotificationTemplatePayload,
  TemplatePreviewPayload,
  TemplatePreviewResult,
} from '@/types/notifications';

export function useNotificationChannels() {
  return useQuery({
    queryKey: ['notification-channels'],
    queryFn: () =>
      apiClient.get('/admin/notifications/channels').then((r) => unwrapData<NotificationChannel[]>(r.data)),
  });
}

export function useUpdateNotificationChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ type, payload }: { type: ChannelType; payload: ChannelPatchPayload }) =>
      apiClient
        .patch(`/admin/notifications/channels/${type}`, payload)
        .then((r) => unwrapData<NotificationChannel>(r.data)),
    onSuccess: () => {
      toast.success('Canal actualizado');
      qc.invalidateQueries({ queryKey: ['notification-channels'] });
    },
  });
}

export function useTestNotificationChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: ChannelType) =>
      apiClient.post(`/admin/notifications/channels/${type}/test`).then((r) => unwrapData<{ ok: boolean }>(r.data)),
    onSuccess: () => {
      toast.success('Test enviado');
      qc.invalidateQueries({ queryKey: ['notification-channels'] });
    },
  });
}

export function useNotificationTemplates(params?: {
  trigger_event?: string;
  channel?: string;
  status?: 'active' | 'archived';
  search?: string;
}) {
  return useQuery({
    queryKey: ['notification-templates', params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.trigger_event) sp.set('trigger_event', params.trigger_event);
      if (params?.channel) sp.set('channel', params.channel);
      if (params?.status) sp.set('status', params.status);
      if (params?.search) sp.set('search', params.search);
      const q = sp.toString();
      const res = await apiClient.get(`/admin/notifications/templates${q ? `?${q}` : ''}`);
      return unwrapData<NotificationTemplate[]>(res.data);
    },
  });
}

export function useNotificationTemplate(id: string | null) {
  return useQuery({
    queryKey: ['notification-template', id],
    enabled: !!id,
    queryFn: () =>
      apiClient.get(`/admin/notifications/templates/${id}`).then((r) => unwrapData<NotificationTemplate>(r.data)),
  });
}

export function useCreateNotificationTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: NotificationTemplatePayload) =>
      apiClient.post('/admin/notifications/templates', payload).then((r) => unwrapData<NotificationTemplate>(r.data)),
    onSuccess: () => {
      toast.success('Template creado');
      qc.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
}

export function useUpdateNotificationTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: NotificationTemplatePayload & { id: string }) =>
      apiClient
        .patch(`/admin/notifications/templates/${id}`, payload)
        .then((r) => unwrapData<NotificationTemplate>(r.data)),
    onSuccess: () => {
      toast.success('Template guardado');
      qc.invalidateQueries({ queryKey: ['notification-templates'] });
      qc.invalidateQueries({ queryKey: ['notification-template'] });
    },
  });
}

export function useArchiveNotificationTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/notifications/templates/${id}`),
    onSuccess: () => {
      toast.success('Template archivado');
      qc.invalidateQueries({ queryKey: ['notification-templates'] });
    },
  });
}

export function usePreviewNotificationTemplate() {
  return useMutation({
    mutationFn: ({ id, ...payload }: TemplatePreviewPayload & { id: string }) =>
      apiClient
        .post(`/admin/notifications/templates/${id}/preview`, payload)
        .then((r) => unwrapData<TemplatePreviewResult>(r.data)),
  });
}

export function useNotificationHistory(params?: {
  player_id?: string;
  template_code?: string;
  delivery_status?: string;
  channel_type?: string;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ['notification-history', params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params?.player_id) sp.set('player_id', params.player_id);
      if (params?.template_code) sp.set('template_code', params.template_code);
      if (params?.delivery_status) sp.set('delivery_status', params.delivery_status);
      if (params?.channel_type) sp.set('channel_type', params.channel_type);
      if (params?.from) sp.set('from', params.from);
      if (params?.to) sp.set('to', params.to);
      const res = await apiClient.get(`/admin/notifications/history?${sp.toString()}`);
      // Backend devuelve { items, total, limit, offset } (paginated).
      // unwrapPaginatedList lo maneja y devolvemos solo items[].
      return unwrapPaginatedList<NotificationHistoryItem>(res.data).items;
    },
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: ['notification-stats'],
    queryFn: () =>
      apiClient.get('/admin/notifications/stats').then((r) => unwrapData<NotificationStats>(r.data)),
  });
}

export function useSendManualNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ManualSendPayload) =>
      apiClient.post('/admin/notifications/send-manual', payload).then((r) => unwrapData<{ ok: boolean }>(r.data)),
    onSuccess: () => {
      toast.success('Notificación enviada');
      qc.invalidateQueries({ queryKey: ['notification-history'] });
      qc.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });
}
