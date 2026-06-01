import { asArray } from '@/lib/asArray';
import { coerceNumber } from '@/lib/format';
import type { ChestPrize, ChestType } from '@/types/chests';

export type ChestCatalogState = 'active' | 'inactive' | 'archived';

export function chestCatalogState(
  type: Pick<ChestType, 'is_active' | 'archived_at' | 'status'>,
): ChestCatalogState {
  if (type.archived_at || type.status === 'archived') return 'archived';
  if (type.is_active) return 'active';
  return 'inactive';
}

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
  const raw = typeof type === 'object' && type !== null ? (type as Record<string, unknown>) : {};
  const asChest = type as ChestType;
  const fromRecord = extractChestPrizes(raw);
  const prizes = asArray(asChest.prizes?.length ? asChest.prizes : fromRecord).map((p) =>
    normalizeChestPrize(p as ChestPrize | Record<string, unknown>),
  );
  const archivedAt =
    typeof raw.archived_at === 'string'
      ? raw.archived_at
      : asChest.archived_at ?? (asChest.status === 'archived' ? asChest.updated_at ?? '' : null);
  const isActive = raw.is_active !== false && asChest.is_active !== false;
  const status: ChestType['status'] = archivedAt ? 'archived' : 'active';
  return {
    ...asChest,
    id: String(raw.id ?? asChest.id ?? ''),
    code: String(raw.code ?? asChest.code ?? ''),
    name: String(raw.name ?? asChest.name ?? ''),
    description: String(raw.description ?? asChest.description ?? ''),
    image_url: String(raw.image_url ?? asChest.image_url ?? ''),
    color_theme: String(raw.color_theme ?? asChest.color_theme ?? '#CD7F32'),
    is_active: archivedAt ? false : isActive,
    archived_at: archivedAt,
    default_expiration_hours:
      raw.default_expiration_hours === null || typeof raw.default_expiration_hours === 'number'
        ? (raw.default_expiration_hours as number | null)
        : asChest.default_expiration_hours ?? null,
    has_pity_system: Boolean(raw.has_pity_system ?? asChest.has_pity_system),
    pity_threshold:
      typeof raw.pity_threshold === 'number'
        ? (raw.pity_threshold as number)
        : asChest.pity_threshold ?? null,
    pity_guaranteed_prize_id:
      typeof raw.pity_guaranteed_prize_id === 'string'
        ? (raw.pity_guaranteed_prize_id as string)
        : asChest.pity_guaranteed_prize_id ?? null,
    status,
    created_at: String(raw.created_at ?? asChest.created_at ?? ''),
    updated_at: String(raw.updated_at ?? asChest.updated_at ?? ''),
    prizes,
  };
}

export function normalizeChestTypes(types: Array<ChestType | Record<string, unknown>>): ChestType[] {
  return types.map(normalizeChestType);
}
