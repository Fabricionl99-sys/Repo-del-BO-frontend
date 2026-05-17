import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import { useOperatorStore } from '@/stores/operatorStore';
import type { MediaContext, MediaModule, MediaUploadResponse, StorageFileItem } from '@/types/media';

export interface UploadMediaPayload {
  file: File;
  context: MediaContext;
}

export function useUploadMedia() {
  const tenantId = useOperatorStore((s) => s.current?.id ?? 'demo');

  return useMutation({
    mutationFn: async ({ file, context }: UploadMediaPayload) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('module', context.module);
      fd.append('purpose', context.purpose);
      fd.append('tenant_id', tenantId);
      const res = await apiClient.post('/admin/storage/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return unwrapData<MediaUploadResponse>(res.data);
    },
    onError: () => {
      toast.error('No se pudo subir la imagen');
    },
  });
}

export function useStorageFiles(module: MediaModule | null) {
  return useQuery({
    queryKey: ['storage-files', module],
    enabled: Boolean(module),
    queryFn: async () => {
      const res = await apiClient.get(`/admin/storage/files?module=${module}`);
      return unwrapData<StorageFileItem[]>(res.data);
    },
  });
}

export function useDeleteStorageFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/admin/storage/files/${id}`).then((r) => unwrapData<{ success: boolean }>(r.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['storage-files'] });
    },
  });
}
