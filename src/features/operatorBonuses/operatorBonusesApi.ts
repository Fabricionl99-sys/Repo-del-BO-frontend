import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { trackEvent } from '@/lib/analytics';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  BonusGrantHistoryEntry,
  BonusSyncHistoryEntry,
  GrantHistoryFilters,
  OperatorBonus,
  OperatorBonusApiConfig,
  OperatorBonusCatalogStats,
  OperatorBonusFilters,
  OperatorBonusPayload,
  SyncNowResponse,
  TestConnectionResponse,
  ValidateBonusIdResponse,
} from '@/types/operatorBonuses';

function buildBonusQuery(filters: OperatorBonusFilters): string {
  const sp = new URLSearchParams();
  if (filters.bonus_type && filters.bonus_type !== 'all') sp.set('bonus_type', filters.bonus_type);
  if (filters.type && filters.type !== 'all') sp.set('type', filters.type);
  if (filters.source && filters.source !== 'all') sp.set('source', filters.source);
  if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
  if (filters.search) sp.set('search', filters.search);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

function buildGrantQuery(filters: GrantHistoryFilters): string {
  const sp = new URLSearchParams();
  if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
  if (filters.bonus_id && filters.bonus_id !== 'all') sp.set('bonus_id', filters.bonus_id);
  if (filters.source_module && filters.source_module !== 'all') {
    sp.set('source_module', filters.source_module);
  }
  if (filters.player_search) sp.set('player_search', filters.player_search);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export function useOperatorBonuses(filters: OperatorBonusFilters = {}) {
  return useQuery({
    queryKey: ['operator-bonuses', filters],
    queryFn: () =>
      apiClient
        .get(`/admin/operator-bonuses${buildBonusQuery(filters)}`)
        .then((r) => unwrapData<OperatorBonus[]>(r.data)),
  });
}

export function useOperatorBonus(id: string | null) {
  return useQuery({
    queryKey: ['operator-bonus', id],
    enabled: Boolean(id),
    queryFn: () =>
      apiClient.get(`/admin/operator-bonuses/${id}`).then((r) => unwrapData<OperatorBonus>(r.data)),
  });
}

export function useOperatorBonusStats() {
  return useQuery({
    queryKey: ['operator-bonus-stats'],
    queryFn: () =>
      apiClient
        .get('/admin/operator-bonuses/stats')
        .then((r) => unwrapData<OperatorBonusCatalogStats>(r.data)),
  });
}

export function useOperatorBonusApiConfig() {
  return useQuery({
    queryKey: ['operator-bonus-api-config'],
    queryFn: () =>
      apiClient
        .get('/admin/operator-bonuses/api-config')
        .then((r) => unwrapData<OperatorBonusApiConfig>(r.data)),
  });
}

export function useBonusSyncHistory() {
  return useQuery({
    queryKey: ['operator-bonus-sync-history'],
    queryFn: () =>
      apiClient
        .get('/admin/operator-bonuses/sync-history')
        .then((r) => unwrapData<BonusSyncHistoryEntry[]>(r.data)),
  });
}

export function useBonusGrantHistory(filters: GrantHistoryFilters = {}) {
  return useQuery({
    queryKey: ['operator-bonus-grant-history', filters],
    queryFn: () =>
      apiClient
        .get(`/admin/operator-bonuses/grant-history${buildGrantQuery(filters)}`)
        .then((r) => unwrapData<BonusGrantHistoryEntry[]>(r.data)),
  });
}

export function useSaveOperatorBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: OperatorBonusPayload & { id?: string }) =>
      id
        ? apiClient
            .patch(`/admin/operator-bonuses/${id}`, payload)
            .then((r) => unwrapData<OperatorBonus>(r.data))
        : apiClient
            .post('/admin/operator-bonuses', payload)
            .then((r) => unwrapData<OperatorBonus>(r.data)),
    onSuccess: () => {
      toast.success('Bono guardado');
      qc.invalidateQueries({ queryKey: ['operator-bonuses'] });
      qc.invalidateQueries({ queryKey: ['operator-bonus-stats'] });
    },
  });
}

export function useArchiveOperatorBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/operator-bonuses/${id}`),
    onSuccess: () => {
      toast.success('Bono archivado');
      qc.invalidateQueries({ queryKey: ['operator-bonuses'] });
      qc.invalidateQueries({ queryKey: ['operator-bonus-stats'] });
    },
  });
}

export function useUpdateBonusApiConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<OperatorBonusApiConfig>) =>
      apiClient
        .patch('/admin/operator-bonuses/api-config', payload)
        .then((r) => unwrapData<OperatorBonusApiConfig>(r.data)),
    onSuccess: () => {
      toast.success('Configuración API guardada');
      qc.invalidateQueries({ queryKey: ['operator-bonus-api-config'] });
    },
  });
}

export function useTestBonusConnection() {
  return useMutation({
    mutationFn: () =>
      apiClient
        .post('/admin/operator-bonuses/test-connection')
        .then((r) => unwrapData<TestConnectionResponse>(r.data)),
  });
}

export function useSyncBonusesNow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient
        .post('/admin/operator-bonuses/sync-now')
        .then((r) => unwrapData<SyncNowResponse>(r.data)),
    onSuccess: (data) => {
      trackEvent('bonus_synced', { added: data.added, updated: data.updated });
      toast.success(`Sync: +${data.added} / ~${data.updated} / -${data.deprecated}`);
      qc.invalidateQueries({ queryKey: ['operator-bonuses'] });
      qc.invalidateQueries({ queryKey: ['operator-bonus-stats'] });
      qc.invalidateQueries({ queryKey: ['operator-bonus-sync-history'] });
      qc.invalidateQueries({ queryKey: ['operator-bonus-api-config'] });
    },
  });
}

export function useValidateBonusId() {
  return useMutation({
    mutationFn: (external_id: string) =>
      apiClient
        .post('/admin/operator-bonuses/validate-id', { external_id })
        .then((r) => unwrapData<ValidateBonusIdResponse>(r.data)),
  });
}

export function useVerifyOperatorBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post(`/admin/operator-bonuses/${id}/verify`)
        .then((r) => unwrapData<OperatorBonus>(r.data)),
    onSuccess: () => {
      toast.success('Bono verificado');
      qc.invalidateQueries({ queryKey: ['operator-bonuses'] });
      qc.invalidateQueries({ queryKey: ['operator-bonus-stats'] });
    },
  });
}

export function useReactivateOperatorBonus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post(`/admin/operator-bonuses/${id}/reactivate`)
        .then((r) => unwrapData<OperatorBonus>(r.data)),
    onSuccess: () => {
      toast.success('Bono reactivado');
      qc.invalidateQueries({ queryKey: ['operator-bonuses'] });
      qc.invalidateQueries({ queryKey: ['operator-bonus-stats'] });
    },
  });
}

export function useRetryBonusGrant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post(`/admin/operator-bonuses/grant-history/${id}/retry`)
        .then((r) => unwrapData<BonusGrantHistoryEntry>(r.data)),
    onSuccess: () => {
      toast.success('Reintento encolado');
      qc.invalidateQueries({ queryKey: ['operator-bonus-grant-history'] });
    },
  });
}

export function useUploadBonusImage() {
  return useMutation({
    mutationFn: () =>
      apiClient.post('/admin/operator-bonuses/upload-image').then(
        (r) => r.data as { uploadUrl: string; finalUrl: string },
      ),
  });
}
