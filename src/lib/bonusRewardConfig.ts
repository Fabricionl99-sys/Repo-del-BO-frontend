import type { OperatorBonus } from '@/types/operatorBonuses';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type BonusRewardKind = 'freespin' | 'freebet' | 'cashback' | 'bonus_deposit';

export function isBonusUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

/** Resuelve bonus_id interno (UUID) desde id o external_id legacy. */
export function resolveOperatorBonusId(
  rawId: string,
  bonuses?: Pick<OperatorBonus, 'id' | 'external_id'>[],
): string {
  const trimmed = rawId.trim();
  if (!trimmed) return '';
  if (bonuses?.length) {
    const byId = bonuses.find((b) => b.id === trimmed);
    if (byId) return byId.id;
    const byExternal = bonuses.find((b) => b.external_id === trimmed);
    if (byExternal) return byExternal.id;
  }
  return trimmed;
}

/** Backend S18: solo `{ kind, bonus_id }` — sin external_bonus_id ni campos legacy mezclados. */
export function buildBackendBonusRewardConfig(
  kind: BonusRewardKind,
  rawConfig: Record<string, unknown>,
  bonuses?: Pick<OperatorBonus, 'id' | 'external_id'>[],
): Record<string, unknown> {
  const bonusId = resolveOperatorBonusId(String(rawConfig.bonus_id ?? ''), bonuses);
  return { kind, bonus_id: bonusId };
}
