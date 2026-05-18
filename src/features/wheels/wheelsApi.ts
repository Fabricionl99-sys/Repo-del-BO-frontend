import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData, unwrapPaginatedList } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  SpinHistoryEntry,
  SpinHistoryQuery,
  WheelArchivePayload,
  WheelCatalogResponse,
  WheelGrantManualPayload,
  WheelManualGrantHistoryItem,
  WheelPrize,
  WheelPrizePayload,
  WheelType,
  WheelTypeCreatePayload,
} from '@/types/wheels';

export interface WheelsFilters {
  status?: 'active' | 'archived' | 'all';
  search?: string;
}

export function useWheelsCatalog(filters: WheelsFilters = {}) {
  return useQuery({
    queryKey: ['wheels', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
      if (filters.search) sp.set('search', filters.search);
      const qs = sp.toString();
      const res = await apiClient.get(`/admin/wheels${qs ? `?${qs}` : ''}`);
      return unwrapData<WheelCatalogResponse>(res.data);
    },
  });
}

export function useWheel(code: string | null) {
  return useQuery({
    queryKey: ['wheels', code],
    enabled: Boolean(code),
    queryFn: () =>
      apiClient.get(`/admin/wheels/${code}`).then((r) => unwrapData<WheelType>(r.data)),
  });
}

export function useWheelOptions() {
  return useQuery({
    queryKey: ['wheels', 'options'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/wheels?status=active');
      const data = unwrapData<WheelCatalogResponse>(res.data);
      return data.items.map((w) => ({ code: w.code, name: w.name }));
    },
  });
}

export function useCreateWheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WheelTypeCreatePayload) =>
      apiClient.post('/admin/wheels', payload).then((r) => unwrapData<WheelType>(r.data)),
    onSuccess: () => {
      toast.success('Rueda creada');
      qc.invalidateQueries({ queryKey: ['wheels'] });
    },
  });
}

export function useUpdateWheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }: Partial<WheelTypeCreatePayload> & { code: string }) =>
      apiClient.patch(`/admin/wheels/${code}`, payload).then((r) => unwrapData<WheelType>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Rueda actualizada');
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheels', vars.code] });
    },
  });
}

export function useArchiveWheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }: WheelArchivePayload & { code: string }) =>
      apiClient.delete(`/admin/wheels/${code}`, { data: payload }),
    onSuccess: () => {
      toast.success('Rueda archivada');
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheels', 'spin-history'] });
    },
  });
}

export function useAddWheelPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }: WheelPrizePayload & { code: string }) =>
      apiClient
        .post(`/admin/wheels/${code}/prizes`, payload)
        .then((r) => unwrapData<WheelPrize>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Premio agregado');
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheels', vars.code] });
    },
  });
}

export function useUpdateWheelPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      code,
      prizeId,
      ...payload
    }: WheelPrizePayload & { code: string; prizeId: string }) =>
      apiClient
        .patch(`/admin/wheels/${code}/prizes/${prizeId}`, payload)
        .then((r) => unwrapData<WheelPrize>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Premio actualizado');
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheels', vars.code] });
    },
  });
}

export function useDeleteWheelPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, prizeId }: { code: string; prizeId: string }) =>
      apiClient.delete(`/admin/wheels/${code}/prizes/${prizeId}`),
    onSuccess: (_data, vars) => {
      toast.success('Premio eliminado');
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheels', vars.code] });
    },
  });
}

export function useSpinHistory(filters: SpinHistoryQuery = {}) {
  return useQuery({
    queryKey: ['wheels', 'spin-history', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.wheel_code) sp.set('wheel_code', filters.wheel_code);
      if (filters.delivery_status) sp.set('delivery_status', filters.delivery_status);
      if (filters.player_search) sp.set('player_search', filters.player_search);
      if (filters.from) sp.set('from', filters.from);
      if (filters.to) sp.set('to', filters.to);
      if (filters.limit != null) sp.set('limit', String(filters.limit));
      if (filters.offset != null) sp.set('offset', String(filters.offset));
      const res = await apiClient.get(`/admin/wheels/spin-history?${sp.toString()}`);
      return unwrapPaginatedList<SpinHistoryEntry>(res.data);
    },
  });
}

export function useManualGrantHistory(limit = 20) {
  return useQuery({
    queryKey: ['wheels', 'manual-grants', limit],
    queryFn: () =>
      apiClient
        .get(`/admin/wheels/inventory?limit=${limit}`)
        .then((r) => unwrapData<WheelManualGrantHistoryItem[]>(r.data)),
  });
}

export function useGrantWheelManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WheelGrantManualPayload) =>
      apiClient
        .post('/admin/wheels/grant-manual', payload)
        .then((r) => unwrapData<WheelManualGrantHistoryItem>(r.data)),
    onSuccess: () => {
      toast.success('Spins asignados');
      qc.invalidateQueries({ queryKey: ['wheels', 'manual-grants'] });
      qc.invalidateQueries({ queryKey: ['wheels'] });
    },
  });
}

export function useRetrySpinDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (spinId: string) =>
      apiClient
        .post(`/admin/wheels/spin-history/${spinId}/retry-delivery`)
        .then((r) => unwrapData<SpinHistoryEntry>(r.data)),
    onSuccess: () => {
      toast.success('Reintento de entrega iniciado');
      qc.invalidateQueries({ queryKey: ['wheels', 'spin-history'] });
    },
  });
}

export function usePlayerSearch(q: string) {
  return useQuery({
    queryKey: ['players', 'search', q],
    enabled: q.length >= 2,
    queryFn: () =>
      apiClient
        .get(`/admin/players/search?q=${encodeURIComponent(q)}`)
        .then((r) => unwrapData<{ player_id: string; player_handle: string }[]>(r.data)),
  });
}
