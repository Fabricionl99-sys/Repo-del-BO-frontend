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

/**
 * Sprint #6 fix — backend NO tiene PATCH para chest types. Solo CREATE.
 * Para "actualizar" en MVP: recreamos el chest_type con mismo code (backend
 * acepta upsert por code via POST si el viejo está archivado). Stub que NO
 * rompe la UI pero el cambio no persiste — Sprint #7 implementa PATCH real.
 */
export function useUpdateChestType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, ...payload }: ChestTypeMetadataPayload & { code: string }) => {
      // MVP: noop suave para no romper UI. Sprint #7 → PATCH backend real.
      // Reintentamos el create con el mismo code que devuelve 409 → simplemente
      // refrescamos el detail actual.
      void payload;
      const res = await apiClient.get(`/admin/chests/types/${code}`);
      return normalizeChestType(unwrapData<ChestType>(res.data));
    },
    onSuccess: (_data, vars) => {
      toast.warning('Edición pendiente — Sprint #7');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
      qc.invalidateQueries({ queryKey: ['chest-types', vars.code] });
    },
  });
}

/**
 * Sprint #6 fix — backend usa POST /admin/chests/types/:code/archive
 * en vez de DELETE. Pero el routing del backend usa :id (UUID), NO :code,
 * para el archive action. Stub temporal: no llamamos, mostramos warning.
 */
export function useArchiveChestType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_code: string) => {
      // MVP: backend archive expects :id UUID, no :code. Stub.
      void _code;
      return undefined;
    },
    onSuccess: () => {
      toast.warning('Archivar tipo de cofre en desarrollo — Sprint #7');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

/**
 * Sprint #6 stubs — backend MVP NO tiene CRUD individual de prizes (los
 * prizes se setean al crear el chest_type entero). Stubs para no romper UI;
 * Sprint #7 agrega endpoints PATCH/DELETE prize individual.
 */
export function useAddChestPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_p: ChestPrizePayload & { code: string }): Promise<ChestPrize> => {
      void _p;
      return {} as ChestPrize;
    },
    onSuccess: () => {
      toast.warning('Agregar premio individual — Sprint #7');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

export function useUpdateChestPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_p: ChestPrizePayload & { code: string; prizeId: string }): Promise<ChestPrize> => {
      void _p;
      return {} as ChestPrize;
    },
    onSuccess: () => {
      toast.warning('Editar premio individual — Sprint #7');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

export function useDeleteChestPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_p: { code: string; prizeId: string }) => {
      void _p;
      return undefined;
    },
    onSuccess: () => {
      toast.warning('Eliminar premio individual — Sprint #7');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

/**
 * Sprint #6 stub — backend MVP NO tiene /admin/chests/inventory. Sprint #7
 * implementa GET con filtros. La tab Inventory muestra vacío sin error.
 */
export function useChestInventory(_params: ChestInventoryQuery = {}) {
  return useQuery({
    queryKey: ['chest-inventory', _params],
    queryFn: async () => ({
      items: [] as PlayerChestInventoryItem[],
      total: 0,
      limit: 50,
      offset: 0,
    }),
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
