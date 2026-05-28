import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { getApiErrorMessage } from '@/api/errors';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { RuleBoost, RuleCategory, RuleListItem, RuleStatus, XPRule } from '@/types/rules';
import {
  FALLBACK_CATEGORY_ID_BY_SLUG,
  FALLBACK_SLUG_BY_CATEGORY_ID,
} from '@/features/gameCategories/gameCategoriesApi';
import { normalizeBoostMultiplier, serializeBoostForApi } from '@/features/rules/ruleXpForm';

/**
 * Sprint #6 fix — el BO llamaba `/admin/xp-rules` (404) pero el backend
 * expone `/admin/rules`. Plus: backend usa PUT para edit (no PATCH) y NO
 * tiene endpoint `/duplicate`. Backend `/status` cambia status via
 * body `{ status: 'active'|'paused'|... }`.
 */

interface BackendRuleRow {
  id: string;
  name: string;
  description?: string;
  category_id: number;
  category?: string;
  status?: string;
  is_active: boolean;
  currency?: string;
  xp_per_unit?: string;
  unit_field?: string;
  base_xp_per_usd?: string;
  currency_mode?: string;
  xp_per_currency_unit?: Record<string, number>;
  boost?: BackendBoostRow | null;
  created_at?: string;
  updated_at?: string;
}

interface BackendBoostRow {
  enabled?: boolean;
  multiplier?: number;
  starts_at?: string;
  ends_at?: string;
  scope?: 'all' | 'category';
  category_code?: string;
}

/** Backend legacy: `published` → tratamos como `active` (semántica FE-only). */
export function normalizeRuleStatus(raw?: string, isActive?: boolean): RuleStatus {
  const s = (raw ?? '').toLowerCase();
  if (s === 'published' || s === 'active') return 'active';
  if (s === 'paused') return 'paused';
  if (s === 'draft') return 'draft';
  if (s === 'archived') return 'archived';
  return isActive ? 'active' : 'draft';
}

export function isPublishedLikeStatus(status: RuleStatus): boolean {
  return status === 'active';
}

function parseBoost(
  raw: BackendBoostRow | null | undefined,
  fallbackCategory?: RuleCategory,
): RuleBoost | undefined {
  if (!raw) return undefined;
  const multiplier = normalizeBoostMultiplier(raw.multiplier);
  if (!raw.starts_at || !raw.ends_at) return undefined;

  return {
    enabled: raw.enabled ?? true,
    multiplier: multiplier ?? 2,
    starts_at: raw.starts_at,
    ends_at: raw.ends_at,
    scope: 'category',
    category_code: (raw.category_code as RuleCategory | undefined) ?? fallbackCategory,
  };
}

function backendRowToListItem(r: BackendRuleRow): RuleListItem {
  const catSlug =
    (r.category as RuleCategory) ?? FALLBACK_SLUG_BY_CATEGORY_ID[r.category_id] ?? 'deportes';
  const status = normalizeRuleStatus(r.status, r.is_active);
  const xpValue = r.xp_per_unit ? parseFloat(r.xp_per_unit) : 0;
  const currency = r.currency ?? 'USD';
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    category: catSlug,
    currency,
    status,
    active: isPublishedLikeStatus(status),
    boost: parseBoost(r.boost ?? undefined, catSlug),
    updatedAt: r.updated_at ?? r.created_at ?? new Date().toISOString(),
    xpDisplay: {
      value: xpValue ? `${xpValue} XP` : '—',
      perUnit: r.unit_field ? `por ${r.unit_field}` : currency ? `por ${currency}` : undefined,
    },
  };
}

function backendRowToXPRule(r: BackendRuleRow): XPRule {
  const listItem = backendRowToListItem(r);
  const xpPerUnit = r.xp_per_unit ? parseFloat(r.xp_per_unit) : 0;
  const currency =
    r.currency ??
    (r.xp_per_currency_unit ? Object.keys(r.xp_per_currency_unit)[0] : undefined) ??
    'USD';

  return {
    id: r.id,
    name: r.name,
    description: r.description ?? '',
    status: listItem.status,
    category: listItem.category,
    category_id: r.category_id,
    usd_per_xp: xpPerUnit,
    trigger: { event: 'bet_placed', category: listItem.category },
    conditionsLogic: 'all',
    conditions: [],
    action: {
      xpBase: 1,
      xpPerAmount: { xp: 1, amount: xpPerUnit, currency },
      xpMaxPerEvent: null,
    },
    boost: listItem.boost,
    createdAt: r.created_at ?? new Date().toISOString(),
    updatedAt: r.updated_at ?? r.created_at ?? new Date().toISOString(),
    createdBy: { name: '—', initials: '—' },
  };
}

function filterByStatus(items: RuleListItem[], status?: RuleStatus): RuleListItem[] {
  if (!status) return items;
  if (status === 'active') {
    return items.filter((r) => isPublishedLikeStatus(r.status));
  }
  return items.filter((r) => r.status === status);
}

export function useRulesList(params?: { status?: RuleStatus }) {
  return useQuery({
    queryKey: ['rules', params?.status ?? 'all'],
    queryFn: () =>
      apiClient
        .get('/admin/rules')
        .then((r) => unwrapData<BackendRuleRow[]>(r.data))
        .then((rows) => filterByStatus(rows.map(backendRowToListItem), params?.status)),
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

export function useSetRuleStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'paused' | 'draft' }) =>
      apiClient.patch(`/admin/rules/${id}/status`, { status }),
    onSuccess: (_data, vars) => {
      toast.success(
        vars.status === 'paused' ? 'Regla pausada' : vars.status === 'draft' ? 'Regla en borrador' : 'Regla activada',
      );
      qc.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar el estado de la regla'));
    },
  });
}

/** Toggle rápido desde el switch de la lista (activa ↔ pausada). */
export function useToggleRule() {
  const setStatus = useSetRuleStatus();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      setStatus.mutateAsync({ id, status: active ? 'active' : 'paused' }),
  });
}

export function useDeleteRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/rules/${id}`),
    onSuccess: () => {
      toast.success('Regla eliminada');
      qc.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar la regla'));
    },
  });
}

function boRuleToBackendPayload(values: Partial<XPRule>): Record<string, unknown> {
  const category = (values as { category?: RuleCategory }).category;
  const categoryId =
    values.category_id ??
    (category ? FALLBACK_CATEGORY_ID_BY_SLUG[category] : undefined) ??
    1;
  const usdPerXp = (values as { usd_per_xp?: number }).usd_per_xp ?? 0;
  const action = (values as { action?: { xpPerAmount?: { currency?: string; amount?: number } } }).action;
  const currency = action?.xpPerAmount?.currency?.toUpperCase() ?? 'USD';
  const isUsd = currency === 'USD';
  const rawStatus = (values as { status?: RuleStatus }).status ?? 'active';
  const backendStatus = isPublishedLikeStatus(rawStatus) ? 'active' : rawStatus;

  const payload: Record<string, unknown> = {
    name: values.name,
    description: (values as { description?: string }).description ?? '',
    category_id: categoryId,
    currency,
    xp_per_unit: usdPerXp,
    unit_field: 'amount',
    status: backendStatus,
  };

  if (isUsd) {
    payload.currency_mode = 'auto_usd';
    payload.base_xp_per_usd = usdPerXp;
  } else {
    payload.currency_mode = 'manual_per_currency';
    payload.xp_per_currency_unit = { [currency]: usdPerXp };
  }

  const boostRaw = (values as { boost?: RuleBoost | null }).boost;
  const serializedBoost = serializeBoostForApi(boostRaw);
  if (serializedBoost !== undefined) {
    payload.boost = serializedBoost;
  }

  return payload;
}

export function useSaveRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values }: { id: string | null; values: Partial<XPRule> }) => {
      const payload = boRuleToBackendPayload(values);
      return id
        ? apiClient
            .put(`/admin/rules/${id}`, payload)
            .then((r) => unwrapData<BackendRuleRow>(r.data))
            .then(backendRowToXPRule)
        : apiClient
            .post('/admin/rules', payload)
            .then((r) => unwrapData<BackendRuleRow>(r.data))
            .then(backendRowToXPRule);
    },
    onSuccess: (data, vars) => {
      toast.success(vars.id ? 'Regla actualizada' : 'Regla creada');
      qc.invalidateQueries({ queryKey: ['rules'] });
      qc.invalidateQueries({ queryKey: ['multipliers'] });
      if (vars.id) {
        qc.setQueryData(['rules', vars.id], data);
      }
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar la regla'));
    },
  });
}

/** @deprecated Usar navegación a /reglas-xp/nueva?copyFrom= — mantiene compat. */
export function useDuplicateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const existing = await apiClient
        .get(`/admin/rules/${id}`)
        .then((r) => unwrapData<BackendRuleRow>(r.data))
        .then(backendRowToXPRule);
      const payload = boRuleToBackendPayload({
        ...existing,
        name: `${existing.name} (copia)`,
        status: 'draft',
      });
      return apiClient
        .post('/admin/rules', payload)
        .then((r) => unwrapData<BackendRuleRow>(r.data))
        .then(backendRowToXPRule);
    },
    onSuccess: () => {
      toast.success('Regla duplicada');
      qc.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo duplicar la regla'));
    },
  });
}
