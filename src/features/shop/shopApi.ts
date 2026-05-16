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

export function useSaveShopProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: ShopProductPayload & { id?: string }) =>
      id
        ? apiClient.patch(`/admin/shop/products/${id}`, payload).then((r) => unwrapData<ShopProduct>(r.data))
        : apiClient.post('/admin/shop/products', payload).then((r) => unwrapData<ShopProduct>(r.data)),
    onSuccess: () => {
      toast.success('Producto guardado');
      qc.invalidateQueries({ queryKey: ['shop-products'] });
    },
  });
}

export function useArchiveShopProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/shop/products/${id}`),
    onSuccess: () => {
      toast.success('Producto archivado');
      qc.invalidateQueries({ queryKey: ['shop-products'] });
    },
  });
}

export function useShopPurchases(params: ShopPurchasesQuery = {}) {
  return useQuery({
    queryKey: ['shop-purchases', params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (params.status) sp.set('status', params.status);
      if (params.product_id) sp.set('product_id', params.product_id);
      if (params.player_id) sp.set('player_id', params.player_id);
      if (params.player_search) sp.set('player_search', params.player_search);
      if (params.from) sp.set('from', params.from);
      if (params.to) sp.set('to', params.to);
      sp.set('limit', String(params.limit ?? 50));
      sp.set('offset', String(params.offset ?? 0));
      const res = await apiClient.get(`/admin/shop/purchases?${sp.toString()}`);
      return unwrapPaginatedList<ShopPurchase>(res.data);
    },
  });
}

export function useShopPurchase(id: string | null) {
  return useQuery({
    queryKey: ['shop-purchases', id],
    enabled: Boolean(id),
    queryFn: () =>
      apiClient.get(`/admin/shop/purchases/${id}`).then((r) => unwrapData<ShopPurchase>(r.data)),
  });
}
