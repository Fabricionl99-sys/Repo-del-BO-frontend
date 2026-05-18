import type { OperatorBonus } from '@/types/operatorBonuses';

export type RewardTypeCode =
  | 'xp'
  | 'coins'
  | 'freespin'
  | 'freebet'
  | 'cashback'
  | 'bonus_deposit'
  | 'chest'
  | 'avatar_pack'
  | 'wheel_spin'
  | 'manual';

export type CurrencyMode = 'auto_usd' | 'manual_per_currency';

export interface RewardValue {
  reward_type: RewardTypeCode;
  reward_config: Record<string, unknown>;
  currency_mode?: CurrencyMode;
}

export interface RewardOperatorContext {
  operator_bonuses: OperatorBonus[];
  available_chests: { code: string; name: string }[];
  available_wheels: { code: string; name: string }[];
  available_avatars: { id: string; name: string }[];
  available_coins: { id: string; code: string; name: string }[];
  active_currencies: string[];
  activeModuleCodes: string[] | null;
}

export type RewardModuleKey =
  | 'missions'
  | 'streaks'
  | 'shop'
  | 'chests'
  | 'wheels'
  | 'rankings'
  | 'tournaments'
  | 'predictions'
  | 'welcome_chest';

export const BONUS_REWARD_TYPES: RewardTypeCode[] = ['freespin', 'freebet', 'cashback', 'bonus_deposit'];

export const CURRENCY_AWARE_REWARD_TYPES: RewardTypeCode[] = [
  'coins',
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
];
