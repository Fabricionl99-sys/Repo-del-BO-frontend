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
const LEGACY_STORAGE_KEY = 'niveles_operator_config';

export function isOperatorConfigApiResponse(value: unknown): value is OperatorConfigApiResponse {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.company_info === 'object' &&
    record.company_info !== null &&
    typeof (record.company_info as Record<string, unknown>).legal_name === 'string' &&
    typeof record.contact_info === 'object' &&
    record.contact_info !== null &&
    typeof record.localization === 'object' &&
    record.localization !== null
  );
}

const readStoredConfig = (): OperatorConfigApiResponse | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isOperatorConfigApiResponse(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const storeConfig = (config: OperatorConfigApiResponse) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
};

const clearInvalidStoredConfig = () => {
  if (typeof window === 'undefined') return;
  const rawV2 = window.localStorage.getItem(STORAGE_KEY);
  if (rawV2) {
    try {
      if (!isOperatorConfigApiResponse(JSON.parse(rawV2))) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }
};

export function useOperatorConfig() {
  return useQuery({
    queryKey: ['operator-config'],
    queryFn: async () => {
      clearInvalidStoredConfig();
      const data = await apiClient
        .get('/admin/operator-config')
        .then((r) => unwrapData<OperatorConfigApiResponse>(r.data));

      if (!isOperatorConfigApiResponse(data)) {
        throw new Error('Respuesta de configuración inválida');
      }

      storeConfig(data);
      return data;
    },
    initialData: () => readStoredConfig() ?? undefined,
    initialDataUpdatedAt: 0,
    select: (data) => (isOperatorConfigApiResponse(data) ? data : undefined),
    retry: 1,
  });
}

export function useUpdateOperatorConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OperatorConfigUpdatePayload) =>
      apiClient.patch('/admin/operator-config', payload).then((r) => unwrapData<OperatorConfigApiResponse>(r.data)),
    onSuccess: (data) => {
      if (!isOperatorConfigApiResponse(data)) return;
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
