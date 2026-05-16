import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { BrandingConfig, BrandingUpdatePayload } from '@/types/branding';

export function useBrandingConfig() {
  return useQuery({
    queryKey: ['branding-config'],
    queryFn: () =>
      apiClient.get('/admin/branding').then((r) => unwrapData<BrandingConfig>(r.data)),
  });
}

export function useUpdateBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BrandingUpdatePayload) =>
      apiClient.patch('/admin/branding', payload).then((r) => unwrapData<BrandingConfig>(r.data)),
    onSuccess: () => {
      toast.success('Branding guardado');
      qc.invalidateQueries({ queryKey: ['branding-config'] });
    },
  });
}

export function usePreviewBranding() {
  return useMutation({
    mutationFn: (payload: BrandingUpdatePayload) =>
      apiClient.post('/admin/branding/preview', payload).then((r) => unwrapData<BrandingConfig>(r.data)),
  });
}

export function useResetBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post('/admin/branding/reset').then((r) => unwrapData<BrandingConfig>(r.data)),
    onSuccess: () => {
      toast.success('Branding reseteado a defaults');
      qc.invalidateQueries({ queryKey: ['branding-config'] });
    },
  });
}

function uploadAsset(path: string, file: File) {
  const fd = new FormData();
  fd.append('file', file);
  return apiClient.post(path, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(
    (r) => unwrapData<{ url: string }>(r.data),
  );
}

export function useUploadLogo() {
  return useMutation({
    mutationFn: (file: File) => uploadAsset('/admin/branding/upload-logo', file),
  });
}

export function useUploadFavicon() {
  return useMutation({
    mutationFn: (file: File) => uploadAsset('/admin/branding/upload-favicon', file),
  });
}

export function useUploadBackground() {
  return useMutation({
    mutationFn: (file: File) => uploadAsset('/admin/branding/upload-background', file),
  });
}
