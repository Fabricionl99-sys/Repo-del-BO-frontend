import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData, unwrapPaginatedList } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  LoginPopupHistoryFilters,
  LoginPopupHistoryItem,
  LoginPopupManualHistoryItem,
  LoginPopupManualSendPayload,
  LoginPopupStats,
  LoginPopupTemplate,
  LoginPopupTemplateFilters,
  LoginPopupTemplatePayload,
} from '@/types/loginPopups';

function filtersToParams(filters: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v && v !== 'all') sp.set(k, v);
  }
  const q = sp.toString();
  return q ? `?${q}` : '';
}

export function useLoginPopupTemplates(filters: LoginPopupTemplateFilters = {}) {
  return useQuery({
    queryKey: ['login-popup-templates', filters],
    queryFn: () =>
      apiClient
        .get(
          `/admin/login-popups/templates${filtersToParams({
            trigger: filters.trigger,
            priority: filters.priority,
            status: filters.status,
            search: filters.search,
          })}`,
        )
        .then((r) => unwrapData<LoginPopupTemplate[]>(r.data)),
  });
}

export function useLoginPopupTemplate(id: string | null) {
  return useQuery({
    queryKey: ['login-popup-template', id],
    enabled: Boolean(id),
    queryFn: () =>
      apiClient.get(`/admin/login-popups/templates/${id}`).then((r) => unwrapData<LoginPopupTemplate>(r.data)),
  });
}

export function useLoginPopupStats() {
  return useQuery({
    queryKey: ['login-popup-stats'],
    queryFn: () =>
      apiClient.get('/admin/login-popups/stats').then((r) => unwrapData<LoginPopupStats>(r.data)),
  });
}

export function useLoginPopupHistory(filters: LoginPopupHistoryFilters = {}) {
  return useQuery({
    queryKey: ['login-popup-history', filters],
    queryFn: () =>
      apiClient
        .get(
          `/admin/login-popups/history${filtersToParams({
            template_id: filters.template_id,
            status: filters.status,
            player_id: filters.player_id,
            search: filters.search,
          })}`,
        )
        // Backend devuelve { items, total, limit, offset }. Devolvemos items[].
        .then((r) => unwrapPaginatedList<LoginPopupHistoryItem>(r.data).items),
  });
}

export function useLoginPopupManualHistory() {
  return useQuery({
    queryKey: ['login-popup-manual-history'],
    queryFn: () =>
      apiClient
        .get('/admin/login-popups/history?manual_only=1')
        // Backend devuelve { items, total, limit, offset }. Devolvemos items[].
        .then((r) => unwrapPaginatedList<LoginPopupManualHistoryItem>(r.data).items),
  });
}

export function useSaveLoginPopupTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: LoginPopupTemplatePayload & { id?: string }) =>
      id
        ? apiClient
            .patch(`/admin/login-popups/templates/${id}`, payload)
            .then((r) => unwrapData<LoginPopupTemplate>(r.data))
        : apiClient
            .post('/admin/login-popups/templates', payload)
            .then((r) => unwrapData<LoginPopupTemplate>(r.data)),
    onSuccess: () => {
      toast.success('Popup guardado');
      void qc.invalidateQueries({ queryKey: ['login-popup-templates'] });
      void qc.invalidateQueries({ queryKey: ['login-popup-stats'] });
    },
  });
}

export function useArchiveLoginPopupTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/login-popups/templates/${id}`),
    onSuccess: () => {
      toast.success('Template archivado');
      void qc.invalidateQueries({ queryKey: ['login-popup-templates'] });
    },
  });
}

export function useToggleLoginPopupTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      apiClient
        .patch(`/admin/login-popups/templates/${id}`, { is_active })
        .then((r) => unwrapData<LoginPopupTemplate>(r.data)),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['login-popup-templates'] }),
  });
}

export function useSendManualLoginPopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPopupManualSendPayload) =>
      apiClient.post('/admin/login-popups/send-manual', payload).then((r) => unwrapData<{ ok: boolean }>(r.data)),
    onSuccess: () => {
      toast.success('Mensaje programado para el próximo login');
      void qc.invalidateQueries({ queryKey: ['login-popup-manual-history'] });
      void qc.invalidateQueries({ queryKey: ['login-popup-history'] });
    },
  });
}
