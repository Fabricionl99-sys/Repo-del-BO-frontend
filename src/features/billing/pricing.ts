import type { ModuleCode } from '@/types/billing';

/** Catalog price from API; no client-side overrides in production. */
export function operatorPriceForModule(_code: ModuleCode, catalogPrice: number): number {
  return catalogPrice;
}
