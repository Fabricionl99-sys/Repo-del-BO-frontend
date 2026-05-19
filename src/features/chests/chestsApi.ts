import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { trackEvent } from '@/lib/analytics';
import { unwrapData, unwrapPaginatedList } from '@/api/response';
import { normalizeChestType, normalizeChestTypes } from '@/features/chests/chestTypeShape';
import { toast } from '@/stores/toastStore';
import type {
  ChestGrantManualPayload,
  ChestInventoryQuery,
  ChestPrize,
  ChestPrizePayload,
  ChestType,
  ChestTypeCreatePayload,
  ChestTypeMetadataPayload,
  PlayerChestInventoryItem,
  PlayerSearchResult,
} from '@/types/chests';

export interface ChestTypesFilters {
  status?: 'active' | 'archived' | 'all';
  search?: string;
}

export function useChestTypes(filters: ChestTypesFilters = {}) {
  return useQuery({
    queryKey: ['chest-types', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
      if (filters.search) sp.set('search', filters.search);
      const qs = sp.toString();
      const res = await apiClient.get(`/admin/chests/types${qs ? `?${qs}` : ''}`);
      return normalizeChestTypes(unwrapData<ChestType[]>(res.data));
    },
  });
}

export function useChestType(code: string | null) {
  return useQuery({
    queryKey: ['chest-types', code],
    enabled: Boolean(code),
    queryFn: () =>
      apiClient
        .get(`/admin/chests/types/${code}`)
        .then((r) => normalizeChestType(unwrapData<ChestType>(r.data))),
  });
}

export function useCreateChestType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChestTypeCreatePayload) =>
      apiClient
        .post('/admin/chests/types', payload)
        .then((r) => normalizeChestType(unwrapData<ChestType>(r.data))),
    onSuccess: () => {
      trackEvent('chest_created');
      toast.success('Tipo de cofre creado');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

export function useUpdateChestType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }: ChestTypeMetadataPayload & { code: string }) =>
      apiClient
        .patch(`/admin/chests/types/${code}`, payload)
        .then((r) => normalizeChestType(unwrapData<ChestType>(r.data))),
    onSuccess: (_data, vars) => {
      toast.success('Tipo de cofre actualizado');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
      qc.invalidateQueries({ queryKey: ['chest-types', vars.code] });
    },
  });
}

export function useArchiveChestType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => apiClient.delete(`/admin/chests/types/${code}`),
    onSuccess: () => {
      toast.success('Tipo de cofre archivado');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

export function useAddChestPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }: ChestPrizePayload & { code: string }) =>
      apiClient
        .post(`/admin/chests/types/${code}/prizes`, payload)
        .then((r) => unwrapData<ChestPrize>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Premio agregado');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
      qc.invalidateQueries({ queryKey: ['chest-types', vars.code] });
    },
  });
}

export function useUpdateChestPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      code,
      prizeId,
      ...payload
    }: ChestPrizePayload & { code: string; prizeId: string }) =>
      apiClient
        .patch(`/admin/chests/types/${code}/prizes/${prizeId}`, payload)
        .then((r) => unwrapData<ChestPrize>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Premio actualizado');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
      qc.invalidateQueries({ queryKey: ['chest-types', vars.code] });
    },
  });
}

export function useDeleteChestPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, prizeId }: { code: string; prizeId: string }) =>
      apiClient.delete(`/admin/chests/types/${code}/prizes/${prizeId}`),
    onSuccess: (_data, vars) => {
      toast.success('Premio eliminado');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
      qc.invalidateQueries({ queryKey: ['chest-types', vars.code] });
    },
  });
}

export function useChestInventory(params: ChestInventoryQuery = {}) {
  return useQuery({
    queryKey: ['chest-inventory', params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params.chest_type_code) sp.set('chest_type_code', params.chest_type_code);
      if (params.player_id) sp.set('player_id', params.player_id);
      if (params.player_search) sp.set('player_search', params.player_search);
      if (params.status) sp.set('status', params.status);
      if (params.acquired_via) sp.set('acquired_via', params.acquired_via);
      if (params.from) sp.set('from', params.from);
      if (params.to) sp.set('to', params.to);
      sp.set('limit', String(params.limit ?? 50));
      sp.set('offset', String(params.offset ?? 0));
      const res = await apiClient.get(`/admin/chests/inventory?${sp.toString()}`);
      return unwrapPaginatedList<PlayerChestInventoryItem>(res.data);
    },
  });
}

export function useGrantChestManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChestGrantManualPayload) =>
      apiClient.post('/admin/chests/grant-manual', payload).then((r) => unwrapData<PlayerChestInventoryItem>(r.data)),
    onSuccess: () => {
      toast.success('Cofre entregado correctamente');
      qc.invalidateQueries({ queryKey: ['chest-inventory'] });
    },
  });
}

export function usePlayerSearch(query: string) {
  return useQuery({
    queryKey: ['player-search', query],
    enabled: query.trim().length >= 2,
    queryFn: () =>
      apiClient
        .get(`/admin/players/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => {
          const data = unwrapData<PlayerSearchResult[]>(r.data);
          trackEvent('player_searched');
          return data;
        }),
  });
}

/** Compat dropdown para streak editor y referencias cruzadas. */
export function useChestTypeOptions() {
  return useQuery({
    queryKey: ['chest-types', { status: 'active' }],
    queryFn: async () => {
      const res = await apiClient.get('/admin/chests/types?status=active');
      const types = unwrapData<ChestType[]>(res.data);
      return types.map((t) => ({ code: t.code, name: t.name }));
    },
  });
}
