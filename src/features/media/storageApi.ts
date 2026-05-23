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
      // Sub-etapa avatares S6: el backend hace auto-resize a 512x512 PNG
      // con sharp (cover crop centrado) cuando se le manda este flag.
      // Operador sube cualquier imagen → queda normalizada para el círculo.
      if (context.module === 'avatars') {
        fd.append('resize_to_square', '512');
      }
      const res = await apiClient.post('/admin/storage/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Backend devuelve shape distinto al que BO espera. Mapeamos:
      //   backend `public_url` → BO `url`
      //   backend `size_bytes` → BO `size_kb` (dividido /1024)
      //   backend `variants.full.url` → BO `variants.thumb_*` (mismo URL hasta que
      //   tengamos thumbs reales generados sharp)
      const raw = unwrapData<Record<string, unknown>>(res.data);
      const url = String(raw.public_url ?? raw.url ?? '');
      const sizeBytes = Number(raw.size_bytes ?? 0);
      const sizeKb = sizeBytes > 0 ? Math.round(sizeBytes / 1024) : 0;
      const width = Number(raw.width ?? 0);
      const height = Number(raw.height ?? 0);
      const result: MediaUploadResponse = {
        url,
        filename: String(raw.filename ?? ''),
        size_kb: sizeKb,
        width,
        height,
        variants: {
          thumb_64: url,
          thumb_128: url,
          thumb_256: url,
          full: url,
        },
      };
      return result;
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
