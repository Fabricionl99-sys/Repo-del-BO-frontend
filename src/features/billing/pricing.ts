import type { ModuleCode } from '@/types/billing';

/** Operator-specific pricing overrides for mock/demo; production uses API values. */
const OPERATOR_PRICING: Partial<Record<ModuleCode, number>> = {
  xp_engine: 179,
  coins: 134,
  streaks: 116,
  missions: 161,
  shop: 143,
  rewards_delivery: 89,
  chests: 107,
  tournaments: 170,
  predictions: 152,
  rankings: 125,
  avatars: 80,
  branding: 71,
  multi_currency: 98,
  notifications: 89,
};

export function operatorPriceForModule(code: ModuleCode, catalogPrice: number): number {
  return OPERATOR_PRICING[code] ?? Math.round(catalogPrice * 0.9 * 100) / 100;
}
