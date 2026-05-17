import { asArray } from '@/lib/asArray';
import type { ChestType } from '@/types/chests';

export function normalizeChestType(type: ChestType): ChestType {
  return {
    ...type,
    prizes: asArray(type.prizes),
  };
}

export function normalizeChestTypes(types: ChestType[]): ChestType[] {
  return types.map(normalizeChestType);
}
