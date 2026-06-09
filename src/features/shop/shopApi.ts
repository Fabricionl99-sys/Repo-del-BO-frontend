import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { getApiErrorMessage, getValidationIssuesMessage } from '@/api/errors';
import { unwrapData, unwrapPaginatedList } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { Coin } from '@/types/coins';
import type { ShopProduct, ShopProductPayload, ShopPurchase, ShopPurchasesQuery } from '@/types/shop';

import { adaptShopPayloadForBackend, formatShopApiErrorBody } from './shopProductPayload';

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
 * v0.1.24 — ShopProductUpsertSchema:
 *   currency_code (string code, no UUID), cost_in_coins int, reward_config.kind,
 *   image_url HTTPS. Ver shopProductPayload.ts.
 */
export function useSaveShopProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: ShopProductPayload & { id?: string }) => {
      const coins = (qc.getQueryData(['coins']) as Coin[] | undefined) ?? [];
      const body = adaptShopPayloadForBackend(payload, coins);
      return id
        ? apiClient.put(`/admin/shop/products/${id}`, body).then((r) => unwrapData<ShopProduct>(r.data))
        : apiClient.post('/admin/shop/products', body).then((r) => unwrapData<ShopProduct>(r.data));
    },
    onSuccess: () => {
      toast.success('Producto guardado');
      qc.invalidateQueries({ queryKey: ['shop-products'] });
    },
    onError: (error) => {
      const issuesMsg = getValidationIssuesMessage(error);
      const rawBody = formatShopApiErrorBody(error);
      const message =
        issuesMsg ??
        rawBody ??
        getApiErrorMessage(error, 'No se pudo guardar el producto');
      toast.error(message.length > 500 ? `${message.slice(0, 497)}…` : message);
    },
  });
}

export function useToggleShopProductActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await apiClient.patch(`/admin/shop/products/${id}`, { is_active: active });
      return unwrapData<ShopProduct>(res.data);
    },
    onSuccess: (_data, { active }) => {
      toast.success(active ? 'Producto activado' : 'Producto desactivado');
      qc.invalidateQueries({ queryKey: ['shop-products'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar el estado del producto'));
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
