import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';

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
      const arr = unwrapData<unknown[]>(res.data) ?? [];
      return arr.map((row) => adaptCurrency(row as Record<string, unknown>));
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
