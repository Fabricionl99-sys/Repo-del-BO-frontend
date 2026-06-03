export type GlobalCurrencyType = 'fiat' | 'stablecoin';

export interface GlobalCurrencyCatalogItem {
  code: string;
  name: string;
  symbol: string;
  type: GlobalCurrencyType;
  decimals: number;
  /** Habilitada en el catálogo global de Social2Game */
  is_active: boolean;
  display_order: number;
}

export interface OperatorActiveCurrency {
  code: string;
  name: string;
  symbol: string;
  type: GlobalCurrencyType;
  decimals: number;
  is_default: boolean;
  xp_per_unit?: number | null;
  activated_at?: string;
}
