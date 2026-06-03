import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData, unwrapDataList } from '@/api/response';

export interface Currency {
  id: string;
  code: string;
  name: string;
  iconUrl: string | null;
}

function adaptCurrency(raw: Record<string, unknown>): Currency {
  return {
    id: String(raw.id ?? ''),
    code: String(raw.code ?? ''),
    name: String(raw.name ?? raw.code ?? 'Moneda'),
    iconUrl: typeof raw.icon_url === 'string' ? raw.icon_url : null,
  };
}

export function useCurrencies() {
  return useQuery({
    queryKey: ['currencies'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/currencies');
      const arr = unwrapDataList<Record<string, unknown>>(res.data);
      return arr.map((row) => adaptCurrency(row));
    },
    staleTime: 5 * 60_000,
  });
}

/** Monedas activas del operador — para selects en misiones, shop, etc. */
export function useActiveCurrencies() {
  return useQuery({
    queryKey: ['currencies', 'active'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/currencies/active');
      const arr = unwrapDataList<Record<string, unknown>>(res.data);
      return arr.map((row) => adaptCurrency(row));
    },
    staleTime: 5 * 60_000,
  });
}

export function useCurrency(currencyId: string | undefined | null) {
  const q = useCurrencies();
  const currency = useMemo(
    () => (currencyId ? (q.data ?? []).find((c) => c.id === currencyId) : undefined),
    [currencyId, q.data],
  );
  return { ...q, currency };
}

export function formatCurrencyAmount(amount: number, currency: Currency | undefined): string {
  if (!currency) return `${amount} moneda${amount === 1 ? '' : 's'}`;
  const unit = currency.name || currency.code;
  return `${amount} ${unit}`;
}
