import type { GlobalCurrencyCatalogItem } from '@/types/currencyCatalog';

const catalogRow = (
  code: string,
  name: string,
  type: 'fiat' | 'stablecoin',
  decimals: number,
  display_order: number,
  symbol = '$',
): GlobalCurrencyCatalogItem => ({
  code,
  name,
  symbol,
  type,
  decimals,
  is_active: true,
  display_order,
});

/** Catálogo global de 33 monedas reales (Sub-etapa 15). */
export const globalCurrencyCatalog: GlobalCurrencyCatalogItem[] = [
  catalogRow('USD', 'US Dollar', 'fiat', 2, 1, '$'),
  catalogRow('EUR', 'Euro', 'fiat', 2, 2, '€'),
  catalogRow('GBP', 'British Pound', 'fiat', 2, 3, '£'),
  catalogRow('BRL', 'Brazilian Real', 'fiat', 2, 4, 'R$'),
  catalogRow('ARS', 'Argentine Peso', 'fiat', 2, 5, '$'),
  catalogRow('CLP', 'Chilean Peso', 'fiat', 0, 6, '$'),
  catalogRow('MXN', 'Mexican Peso', 'fiat', 2, 7, '$'),
  catalogRow('COP', 'Colombian Peso', 'fiat', 0, 8, '$'),
  catalogRow('PEN', 'Peruvian Sol', 'fiat', 2, 9, 'S/'),
  catalogRow('UYU', 'Uruguayan Peso', 'fiat', 2, 10, '$'),
  catalogRow('PYG', 'Paraguayan Guaraní', 'fiat', 0, 11, '₲'),
  catalogRow('BOB', 'Bolivian Boliviano', 'fiat', 2, 12, 'Bs'),
  catalogRow('VES', 'Venezuelan Bolívar', 'fiat', 2, 13, 'Bs'),
  catalogRow('DOP', 'Dominican Peso', 'fiat', 2, 14, 'RD$'),
  catalogRow('CRC', 'Costa Rican Colón', 'fiat', 2, 15, '₡'),
  catalogRow('GTQ', 'Guatemalan Quetzal', 'fiat', 2, 16, 'Q'),
  catalogRow('HNL', 'Honduran Lempira', 'fiat', 2, 17, 'L'),
  catalogRow('NIO', 'Nicaraguan Córdoba', 'fiat', 2, 18, 'C$'),
  catalogRow('PAB', 'Panamanian Balboa', 'fiat', 2, 19, 'B/.'),
  catalogRow('CAD', 'Canadian Dollar', 'fiat', 2, 20, 'CA$'),
  catalogRow('AUD', 'Australian Dollar', 'fiat', 2, 21, 'A$'),
  catalogRow('JPY', 'Japanese Yen', 'fiat', 0, 22, '¥'),
  catalogRow('CNY', 'Chinese Yuan', 'fiat', 2, 23, '¥'),
  catalogRow('KRW', 'South Korean Won', 'fiat', 0, 24, '₩'),
  catalogRow('INR', 'Indian Rupee', 'fiat', 2, 25, '₹'),
  catalogRow('TRY', 'Turkish Lira', 'fiat', 2, 26, '₺'),
  catalogRow('ZAR', 'South African Rand', 'fiat', 2, 27, 'R'),
  catalogRow('USDT', 'Tether USD', 'stablecoin', 2, 28, '₮'),
  catalogRow('USDC', 'USD Coin', 'stablecoin', 2, 29, 'USDC'),
  catalogRow('BUSD', 'Binance USD', 'stablecoin', 2, 30, 'BUSD'),
  catalogRow('DAI', 'Dai', 'stablecoin', 2, 31, 'DAI'),
  catalogRow('EURC', 'Euro Coin', 'stablecoin', 2, 32, 'EURC'),
  catalogRow('PYUSD', 'PayPal USD', 'stablecoin', 2, 33, 'PYUSD'),
];

export interface OperatorActiveRealRow {
  code: string;
  xp_per_unit: number;
  is_default: boolean;
  activated_at: string;
}

const iso = () => new Date().toISOString();

/** Estado mutable en mocks — monedas reales activadas por el operador demo. */
export const operatorActiveRealCurrencies: OperatorActiveRealRow[] = [
  { code: 'CLP', xp_per_unit: 0.1, is_default: true, activated_at: iso() },
];

export function findCatalogItem(code: string) {
  return globalCurrencyCatalog.find((item) => item.code === code);
}

export function buildActiveCurrencyResponse() {
  return operatorActiveRealCurrencies.map((row) => {
    const catalog = findCatalogItem(row.code);
    if (!catalog) return null;
    return {
      code: catalog.code,
      name: catalog.name,
      symbol: catalog.symbol,
      type: catalog.type,
      decimals: catalog.decimals,
      is_default: row.is_default,
      xp_per_unit: row.xp_per_unit,
      activated_at: row.activated_at,
    };
  }).filter(Boolean);
}

export function getDefaultActiveCode(): string | null {
  return operatorActiveRealCurrencies.find((r) => r.is_default)?.code ?? null;
}

export function resetOperatorActiveCurrencies() {
  operatorActiveRealCurrencies.splice(
    0,
    operatorActiveRealCurrencies.length,
    { code: 'CLP', xp_per_unit: 0.1, is_default: true, activated_at: new Date().toISOString() },
  );
}
