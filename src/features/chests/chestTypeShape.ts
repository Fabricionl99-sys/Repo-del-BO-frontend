import { asArray } from '@/lib/asArray';
import { coerceNumber } from '@/lib/format';
import type { ChestPrize, ChestType } from '@/types/chests';

function normalizeChestPrize(prize: ChestPrize | Record<string, unknown>): ChestPrize {
  const raw = prize as Record<string, unknown>;
  return {
    ...(prize as ChestPrize),
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    image_url: String(raw.image_url ?? ''),
    reward_type: (raw.reward_type ?? 'manual') as ChestPrize['reward_type'],
    reward_config: (raw.reward_config ?? { description: String(raw.name ?? 'Premio') }) as ChestPrize['reward_config'],
    probability_percent: coerceNumber(raw.probability_percent),
    is_rare: Boolean(raw.is_rare),
  };
}

export function extractChestPrizes(raw: Record<string, unknown>): ChestType['prizes'] {
  for (const key of ['prizes', 'prize_list', 'items'] as const) {
    const value = raw[key];
    if (Array.isArray(value)) {
      return value.map((p) => normalizeChestPrize(p as Record<string, unknown>));
    }
  }
  return [];
}

export function normalizeChestType(type: ChestType | Record<string, unknown>): ChestType {
  const asChest = type as ChestType;
  const fromRecord =
    typeof type === 'object' && type !== null ? extractChestPrizes(type as Record<string, unknown>) : [];
  const prizes = asArray(asChest.prizes?.length ? asChest.prizes : fromRecord).map((p) =>
    normalizeChestPrize(p as ChestPrize | Record<string, unknown>),
  );
  return {
    ...asChest,
    prizes,
  };
}

export function normalizeChestTypes(types: Array<ChestType | Record<string, unknown>>): ChestType[] {
  return types.map(normalizeChestType);
}
