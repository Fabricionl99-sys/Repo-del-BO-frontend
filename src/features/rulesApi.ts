import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { RuleListItem, RuleStatus, XPRule } from '@/types/rules';

/**
 * Sprint #6 fix — el BO llamaba `/admin/xp-rules` (404) pero el backend
 * expone `/admin/rules`. Plus: backend usa PUT para edit (no PATCH) y NO
 * tiene endpoint `/duplicate`. Backend `/status` cambia is_active via
 * body `{ status: 'active'|'draft'|...}` (no `{ active: bool }`).
 *
 * Duplicate stub: backend no tiene endpoint, lo armamos client-side
 * (GET existing → POST copia con `(copia)` en el nombre).
 */

export function useRulesList(params?: { status?: RuleStatus }) {
  return useQuery({
    queryKey: ['rules', params?.status ?? 'all'],
    queryFn: () =>
      apiClient
        .get('/admin/rules', { params })
        .then((r) => unwrapData<RuleListItem[]>(r.data)),
  });
}

export function useRule(id: string | null) {
  return useQuery({
    queryKey: ['rules', id],
    enabled: !!id,
    queryFn: () =>
      apiClient.get(`/admin/rules/${id}`).then((r) => unwrapData<XPRule>(r.data)),
  });
}

export function useToggleRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiClient.patch(`/admin/rules/${id}/status`, {
        status: active ? 'active' : 'draft',
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rules'] }),
  });
}

export function useDuplicateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Backend no tiene /duplicate — armamos client-side: GET existing → POST copia.
      const existing = await apiClient
        .get(`/admin/rules/${id}`)
        .then((r) => unwrapData<XPRule>(r.data));
      const copy = {
        ...existing,
        id: undefined,
        name: `${existing.name} (copia)`,
        status: 'draft' as const,
      };
      return apiClient
        .post('/admin/rules', copy)
        .then((r) => unwrapData<XPRule>(r.data));
    },
    onSuccess: () => {
      toast.success('regla duplicada');
      qc.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}

export function useSaveRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string | null; values: Partial<XPRule> }) =>
      id
        ? apiClient
            .put(`/admin/rules/${id}`, values)
            .then((r) => unwrapData<XPRule>(r.data))
        : apiClient
            .post('/admin/rules', values)
            .then((r) => unwrapData<XPRule>(r.data)),
    onSuccess: () => {
      toast.success('regla guardada');
      qc.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}
