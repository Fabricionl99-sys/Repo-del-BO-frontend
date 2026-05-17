import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  CurrencyOption,
  LanguageOption,
  OperatorConfigApiResponse,
  OperatorConfigUpdatePayload,
  TimezoneOption,
} from '@/types/operatorConfig';

const STORAGE_KEY = 'niveles_operator_config_v2';

const readStoredConfig = (): OperatorConfigApiResponse | null => {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as OperatorConfigApiResponse | null;
  } catch {
    return null;
  }
};

const storeConfig = (config: OperatorConfigApiResponse) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
};

export function useOperatorConfig() {
  return useQuery({
    queryKey: ['operator-config'],
    queryFn: () =>
      apiClient
        .get('/admin/operator-config')
        .then((r) => readStoredConfig() ?? unwrapData<OperatorConfigApiResponse>(r.data)),
  });
}

export function useUpdateOperatorConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OperatorConfigUpdatePayload) =>
      apiClient.patch('/admin/operator-config', payload).then((r) => unwrapData<OperatorConfigApiResponse>(r.data)),
    onSuccess: (data) => {
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
