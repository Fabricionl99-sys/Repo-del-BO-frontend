import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { RuleCategory, RuleListItem, RuleStatus, XPRule } from '@/types/rules';

/**
 * Sprint #6 fix — el BO llamaba `/admin/xp-rules` (404) pero el backend
 * expone `/admin/rules`. Plus: backend usa PUT para edit (no PATCH) y NO
 * tiene endpoint `/duplicate`. Backend `/status` cambia is_active via
 * body `{ status: 'active'|'draft'|...}` (no `{ active: bool }`).
 *
 * Backend devuelve rule rows con shape distinto al BO RuleListItem:
 *   - `category_id: number` (1..6) en lugar de `category: 'slug'`
 *   - `is_active: boolean` en lugar de `active`
 *   - Sin `description`, `xpDisplay`, `updatedAt` → undefined → crash
 *     en RulesListPage cuando intenta `category[r.category].color`.
 *
 * Adapter mapea backend rows → BO RuleListItem para evitar crashes.
 */

const CATEGORY_ID_TO_SLUG: Record<number, RuleCategory> = {
  1: 'deportes',
  2: 'casino_vivo',
  3: 'casino', // slots → casino
  4: 'casino', // bingo → casino
  5: 'virtuales', // crash → virtuales
  6: 'poker',
};

interface BackendRuleRow {
  id: string;
  name: string;
  description?: string;
  category_id: number;
  category?: string;
  status?: string;
  is_active: boolean;
  xp_per_unit?: string;
  unit_field?: string;
  base_xp_per_usd?: string;
  currency_mode?: string;
  xp_per_currency_unit?: Record<string, number>;
  boost?: unknown;
  created_at?: string;
  updated_at?: string;
}

function backendRowToListItem(r: BackendRuleRow): RuleListItem {
  const catSlug =
    (r.category as RuleCategory) ?? CATEGORY_ID_TO_SLUG[r.category_id] ?? 'deportes';
  const xpValue = r.xp_per_unit ? parseFloat(r.xp_per_unit) : 0;
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    category: catSlug,
    status: (r.status as RuleStatus) ?? (r.is_active ? 'active' : 'draft'),
    active: r.is_active,
    boost: (r.boost as RuleListItem['boost']) ?? undefined,
    updatedAt: r.updated_at ?? r.created_at ?? new Date().toISOString(),
    xpDisplay: {
      value: xpValue ? `${xpValue} XP` : '—',
      perUnit: r.unit_field ? `por ${r.unit_field}` : undefined,
    },
  };
}

function backendRowToXPRule(r: BackendRuleRow): XPRule {
  return {
    ...(r as unknown as XPRule),
    description: r.description ?? '',
    category: backendRowToListItem(r).category,
    status: backendRowToListItem(r).status,
    usd_per_xp: r.xp_per_unit ? parseFloat(r.xp_per_unit) : undefined,
  } as XPRule;
}

export function useRulesList(params?: { status?: RuleStatus }) {
  return useQuery({
    queryKey: ['rules', params?.status ?? 'all'],
    queryFn: () =>
      apiClient
        .get('/admin/rules', { params })
        .then((r) => unwrapData<BackendRuleRow[]>(r.data))
        .then((rows) => rows.map(backendRowToListItem)),
  });
}

export function useRule(id: string | null) {
  return useQuery({
    queryKey: ['rules', id],
    enabled: !!id,
    queryFn: () =>
      apiClient
        .get(`/admin/rules/${id}`)
        .then((r) => unwrapData<BackendRuleRow>(r.data))
        .then(backendRowToXPRule),
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
      const existing = await apiClient
        .get(`/admin/rules/${id}`)
        .then((r) => unwrapData<BackendRuleRow>(r.data))
        .then(backendRowToXPRule);
      const copy = {
        ...existing,
        id: undefined,
        name: `${existing.name} (copia)`,
        status: 'draft' as const,
      };
      return apiClient
        .post('/admin/rules', copy)
        .then((r) => unwrapData<BackendRuleRow>(r.data))
        .then(backendRowToXPRule);
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
            .then((r) => unwrapData<BackendRuleRow>(r.data))
            .then(backendRowToXPRule)
        : apiClient
            .post('/admin/rules', values)
            .then((r) => unwrapData<BackendRuleRow>(r.data))
            .then(backendRowToXPRule),
    onSuccess: () => {
      toast.success('regla guardada');
      qc.invalidateQueries({ queryKey: ['rules'] });
    },
  });
}
