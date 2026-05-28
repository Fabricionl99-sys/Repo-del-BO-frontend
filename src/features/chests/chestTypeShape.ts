import { asArray } from '@/lib/asArray';
import type { ChestType } from '@/types/chests';

export function extractChestPrizes(raw: Record<string, unknown>): ChestType['prizes'] {
  for (const key of ['prizes', 'prize_list', 'items'] as const) {
    const value = raw[key];
    if (Array.isArray(value)) return value as ChestType['prizes'];
  }
  return [];
}

export function normalizeChestType(type: ChestType | Record<string, unknown>): ChestType {
  const asChest = type as ChestType;
  const fromRecord =
    typeof type === 'object' && type !== null ? extractChestPrizes(type as Record<string, unknown>) : [];
  const prizes = asArray(asChest.prizes?.length ? asChest.prizes : fromRecord);
  return {
    ...asChest,
    prizes,
  };
}

export function normalizeChestTypes(types: Array<ChestType | Record<string, unknown>>): ChestType[] {
  return types.map(normalizeChestType);
}
