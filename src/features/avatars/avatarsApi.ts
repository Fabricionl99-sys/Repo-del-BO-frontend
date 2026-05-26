import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { getApiErrorMessage } from '@/api/errors';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  Avatar,
  AvatarCategory,
  AvatarCategoryPayload,
  AvatarCreatePayload,
  AvatarGrantManualPayload,
  AvatarInventoryQuery,
  AvatarMetadataPayload,
  AvatarsCatalogQuery,
  AvatarsCatalogStats,
  PlayerAvatarInventoryItem,
} from '@/types/avatars';

export function useAvatarCategories() {
  return useQuery({
    queryKey: ['avatar-categories'],
    queryFn: () =>
      apiClient.get('/admin/avatars/categories').then((r) => unwrapData<AvatarCategory[]>(r.data)),
  });
}

export function useCreateAvatarCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AvatarCategoryPayload) =>
      apiClient.post('/admin/avatars/categories', payload).then((r) => unwrapData<AvatarCategory>(r.data)),
    onSuccess: () => {
      toast.success('Categoría creada');
      qc.invalidateQueries({ queryKey: ['avatar-categories'] });
      qc.invalidateQueries({ queryKey: ['avatars'] });
    },
  });
}

export function useUpdateAvatarCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: AvatarCategoryPayload & { id: string }) =>
      apiClient.patch(`/admin/avatars/categories/${id}`, payload).then((r) => unwrapData<AvatarCategory>(r.data)),
    onSuccess: () => {
      toast.success('Categoría actualizada');
      qc.invalidateQueries({ queryKey: ['avatar-categories'] });
      qc.invalidateQueries({ queryKey: ['avatars'] });
    },
  });
}

export function useDeleteAvatarCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/avatars/categories/${id}`),
    onSuccess: () => {
      toast.success('Categoría eliminada');
      qc.invalidateQueries({ queryKey: ['avatar-categories'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'No se pudo eliminar la categoría');
    },
  });
}

export function useReorderAvatarCategories() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      apiClient
        .patch('/admin/avatars/categories/reorder', { ordered_ids: orderedIds })
        .then((r) => unwrapData<AvatarCategory[]>(r.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['avatar-categories'] });
    },
  });
}

export function useAvatars(filters: AvatarsCatalogQuery = {}) {
  return useQuery({
    queryKey: ['avatars', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.category_id) sp.set('category_id', filters.category_id);
      if (filters.unlock_method) sp.set('unlock_method', filters.unlock_method);
      if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
      if (filters.is_premium !== undefined) sp.set('is_premium', String(filters.is_premium));
      if (filters.search) sp.set('search', filters.search);
      const qs = sp.toString();
      const res = await apiClient.get(`/admin/avatars${qs ? `?${qs}` : ''}`);
      return unwrapData<{ items: Avatar[]; stats: AvatarsCatalogStats }>(res.data);
    },
  });
}

export function useAvatar(id: string | null) {
  return useQuery({
    queryKey: ['avatars', id],
    enabled: Boolean(id),
    queryFn: () => apiClient.get(`/admin/avatars/${id}`).then((r) => unwrapData<Avatar>(r.data)),
  });
}

/** Backend `.strict()` no acepta `is_premium` hasta que exista en schema. */
function adaptAvatarBody<T extends AvatarCreatePayload | AvatarMetadataPayload>(
  payload: T,
): Omit<T, 'is_premium'> {
  const { is_premium: _omit, ...body } = payload as T & { is_premium?: boolean };
  void _omit;
  return body;
}

export function useCreateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AvatarCreatePayload) =>
      apiClient
        .post('/admin/avatars', adaptAvatarBody(payload))
        .then((r) => unwrapData<Avatar>(r.data)),
    onSuccess: () => {
      toast.success('Avatar creado');
      qc.invalidateQueries({ queryKey: ['avatars'] });
      qc.invalidateQueries({ queryKey: ['avatar-categories'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo crear el avatar'));
    },
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: AvatarMetadataPayload & { id: string; image_url?: string }) =>
      apiClient
        .patch(`/admin/avatars/${id}`, adaptAvatarBody(payload))
        .then((r) => unwrapData<Avatar>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Avatar actualizado');
      qc.invalidateQueries({ queryKey: ['avatars'] });
      qc.invalidateQueries({ queryKey: ['avatars', vars.id] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar el avatar'));
    },
  });
}

export function useArchiveAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/avatars/${id}`),
    onSuccess: () => {
      toast.success('Avatar archivado');
      qc.invalidateQueries({ queryKey: ['avatars'] });
      qc.invalidateQueries({ queryKey: ['avatar-categories'] });
    },
  });
}

export function useAvatarInventory(params: AvatarInventoryQuery = {}) {
  // Sprint #6 stub — backend MVP no expone /admin/avatars/inventory (la
  // ruta `inventory` choca con @Get(':id') ParseUUIDPipe → 400 "uuid
  // expected"). Sprint #7: agregar endpoint admin con paginación + filtros.
  // El player SÍ tiene /v1/player/avatars/inventory.
  return useQuery({
    queryKey: ['avatar-inventory', params],
    queryFn: async (): Promise<{
      items: PlayerAvatarInventoryItem[];
      total: number;
      limit: number;
      offset: number;
    }> => ({
      items: [],
      total: 0,
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
    }),
  });
}

export function useGrantAvatarManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ avatarId, ...payload }: AvatarGrantManualPayload & { avatarId: string }) =>
      apiClient
        .post(`/admin/avatars/${avatarId}/grant-manual`, payload)
        .then((r) => unwrapData<PlayerAvatarInventoryItem>(r.data)),
    onSuccess: () => {
      toast.success('Avatar asignado correctamente');
      qc.invalidateQueries({ queryKey: ['avatar-inventory'] });
    },
  });
}

export { usePlayerSearch } from '@/features/chests/chestsApi';
