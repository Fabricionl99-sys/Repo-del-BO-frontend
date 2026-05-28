import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { getApiErrorMessage } from '@/api/errors';
import { unwrapData } from '@/api/response';
import { resolveMediaUploaderConfig } from '@/components/media/mediaUploaderPresets';
import { toast } from '@/stores/toastStore';
import { useOperatorStore } from '@/stores/operatorStore';
import type { MediaContext, MediaModule, MediaUploadResponse, StorageFileItem } from '@/types/media';

export interface UploadMediaPayload {
  file: File;
  context: MediaContext;
}

function resolveUploadPath(context: MediaContext): string {
  if (context.module === 'branding') {
    if (context.purpose === 'logo') return '/admin/branding/upload-logo';
    if (context.purpose === 'icon') return '/admin/branding/upload-favicon';
    if (context.purpose === 'background') return '/admin/branding/upload-background';
  }
  return '/admin/storage/upload';
}

function mapUploadResponse(raw: Record<string, unknown>): MediaUploadResponse {
  const url = String(raw.public_url ?? raw.url ?? '');
  const sizeBytes = Number(raw.size_bytes ?? 0);
  const sizeKb = sizeBytes > 0 ? Math.round(sizeBytes / 1024) : Number(raw.size_kb ?? 0);
  const width = Number(raw.width ?? 0);
  const height = Number(raw.height ?? 0);
  return {
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
}

export function useUploadMedia() {
  const tenantId = useOperatorStore((s) => s.current?.id ?? 'demo');

  return useMutation({
    mutationFn: async ({ file, context }: UploadMediaPayload) => {
      const fd = new FormData();
      fd.append('file', file);
      const uploadPath = resolveUploadPath(context);

      if (uploadPath === '/admin/storage/upload') {
        fd.append('module', context.module);
        fd.append('purpose', context.purpose);
        fd.append('tenant_id', tenantId);
        const { serverResizeSquare } = resolveMediaUploaderConfig(context);
        if (serverResizeSquare) {
          fd.append('resize_to_square', String(serverResizeSquare));
        }
      }

      const res = await apiClient.post(uploadPath, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const raw = unwrapData<Record<string, unknown>>(res.data);
      return mapUploadResponse(raw);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo subir la imagen'));
    },
  });
}

export function useStorageFiles(module: MediaModule | null) {
  return useQuery({
    queryKey: ['storage-files', module],
    enabled: Boolean(module) && module !== 'branding',
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
