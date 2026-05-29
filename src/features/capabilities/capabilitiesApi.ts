import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  CapabilityAuditEntry,
  CapabilityBulkUpdatePayload,
  CapabilityDimension,
  CapabilityPatchPayload,
  DetectNowResult,
  OperatorCapabilitiesSnapshot,
  OperatorCapability,
  UnsupportedConfig,
} from '@/types/capabilities';

export const CAPABILITIES_QUERY_KEY = ['operator-capabilities'] as const;

function normalizeCapabilitiesSnapshot(data: unknown): OperatorCapabilitiesSnapshot {
  if (Array.isArray(data)) {
    return { capabilities: data, last_detection_at: null };
  }
  const snap = data as OperatorCapabilitiesSnapshot | null | undefined;
  return {
    capabilities: snap?.capabilities ?? [],
    last_detection_at: snap?.last_detection_at ?? null,
  };
}

function normalizeDetectNowResult(data: unknown): DetectNowResult {
  const raw = (data ?? {}) as Partial<DetectNowResult>;
  return {
    summary: raw.summary ?? 'Detección completada',
    new_bonus_types: raw.new_bonus_types ?? [],
    new_events: raw.new_events ?? [],
    new_products: raw.new_products ?? [],
    last_detection_at: raw.last_detection_at ?? new Date().toISOString(),
  };
}

export function useCapabilities() {
  return useQuery({
    queryKey: CAPABILITIES_QUERY_KEY,
    queryFn: () =>
      apiClient
        .get('/admin/capabilities')
        .then((r) => normalizeCapabilitiesSnapshot(unwrapData<unknown>(r.data))),
  });
}

export function useCapabilityAuditLog(limit = 50) {
  return useQuery({
    queryKey: ['operator-capabilities', 'audit-log', limit],
    queryFn: () =>
      apiClient
        .get(`/admin/capabilities/audit-log?limit=${limit}`)
        .then((r) => unwrapData<CapabilityAuditEntry[]>(r.data)),
  });
}

export function useUnsupportedConfigs() {
  return useQuery({
    queryKey: ['operator-capabilities', 'unsupported'],
    queryFn: () =>
      apiClient
        .get('/admin/capabilities/unsupported-configs')
        .then((r) => unwrapData<UnsupportedConfig[]>(r.data)),
  });
}

export function usePatchCapability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      dimension,
      capability,
      ...payload
    }: CapabilityPatchPayload & { dimension: CapabilityDimension; capability: string }) =>
      apiClient
        .patch(`/admin/capabilities/${dimension}/${capability}`, payload)
        .then((r) => unwrapData<OperatorCapability>(r.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAPABILITIES_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['operator-capabilities', 'audit-log'] });
    },
  });
}

export function useBulkUpdateCapabilities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CapabilityBulkUpdatePayload) =>
      apiClient
        .post('/admin/capabilities/bulk-update', payload)
        .then((r) => unwrapData<{ updated: OperatorCapability[] }>(r.data)),
    onSuccess: (data) => {
      toast.success(`${data.updated.length} capabilities actualizadas`);
      qc.invalidateQueries({ queryKey: CAPABILITIES_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['operator-capabilities', 'audit-log'] });
    },
  });
}

export function useDetectCapabilitiesNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient
        .post('/admin/capabilities/detect-now')
        .then((r) => normalizeDetectNowResult(unwrapData<unknown>(r.data))),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CAPABILITIES_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ['operator-capabilities', 'audit-log'] });
      qc.invalidateQueries({ queryKey: ['operator-capabilities', 'unsupported'] });
    },
  });
}
