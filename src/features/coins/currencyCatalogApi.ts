import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { getApiErrorMessage } from '@/api/errors';
import { unwrapData, unwrapDataList } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { GlobalCurrencyCatalogItem, OperatorActiveCurrency } from '@/types/currencyCatalog';

function mapCatalogItem(raw: Record<string, unknown>): GlobalCurrencyCatalogItem {
  return {
    code: String(raw.code ?? ''),
    name: String(raw.name ?? raw.code ?? ''),
    symbol: String(raw.symbol ?? '$'),
    type: raw.type === 'stablecoin' ? 'stablecoin' : 'fiat',
    decimals: Number(raw.decimals ?? 2),
    is_active: raw.is_active !== false,
    display_order: Number(raw.display_order ?? 0),
  };
}

function mapActiveCurrency(raw: Record<string, unknown>): OperatorActiveCurrency {
  return {
    code: String(raw.code ?? ''),
    name: String(raw.name ?? raw.code ?? ''),
    symbol: String(raw.symbol ?? '$'),
    type: raw.type === 'stablecoin' ? 'stablecoin' : 'fiat',
    decimals: Number(raw.decimals ?? 2),
    is_default: Boolean(raw.is_default),
    xp_per_unit: typeof raw.xp_per_unit === 'number' ? raw.xp_per_unit : null,
    activated_at: typeof raw.activated_at === 'string' ? raw.activated_at : undefined,
  };
}

const CATALOG_KEY = ['currencies', 'catalog'] as const;
const ACTIVE_REAL_KEY = ['currencies', 'active'] as const;

export function useCurrencyCatalog() {
  return useQuery({
    queryKey: CATALOG_KEY,
    queryFn: async () => {
      const res = await apiClient.get('/admin/currencies/catalog');
      const arr = unwrapDataList<Record<string, unknown>>(res.data);
      return arr.map(mapCatalogItem).sort((a, b) => a.display_order - b.display_order);
    },
    staleTime: 60_000,
  });
}

export function useOperatorActiveCurrencies() {
  return useQuery({
    queryKey: ACTIVE_REAL_KEY,
    queryFn: async () => {
      const res = await apiClient.get('/admin/currencies/active');
      const arr = unwrapDataList<Record<string, unknown>>(res.data);
      return arr.map(mapActiveCurrency);
    },
    staleTime: 30_000,
  });
}

export function useActivateCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (currencyCode: string) => {
      const res = await apiClient.post('/admin/currencies/activate', { currency_code: currencyCode });
      return mapActiveCurrency(unwrapData<Record<string, unknown>>(res.data));
    },
    onSuccess: () => {
      toast.success('Moneda activada');
      qc.invalidateQueries({ queryKey: ACTIVE_REAL_KEY });
      qc.invalidateQueries({ queryKey: ['coins', 'default'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo activar la moneda'));
    },
  });
}

export function useDeactivateCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (currencyCode: string) => {
      await apiClient.delete(`/admin/currencies/active/${currencyCode}`);
    },
    onSuccess: () => {
      toast.success('Moneda desactivada');
      qc.invalidateQueries({ queryKey: ACTIVE_REAL_KEY });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo desactivar la moneda'));
    },
  });
}

export function useSetDefaultCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (currencyCode: string) => {
      const res = await apiClient.post('/admin/currencies/default', { currency_code: currencyCode });
      return mapActiveCurrency(unwrapData<Record<string, unknown>>(res.data));
    },
    onSuccess: () => {
      toast.success('Moneda default actualizada');
      qc.invalidateQueries({ queryKey: ACTIVE_REAL_KEY });
      qc.invalidateQueries({ queryKey: ['coins', 'default'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar la moneda default'));
    },
  });
}

export function useUpdateActiveCurrencyXp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, xpPerUnit }: { code: string; xpPerUnit: number }) => {
      const res = await apiClient.patch(`/admin/currencies/active/${code}`, { xp_per_unit: xpPerUnit });
      return mapActiveCurrency(unwrapData<Record<string, unknown>>(res.data));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACTIVE_REAL_KEY });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo actualizar XP por unidad'));
    },
  });
}
