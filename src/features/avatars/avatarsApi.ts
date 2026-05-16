import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData, unwrapPaginatedList } from '@/api/response';
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

export function useCreateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AvatarCreatePayload) =>
      apiClient.post('/admin/avatars', payload).then((r) => unwrapData<Avatar>(r.data)),
    onSuccess: () => {
      toast.success('Avatar creado');
      qc.invalidateQueries({ queryKey: ['avatars'] });
      qc.invalidateQueries({ queryKey: ['avatar-categories'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'No se pudo crear el avatar');
    },
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: AvatarMetadataPayload & { id: string; image_url?: string }) =>
      apiClient.patch(`/admin/avatars/${id}`, payload).then((r) => unwrapData<Avatar>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Avatar actualizado');
      qc.invalidateQueries({ queryKey: ['avatars'] });
      qc.invalidateQueries({ queryKey: ['avatars', vars.id] });
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
  return useQuery({
    queryKey: ['avatar-inventory', params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params.avatar_id) sp.set('avatar_id', params.avatar_id);
      if (params.player_id) sp.set('player_id', params.player_id);
      if (params.player_search) sp.set('player_search', params.player_search);
      if (params.category_id) sp.set('category_id', params.category_id);
      if (params.unlocked_via) sp.set('unlocked_via', params.unlocked_via);
      if (params.from) sp.set('from', params.from);
      if (params.to) sp.set('to', params.to);
      sp.set('limit', String(params.limit ?? 50));
      sp.set('offset', String(params.offset ?? 0));
      const res = await apiClient.get(`/admin/avatars/inventory?${sp.toString()}`);
      return unwrapPaginatedList<PlayerAvatarInventoryItem>(res.data);
    },
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
