import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  SocialBannedProfile,
  SocialCursorPage,
  SocialModerationConfig,
  SocialReportPending,
  SocialReportReviewPayload,
} from '@/types/socialModeration';

const keys = {
  reports: (cursor?: string | null) => ['social-moderation', 'reports', cursor ?? 'start'] as const,
  config: ['social-moderation', 'config'] as const,
  banned: ['social-moderation', 'banned'] as const,
};

function withCursor(path: string, cursor?: string | null) {
  if (!cursor) return path;
  return `${path}?cursor=${encodeURIComponent(cursor)}`;
}

export function usePendingSocialReports(cursor?: string | null) {
  return useQuery({
    queryKey: keys.reports(cursor),
    queryFn: async () => {
      const res = await apiClient.get(withCursor('/admin/social/reports/pending', cursor));
      return unwrapData<SocialCursorPage<SocialReportPending>>(res.data);
    },
  });
}

export function useSocialModerationConfig() {
  return useQuery({
    queryKey: keys.config,
    queryFn: async () => {
      const res = await apiClient.get('/admin/social/config');
      return unwrapData<SocialModerationConfig>(res.data);
    },
  });
}

export function useUpdateSocialModerationConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<SocialModerationConfig>) => {
      const res = await apiClient.patch('/admin/social/config', payload);
      return unwrapData<SocialModerationConfig>(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.config });
      toast.success('Configuración guardada');
    },
    onError: () => toast.error('No se pudo guardar la configuración'),
  });
}

export function useReviewSocialReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, payload }: { reportId: string; payload: SocialReportReviewPayload }) => {
      const res = await apiClient.post(`/admin/social/reports/${reportId}/review`, payload);
      return unwrapData(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['social-moderation', 'reports'] });
      toast.success('Reporte revisado');
    },
    onError: () => toast.error('No se pudo revisar el reporte'),
  });
}

export function useBannedSocialProfiles() {
  return useQuery({
    queryKey: keys.banned,
    queryFn: async () => {
      const res = await apiClient.get('/admin/social/profiles/banned');
      return unwrapData<SocialBannedProfile[]>(res.data);
    },
  });
}

export function useUnbanSocialProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (playerStateId: string) => {
      const res = await apiClient.post(`/admin/social/profiles/${playerStateId}/unban`);
      return unwrapData(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.banned });
      toast.success('Perfil desbaneado');
    },
    onError: () => toast.error('No se pudo desbanear'),
  });
}
