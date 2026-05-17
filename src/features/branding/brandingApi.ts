import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { isBrandingConfig } from '@/lib/boConfigValidation';
import { BO_LOCAL_STORAGE_KEYS, removeLocalStorageKey, writeLocalStorageJson } from '@/lib/boLocalStorage';
import { purgeBrandingConfigStorage } from '@/lib/sanitizeBoPersistentState';
import { toast } from '@/stores/toastStore';
import type { BrandingConfig, BrandingUpdatePayload } from '@/types/branding';

export { isBrandingConfig } from '@/lib/boConfigValidation';

const STORAGE_KEY = BO_LOCAL_STORAGE_KEYS.brandingConfig;

const storeBrandingConfig = (config: BrandingConfig) => {
  writeLocalStorageJson(STORAGE_KEY, config);
};

function usePurgeBrandingStorageOnMount() {
  const qc = useQueryClient();
  useEffect(() => {
    purgeBrandingConfigStorage();
    const cached = qc.getQueryData(['branding-config']);
    if (cached !== undefined && !isBrandingConfig(cached)) {
      qc.removeQueries({ queryKey: ['branding-config'], exact: true });
    }
    removeLocalStorageKey(BO_LOCAL_STORAGE_KEYS.brandingConfigLegacy);
  }, [qc]);
}

export function useBrandingConfig() {
  usePurgeBrandingStorageOnMount();

  return useQuery({
    queryKey: ['branding-config'],
    queryFn: async () => {
      purgeBrandingConfigStorage();

      const data = await apiClient
        .get('/admin/branding')
        .then((r) => unwrapData<BrandingConfig>(r.data));

      if (!isBrandingConfig(data)) {
        removeLocalStorageKey(STORAGE_KEY);
        throw new Error('Respuesta de branding inválida');
      }

      storeBrandingConfig(data);
      return data;
    },
    select: (data) => (isBrandingConfig(data) ? data : undefined),
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });
}

export function useUpdateBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BrandingUpdatePayload) =>
      apiClient.patch('/admin/branding', payload).then((r) => unwrapData<BrandingConfig>(r.data)),
    onSuccess: (data) => {
      if (!isBrandingConfig(data)) {
        removeLocalStorageKey(STORAGE_KEY);
        return;
      }
      toast.success('Branding guardado');
      storeBrandingConfig(data);
      qc.setQueryData(['branding-config'], data);
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
    onSuccess: (data) => {
      if (!isBrandingConfig(data)) {
        removeLocalStorageKey(STORAGE_KEY);
        return;
      }
      toast.success('Branding reseteado a defaults');
      storeBrandingConfig(data);
      qc.setQueryData(['branding-config'], data);
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
