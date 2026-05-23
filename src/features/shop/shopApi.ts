import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData, unwrapPaginatedList } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { ShopProduct, ShopProductPayload, ShopPurchase, ShopPurchasesQuery } from '@/types/shop';

export interface ShopProductsFilters {
  status?: 'active' | 'archived' | 'all';
  reward_type?: string;
  currency_code?: string;
  search?: string;
}

export function useShopProducts(filters: ShopProductsFilters = {}) {
  return useQuery({
    queryKey: ['shop-products', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
      if (filters.reward_type) sp.set('reward_type', filters.reward_type);
      if (filters.currency_code) sp.set('currency_code', filters.currency_code);
      if (filters.search) sp.set('search', filters.search);
      const qs = sp.toString();
      const res = await apiClient.get(`/admin/shop/products${qs ? `?${qs}` : ''}`);
      return unwrapData<ShopProduct[]>(res.data);
    },
  });
}

export function useShopProduct(id: string | null) {
  return useQuery({
    queryKey: ['shop-products', id],
    enabled: Boolean(id),
    queryFn: () =>
      apiClient.get(`/admin/shop/products/${id}`).then((r) => unwrapData<ShopProduct>(r.data)),
  });
}

/**
 * Sprint #6 fix — BO usaba PATCH pero backend espera PUT (405 → "algo salió mal").
 * Backend usa POST /admin/shop/products/:id/archive en vez de DELETE.
 *
 * Adapter de reward_config:
 *   - Backend espera discriminated union por `.kind`. BO manda `reward_type`
 *     slug separado y reward_config sin kind.
 *   - 'xp' (BO-only) → 'manual' con descripción "N XP bonus".
 *   - manual sin value_usd → default 0.
 *   - coins sin amount → default 1, sin currency_code → default 'main'.
 */
const SHOP_VALID_KINDS = new Set([
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'manual',
  'chest',
  'coins',
  'avatar_pack',
  'wheel_spin',
]);

function adaptShopPayloadForBackend(
  payload: ShopProductPayload,
): Record<string, unknown> {
  const rawType = String(payload.reward_type ?? 'manual');
  const rawCfg = ((payload.reward_config ?? {}) as unknown) as Record<string, unknown>;
  let kind: string;
  let cfg: Record<string, unknown>;
  if (rawType === 'xp') {
    const xp = Number(rawCfg.amount ?? 0);
    kind = 'manual';
    cfg = { kind: 'manual', description: `${xp} XP bonus`, value_usd: 0 };
  } else if (SHOP_VALID_KINDS.has(rawType)) {
    kind = rawType;
    cfg = { ...rawCfg, kind: rawType };
    if (kind === 'manual') {
      const desc = cfg.description;
      if (typeof desc !== 'string' || !desc.trim()) cfg.description = payload.name;
      if (typeof cfg.value_usd !== 'number') cfg.value_usd = 0;
    }
    if (kind === 'coins') {
      if (typeof cfg.amount !== 'number' || (cfg.amount as number) <= 0) cfg.amount = 1;
      if (!cfg.currency_code) cfg.currency_code = payload.currency_code;
    }
    if (kind === 'chest' && !cfg.chest_type_code) cfg.chest_type_code = 'default_chest';
    if (kind === 'wheel_spin' && !cfg.wheel_type_code) cfg.wheel_type_code = 'default_wheel';
  } else {
    kind = 'manual';
    cfg = { kind: 'manual', description: payload.name, value_usd: 0 };
  }
  return {
    ...payload,
    reward_type: kind,
    reward_config: cfg,
  };
}

export function useSaveShopProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: ShopProductPayload & { id?: string }) => {
      const body = adaptShopPayloadForBackend(payload);
      return id
        ? apiClient.put(`/admin/shop/products/${id}`, body).then((r) => unwrapData<ShopProduct>(r.data))
        : apiClient.post('/admin/shop/products', body).then((r) => unwrapData<ShopProduct>(r.data));
    },
    onSuccess: () => {
      toast.success('Producto guardado');
      qc.invalidateQueries({ queryKey: ['shop-products'] });
    },
  });
}

export function useArchiveShopProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/shop/products/${id}/archive`),
    onSuccess: () => {
      toast.success('Producto archivado');
      qc.invalidateQueries({ queryKey: ['shop-products'] });
    },
  });
}

/**
 * Sprint #6 stub — backend MVP NO expone admin purchases endpoint.
 * Sprint #7 implementa GET /admin/shop/purchases real. Por ahora la tab
 * Purchases del BO se muestra vacía sin error.
 */
export function useShopPurchases(_params: ShopPurchasesQuery = {}) {
  return useQuery({
    queryKey: ['shop-purchases', _params],
    queryFn: async () => ({ items: [] as ShopPurchase[], total: 0, limit: 50, offset: 0 }),
  });
}

export function useShopPurchase(id: string | null) {
  return useQuery({
    queryKey: ['shop-purchases', id],
    enabled: Boolean(id),
    queryFn: async (): Promise<ShopPurchase | null> => null,
  });
}
