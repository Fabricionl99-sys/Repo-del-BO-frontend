import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { getApiErrorMessage } from '@/api/errors';
import { trackEvent } from '@/lib/analytics';
import { unwrapData } from '@/api/response';
import { isBrandingConfig } from '@/lib/boConfigValidation';
import { BO_LOCAL_STORAGE_KEYS, removeLocalStorageKey, writeLocalStorageJson } from '@/lib/boLocalStorage';
import { purgeBrandingConfigStorage } from '@/lib/sanitizeBoPersistentState';
import { multipartRequestConfig } from '@/lib/multipartUpload';
import { toast } from '@/stores/toastStore';
import type { BrandingConfig } from '@/types/branding';

import type { BrandingApiPatchPayload } from './brandingApiMappers';
import { normalizeBrandingConfig } from './brandingApiMappers';

export { isBrandingConfig } from '@/lib/boConfigValidation';

const STORAGE_KEY = BO_LOCAL_STORAGE_KEYS.brandingConfig;

const storeBrandingConfig = (config: BrandingConfig) => {
  writeLocalStorageJson(STORAGE_KEY, config);
};

function parseBrandingResponse(body: unknown): BrandingConfig {
  const data = normalizeBrandingConfig(unwrapData<unknown>(body));
  if (!data || !isBrandingConfig(data)) {
    throw new Error('Respuesta de branding inválida');
  }
  return data;
}

/** Multipart: no enviar Content-Type application/json del axios instance. */
function postBrandingAsset(path: string, file: File) {
  const fd = new FormData();
  fd.append('file', file);
  return apiClient
    .post(path, fd, multipartRequestConfig())
    .then((r) => unwrapData<{ url: string }>(r.data));
}

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

      const res = await apiClient.get('/admin/branding');
      const data = parseBrandingResponse(res.data);

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
    mutationFn: (payload: BrandingApiPatchPayload) =>
      apiClient.patch('/admin/branding', payload).then((r) => parseBrandingResponse(r.data)),
    onSuccess: (data) => {
      toast.success('Branding actualizado. Tu widget se actualiza en unos segundos.');
      trackEvent('branding_updated');
      storeBrandingConfig(data);
      qc.setQueryData(['branding-config'], data);
      qc.invalidateQueries({ queryKey: ['branding-config'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el branding'));
    },
  });
}

export function usePreviewBranding() {
  return useMutation({
    mutationFn: (payload: BrandingApiPatchPayload) =>
      apiClient.post('/admin/branding/preview', payload).then((r) => parseBrandingResponse(r.data)),
  });
}

export function useResetBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post('/admin/branding/reset').then((r) => parseBrandingResponse(r.data)),
    onSuccess: (data) => {
      toast.success('Branding reseteado a defaults');
      storeBrandingConfig(data);
      qc.setQueryData(['branding-config'], data);
      qc.invalidateQueries({ queryKey: ['branding-config'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo resetear el branding'));
    },
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => postBrandingAsset('/admin/branding/upload-logo', file),
    onSuccess: () => {
      toast.success('Logo subido');
      qc.invalidateQueries({ queryKey: ['branding-config'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'No se pudo subir el logo')),
  });
}

export function useUploadFavicon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => postBrandingAsset('/admin/branding/upload-favicon', file),
    onSuccess: () => {
      toast.success('Favicon subido');
      qc.invalidateQueries({ queryKey: ['branding-config'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'No se pudo subir el favicon')),
  });
}

export function useUploadBackground() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => postBrandingAsset('/admin/branding/upload-background', file),
    onSuccess: () => {
      toast.success('Background subido');
      qc.invalidateQueries({ queryKey: ['branding-config'] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, 'No se pudo subir el background')),
  });
}
