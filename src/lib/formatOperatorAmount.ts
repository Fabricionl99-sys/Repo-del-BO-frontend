import type { OperatorCurrency } from '@/features/coinsApi';

const FALLBACK_CURRENCY: OperatorCurrency = { code: 'USD', symbol: '$' };

/**
 * Formats fiat amounts for operator-facing UI using GET /admin/currencies/default.
 * Storage stays numeric — this is presentation only.
 */
export function formatOperatorAmount(
  amount: number,
  currency: OperatorCurrency | null | undefined,
  opts?: { showCode?: boolean },
): string {
  const cur = currency?.code ? currency : FALLBACK_CURRENCY;
  const symbol = cur.symbol ?? '$';
  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : String(amount);
  const showCode = opts?.showCode ?? true;
  return showCode ? `${symbol}${formatted} ${cur.code}` : `${symbol}${formatted}`;
}

export function operatorCurrencyHint(currency: OperatorCurrency | null | undefined): string | null {
  if (currency?.code) return null;
  return 'Sin moneda por defecto configurada — mostrando USD.';
}
