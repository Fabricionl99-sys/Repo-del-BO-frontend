import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/apiErrorMessage';
import { toast } from '@/stores/toastStore';
import type {
  AntiFraudAlert,
  AntiFraudConfig,
  AntiFraudConfigPatch,
  AntiFraudCursorPage,
  AntiFraudReviewPayload,
  AntiFraudWhitelistEntry,
  AntiFraudWhitelistPayload,
} from '@/types/antiFraud';

const keys = {
  config: ['anti-fraud', 'config'] as const,
  whitelist: (cursor?: string | null) => ['anti-fraud', 'whitelist', cursor ?? 'start'] as const,
  alerts: (cursor?: string | null) => ['anti-fraud', 'alerts', cursor ?? 'start'] as const,
};

function listParams(cursor?: string | null, limit = 20) {
  const params: Record<string, string | number> = { limit };
  if (cursor) params.cursor = cursor;
  return params;
}

function unwrapCursorPage<T>(body: unknown): AntiFraudCursorPage<T> {
  const data = unwrapData<AntiFraudCursorPage<T>>(body);
  return {
    items: data?.items ?? [],
    next_cursor: data?.next_cursor ?? null,
  };
}

export function validateXpPerHourThreshold(value: number): string | null {
  if (!Number.isInteger(value) || value < 100 || value > 10_000_000) {
    return 'El umbral debe ser un entero entre 100 y 10.000.000';
  }
  return null;
}

function normalizeAntiFraudConfigPatch(payload: AntiFraudConfigPatch): AntiFraudConfigPatch {
  const normalized: AntiFraudConfigPatch = { ...payload };
  if (payload.xp_per_hour_threshold !== undefined) {
    normalized.xp_per_hour_threshold = Number(payload.xp_per_hour_threshold);
  }
  return normalized;
}

export function useAntiFraudConfig() {
  return useQuery({
    queryKey: keys.config,
    queryFn: async () => {
      const res = await apiClient.get('/admin/anti-fraud/config');
      return unwrapData<AntiFraudConfig>(res.data);
    },
  });
}

export function useUpdateAntiFraudConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AntiFraudConfigPatch) => {
      const body = normalizeAntiFraudConfigPatch(payload);
      const res = await apiClient.patch('/admin/anti-fraud/config', body);
      return unwrapData<AntiFraudConfig>(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys.config });
      toast.success('Configuración guardada');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo guardar la configuración')),
  });
}

export function fetchAntiFraudWhitelistPage(cursor?: string | null) {
  return apiClient
    .get('/admin/anti-fraud/whitelist', { params: listParams(cursor) })
    .then((r) => unwrapCursorPage<AntiFraudWhitelistEntry>(r.data));
}

export function useAntiFraudWhitelistPage(cursor?: string | null) {
  return useQuery({
    queryKey: keys.whitelist(cursor),
    queryFn: () => fetchAntiFraudWhitelistPage(cursor),
  });
}

export function useAddAntiFraudWhitelist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerStateId,
      payload,
    }: {
      playerStateId: string;
      payload: AntiFraudWhitelistPayload;
    }) => {
      const res = await apiClient.post(`/admin/anti-fraud/whitelist/${playerStateId}`, payload);
      return unwrapData<AntiFraudWhitelistEntry>(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['anti-fraud', 'whitelist'] });
      toast.success('Agregado a la lista blanca');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo agregar a la whitelist')),
  });
}

export function useRemoveAntiFraudWhitelist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (playerStateId: string) => {
      const res = await apiClient.delete(`/admin/anti-fraud/whitelist/${playerStateId}`);
      return unwrapData<{ removed: boolean }>(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['anti-fraud', 'whitelist'] });
      toast.success('Quitado de la lista blanca');
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo quitar de la whitelist')),
  });
}

export function fetchAntiFraudAlertsPage(cursor?: string | null) {
  return apiClient
    .get('/admin/anti-fraud/alerts', { params: listParams(cursor) })
    .then((r) => unwrapCursorPage<AntiFraudAlert>(r.data));
}

export function useAntiFraudAlertsPage(cursor?: string | null) {
  return useQuery({
    queryKey: keys.alerts(cursor),
    queryFn: () => fetchAntiFraudAlertsPage(cursor),
  });
}

export function useReviewAntiFraudAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ alertId, payload }: { alertId: string; payload: AntiFraudReviewPayload }) => {
      const res = await apiClient.post(`/admin/anti-fraud/alerts/${alertId}/review`, payload);
      return unwrapData(res.data);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['anti-fraud', 'alerts'] });
      toast.success('Alerta revisada');
    },
    onError: (err) => {
      const status = getApiErrorStatus(err);
      if (status === 409) {
        void qc.invalidateQueries({ queryKey: ['anti-fraud', 'alerts'] });
        toast.warning('Otra persona ya revisó esta alerta');
        return;
      }
      toast.error(getApiErrorMessage(err, 'No se pudo revisar la alerta'));
    },
  });
}
