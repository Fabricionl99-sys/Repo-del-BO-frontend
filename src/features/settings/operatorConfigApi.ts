import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { isOperatorConfigApiResponse } from '@/lib/boConfigValidation';
import { BO_LOCAL_STORAGE_KEYS, removeLocalStorageKey, writeLocalStorageJson } from '@/lib/boLocalStorage';
import { purgeOperatorConfigStorage } from '@/lib/sanitizeBoPersistentState';
import { toast } from '@/stores/toastStore';
import type {
  CurrencyOption,
  LanguageOption,
  OperatorConfigApiResponse,
  OperatorConfigUpdatePayload,
  TimezoneOption,
} from '@/types/operatorConfig';

export { isOperatorConfigApiResponse } from '@/lib/boConfigValidation';

const STORAGE_KEY = BO_LOCAL_STORAGE_KEYS.operatorConfig;

const storeConfig = (config: OperatorConfigApiResponse) => {
  writeLocalStorageJson(STORAGE_KEY, config);
};

function usePurgeOperatorStorageOnMount() {
  const qc = useQueryClient();
  useEffect(() => {
    purgeOperatorConfigStorage();
    const cached = qc.getQueryData(['operator-config']);
    if (cached !== undefined && !isOperatorConfigApiResponse(cached)) {
      qc.removeQueries({ queryKey: ['operator-config'], exact: true });
    }
    removeLocalStorageKey(BO_LOCAL_STORAGE_KEYS.operatorConfigLegacy);
  }, [qc]);
}

export function useOperatorConfig() {
  usePurgeOperatorStorageOnMount();

  return useQuery({
    queryKey: ['operator-config'],
    queryFn: async () => {
      purgeOperatorConfigStorage();

      const data = await apiClient
        .get('/admin/operator-config')
        .then((r) => unwrapData<OperatorConfigApiResponse>(r.data));

      if (!isOperatorConfigApiResponse(data)) {
        removeLocalStorageKey(STORAGE_KEY);
        throw new Error('Respuesta de configuración inválida');
      }

      storeConfig(data);
      return data;
    },
    select: (data) => (isOperatorConfigApiResponse(data) ? data : undefined),
    staleTime: 0,
    refetchOnMount: 'always',
    retry: 1,
  });
}

export function useUpdateOperatorConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OperatorConfigUpdatePayload) =>
      apiClient.patch('/admin/operator-config', payload).then((r) => unwrapData<OperatorConfigApiResponse>(r.data)),
    onSuccess: (data) => {
      if (!isOperatorConfigApiResponse(data)) {
        removeLocalStorageKey(STORAGE_KEY);
        return;
      }
      toast.success('Configuración guardada');
      storeConfig(data);
      qc.setQueryData(['operator-config'], data);
      qc.invalidateQueries({ queryKey: ['operator-config'] });
      qc.invalidateQueries({ queryKey: ['operator-billing'] });
    },
  });
}

export function useUploadCompanyLogo() {
  return useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      return apiClient
        .post('/admin/operator-config/upload-logo', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => unwrapData<{ url: string }>(r.data));
    },
  });
}

export function useOperatorTimezones() {
  return useQuery({
    queryKey: ['operator-config-timezones'],
    queryFn: () =>
      apiClient.get('/admin/operator-config/timezones').then((r) => unwrapData<TimezoneOption[]>(r.data)),
  });
}

export function useOperatorLanguages() {
  return useQuery({
    queryKey: ['operator-config-languages'],
    queryFn: () =>
      apiClient.get('/admin/operator-config/languages').then((r) => unwrapData<LanguageOption[]>(r.data)),
  });
}

export function useOperatorCurrencies() {
  return useQuery({
    queryKey: ['operator-config-currencies'],
    queryFn: () =>
      apiClient.get('/admin/operator-config/currencies').then((r) => unwrapData<CurrencyOption[]>(r.data)),
  });
}

export function useTestOperatorNotifications() {
  return useMutation({
    mutationFn: (email: string) =>
      apiClient
        .post('/admin/operator-config/test-notifications', { email })
        .then((r) => unwrapData<{ ok: boolean; message: string }>(r.data)),
  });
}
