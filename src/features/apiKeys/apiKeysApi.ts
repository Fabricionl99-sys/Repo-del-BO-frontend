import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { trackEvent } from '@/lib/analytics';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  ApiConnectedIp,
  ApiKey,
  ApiKeysStats,
  ApiReferenceDoc,
  ApiRequestLog,
  CreateApiKeyPayload,
  CreateApiKeyResult,
  PingTestResult,
  RotateApiKeyResult,
} from '@/types/apiKeys';

export interface ApiLogsFilters {
  api_key_id?: string;
  endpoint?: string;
  status?: 'success' | 'error';
  method?: string;
  q?: string;
}

export function useApiKeysList() {
  return useQuery({
    queryKey: ['api-keys', 'list'],
    queryFn: () => apiClient.get('/admin/api-keys').then((r) => unwrapData<ApiKey[]>(r.data)),
  });
}

export function useApiKeysStats() {
  return useQuery({
    queryKey: ['api-keys', 'stats'],
    queryFn: () => apiClient.get('/admin/api-keys/stats').then((r) => unwrapData<ApiKeysStats>(r.data)),
  });
}

export function useApiKeysLogs(filters: ApiLogsFilters) {
  return useQuery({
    queryKey: ['api-keys', 'logs', filters],
    queryFn: () =>
      apiClient
        .get('/admin/api-keys/logs', { params: filters })
        .then((r) => unwrapData<ApiRequestLog[]>(r.data)),
  });
}

export function useConnectedIps() {
  return useQuery({
    queryKey: ['api-keys', 'connected-ips'],
    queryFn: () =>
      apiClient.get('/admin/api-keys/connected-ips').then((r) => unwrapData<ApiConnectedIp[]>(r.data)),
  });
}

export function useQuickStartGuide() {
  return useQuery({
    queryKey: ['api-keys', 'quick-start'],
    queryFn: () =>
      apiClient
        .get('/admin/api-keys/quick-start-guide')
        .then((r) => unwrapData<{ markdown: string }>(r.data)),
  });
}

export function useApiReference() {
  return useQuery({
    queryKey: ['api-keys', 'reference'],
    queryFn: () => apiClient.get('/admin/api-keys/api-reference').then((r) => unwrapData<ApiReferenceDoc>(r.data)),
  });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateApiKeyPayload) =>
      apiClient.post('/admin/api-keys', payload).then((r) => unwrapData<CreateApiKeyResult>(r.data)),
    onSuccess: (_data, variables) => {
      trackEvent('api_key_generated', { environment: variables.environment });
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/api-keys/${id}`).then((r) => unwrapData<{ ok: boolean }>(r.data)),
    onSuccess: () => {
      toast.success('API key revocada');
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function useRotateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/api-keys/${id}/rotate`).then((r) => unwrapData<RotateApiKeyResult>(r.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
}

export function usePingTest() {
  return useMutation({
    mutationFn: () =>
      apiClient.post('/admin/api-keys/ping-test').then((r) => unwrapData<PingTestResult>(r.data)),
  });
}
