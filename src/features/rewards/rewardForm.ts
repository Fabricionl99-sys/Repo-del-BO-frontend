import { z } from 'zod';

import type {
  CurrencyMode,
  RewardModuleKey,
  RewardOperatorContext,
  RewardTypeCode,
  RewardValue,
} from '@/types/rewards';
import { BONUS_REWARD_TYPES, CURRENCY_AWARE_REWARD_TYPES } from '@/types/rewards';

export const ALL_REWARD_TYPES: RewardTypeCode[] = [
  'xp',
  'coins',
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'chest',
  'avatar_pack',
  'wheel_spin',
  'manual',
];

export const REWARD_TYPE_LABELS: Record<RewardTypeCode, string> = {
  xp: 'XP (puntos de experiencia)',
  coins: 'Monedas',
  freespin: 'Free Spins',
  freebet: 'Free Bets',
  cashback: 'Cashback',
  bonus_deposit: 'Bonus de Depósito',
  chest: 'Cofre',
  avatar_pack: 'Pack de Avatares',
  wheel_spin: 'Giro de Ruleta',
  manual: 'Entrega Manual (operador define)',
};

export const MODULE_REWARD_TYPES: Record<RewardModuleKey, RewardTypeCode[]> = {
  missions: ALL_REWARD_TYPES,
  streaks: ALL_REWARD_TYPES,
  shop: ALL_REWARD_TYPES.filter((t) => t !== 'xp'),
  chests: ALL_REWARD_TYPES.filter((t) => t !== 'chest'),
  wheels: ALL_REWARD_TYPES.filter((t) => t !== 'wheel_spin'),
  rankings: ALL_REWARD_TYPES,
  tournaments: ALL_REWARD_TYPES,
  predictions: ALL_REWARD_TYPES.filter((t) => t !== 'xp'),
  welcome_chest: ['chest'],
};

export interface RewardFormFields {
  reward_type: RewardTypeCode;
  currency_mode: CurrencyMode;
  bonus_id: string;
  currency_amounts: Record<string, number>;
  xp_amount: number;
  coins_amount: number;
  coins_currency_code: string;
  chest_type_code: string;
  chest_quantity: number;
  avatar_ids: string;
  avatar_pack_id: string;
  wheel_type_code: string;
  wheel_quantity: number;
  manual_description: string;
}

export function defaultRewardFormFields(rewardType: RewardTypeCode = 'coins'): RewardFormFields {
  return {
    reward_type: rewardType,
    currency_mode: 'auto_usd',
    bonus_id: '',
    currency_amounts: {},
    xp_amount: 500,
    coins_amount: 1000,
    coins_currency_code: 'main',
    chest_type_code: '',
    chest_quantity: 1,
    avatar_ids: '',
    avatar_pack_id: '',
    wheel_type_code: '',
    wheel_quantity: 1,
    manual_description: '',
  };
}

function parseCurrencyAmounts(cfg: Record<string, unknown>): Record<string, number> {
  const raw = cfg.amounts_by_currency ?? cfg.currency_amounts;
  if (!raw || typeof raw !== 'object') return {};
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      .filter(([, v]) => typeof v === 'number')
      .map(([k, v]) => [k, v as number]),
  );
}

export function rewardValueToForm(value: RewardValue): RewardFormFields {
  const base = defaultRewardFormFields(value.reward_type);
  const cfg = value.reward_config ?? {};
  base.currency_mode = value.currency_mode ?? 'auto_usd';
  base.currency_amounts = parseCurrencyAmounts(cfg);
  switch (value.reward_type) {
    case 'xp':
      return { ...base, xp_amount: Number(cfg.amount ?? 500) };
    case 'coins':
      return {
        ...base,
        coins_amount: Number(cfg.amount ?? 1000),
        coins_currency_code: String(cfg.currency_code ?? 'main'),
      };
    case 'freespin':
    case 'freebet':
    case 'cashback':
    case 'bonus_deposit':
      return { ...base, bonus_id: String(cfg.bonus_id ?? '') };
    case 'chest':
      return {
        ...base,
        chest_type_code: String(cfg.chest_type_code ?? ''),
        chest_quantity: Number(cfg.quantity ?? 1),
      };
    case 'avatar_pack':
      return {
        ...base,
        avatar_ids: Array.isArray(cfg.avatar_ids) ? cfg.avatar_ids.join(', ') : String(cfg.avatar_ids ?? ''),
        avatar_pack_id: String(cfg.avatar_pack_id ?? cfg.pack_id ?? ''),
      };
    case 'wheel_spin':
      return {
        ...base,
        wheel_type_code: String(cfg.wheel_type_code ?? ''),
        wheel_quantity: Number(cfg.quantity ?? 1),
      };
    case 'manual':
      return { ...base, manual_description: String(cfg.description ?? '') };
    default:
      return base;
  }
}

export function formToRewardValue(fields: RewardFormFields): RewardValue {
  const currency_mode = fields.currency_mode;
  const currencyExtras =
    currency_mode === 'manual_per_currency' && Object.keys(fields.currency_amounts).length > 0
      ? { amounts_by_currency: fields.currency_amounts }
      : {};

  switch (fields.reward_type) {
    case 'xp':
      return { reward_type: 'xp', reward_config: { amount: fields.xp_amount }, currency_mode };
    case 'coins':
      return {
        reward_type: 'coins',
        reward_config: {
          amount: fields.coins_amount,
          currency_code: fields.coins_currency_code,
          ...currencyExtras,
        },
        currency_mode,
      };
    case 'freespin':
    case 'freebet':
    case 'cashback':
    case 'bonus_deposit':
      return {
        reward_type: fields.reward_type,
        reward_config: { bonus_id: fields.bonus_id, ...currencyExtras },
        currency_mode,
      };
    case 'chest':
      return {
        reward_type: 'chest',
        reward_config: { chest_type_code: fields.chest_type_code, quantity: fields.chest_quantity },
        currency_mode,
      };
    case 'avatar_pack':
      return {
        reward_type: 'avatar_pack',
        reward_config: fields.avatar_pack_id
          ? { avatar_pack_id: fields.avatar_pack_id }
          : {
              avatar_ids: fields.avatar_ids
                .split(/[,\s]+/)
                .map((s) => s.trim())
                .filter(Boolean),
            },
        currency_mode,
      };
    case 'wheel_spin':
      return {
        reward_type: 'wheel_spin',
        reward_config: { wheel_type_code: fields.wheel_type_code, quantity: fields.wheel_quantity },
        currency_mode,
      };
    case 'manual':
      return {
        reward_type: 'manual',
        reward_config: { description: fields.manual_description },
        currency_mode,
      };
    default:
      return { reward_type: 'coins', reward_config: { amount: 0, currency_code: 'main' }, currency_mode };
  }
}

export function summarizeReward(value: RewardValue, context?: RewardOperatorContext): string {
  const cfg = value.reward_config;
  switch (value.reward_type) {
    case 'xp':
      return `${cfg.amount} XP`;
    case 'coins':
      return `${cfg.amount} monedas (${cfg.currency_code ?? 'main'})`;
    case 'freespin':
    case 'freebet':
    case 'cashback':
    case 'bonus_deposit': {
      const bonus = context?.operator_bonuses.find((b) => b.id === cfg.bonus_id);
      if (bonus) return `${bonus.name} (${bonus.external_id})`;
      return cfg.bonus_id ? `Bono ${cfg.bonus_id}` : '—';
    }
    case 'chest':
      return `Cofre ${cfg.chest_type_code} ×${cfg.quantity ?? 1}`;
    case 'avatar_pack':
      return Array.isArray(cfg.avatar_ids)
        ? `Pack de ${cfg.avatar_ids.length} avatares`
        : `Pack ${cfg.avatar_pack_id ?? cfg.pack_id ?? ''}`;
    case 'wheel_spin':
      return `Ruleta ${cfg.wheel_type_code} ×${cfg.quantity ?? 1}`;
    case 'manual':
      return String(cfg.description ?? 'Entrega manual').slice(0, 60);
    default:
      return '—';
  }
}

const rewardTypeEnum = z.enum([
  'xp',
  'coins',
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'chest',
  'avatar_pack',
  'wheel_spin',
  'manual',
]);

export const rewardFormFieldsSchema = z
  .object({
    reward_type: rewardTypeEnum,
    currency_mode: z.enum(['auto_usd', 'manual_per_currency']),
    bonus_id: z.string(),
    currency_amounts: z.record(z.string(), z.number()),
    xp_amount: z.number().min(0),
    coins_amount: z.number().min(0),
    coins_currency_code: z.string(),
    chest_type_code: z.string(),
    chest_quantity: z.number().int().min(1),
    avatar_ids: z.string(),
    avatar_pack_id: z.string(),
    wheel_type_code: z.string(),
    wheel_quantity: z.number().int().min(1),
    manual_description: z.string(),
  })
  .superRefine((values, ctx) => {
    validateRewardFormFields(values, ctx);
  });

export function validateRewardFormFields(
  values: RewardFormFields,
  ctx: z.RefinementCtx,
  prefix = '',
): void {
  const path = (field: string) => (prefix ? `${prefix}.${field}` : field);
  switch (values.reward_type) {
    case 'xp':
      if (values.xp_amount <= 0) {
        ctx.addIssue({ code: 'custom', path: [path('xp_amount')], message: 'Cantidad de XP requerida' });
      }
      break;
    case 'coins':
      if (values.coins_amount <= 0) {
        ctx.addIssue({ code: 'custom', path: [path('coins_amount')], message: 'Cantidad requerida' });
      }
      if (!values.coins_currency_code.trim()) {
        ctx.addIssue({ code: 'custom', path: [path('coins_currency_code')], message: 'Moneda requerida' });
      }
      break;
    case 'freespin':
    case 'freebet':
    case 'cashback':
    case 'bonus_deposit':
      if (!values.bonus_id.trim()) {
        ctx.addIssue({ code: 'custom', path: [path('bonus_id')], message: 'Seleccioná un bono del catálogo' });
      }
      break;
    case 'chest':
      if (!values.chest_type_code.trim()) {
        ctx.addIssue({ code: 'custom', path: [path('chest_type_code')], message: 'Tipo de cofre requerido' });
      }
      break;
    case 'avatar_pack':
      if (!values.avatar_ids.trim() && !values.avatar_pack_id.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: [path('avatar_ids')],
          message: 'Seleccioná avatares o ingresá pack_id',
        });
      }
      break;
    case 'wheel_spin':
      if (!values.wheel_type_code.trim()) {
        ctx.addIssue({ code: 'custom', path: [path('wheel_type_code')], message: 'Tipo de ruleta requerido' });
      }
      break;
    case 'manual':
      if (!values.manual_description.trim()) {
        ctx.addIssue({ code: 'custom', path: [path('manual_description')], message: 'Descripción requerida' });
      }
      break;
  }
}

export function getEffectiveRewardTypes(
  moduleKey: RewardModuleKey,
  activeModuleCodes: string[] | null,
  override?: RewardTypeCode[],
): RewardTypeCode[] {
  const base = override ?? MODULE_REWARD_TYPES[moduleKey];
  return base.filter((type) => {
    if (type === 'wheel_spin') return isModuleActive(activeModuleCodes, 'wheels');
    if (type === 'chest') return isModuleActive(activeModuleCodes, 'chests');
    if (type === 'avatar_pack') return isModuleActive(activeModuleCodes, 'avatars');
    return true;
  });
}

export function isRewardTypeGated(
  type: RewardTypeCode,
  activeModuleCodes: string[] | null,
): { gated: boolean; module: 'wheels' | 'chests' | 'avatars' | null } {
  if (type === 'wheel_spin' && !isModuleActive(activeModuleCodes, 'wheels')) {
    return { gated: true, module: 'wheels' };
  }
  if (type === 'chest' && !isModuleActive(activeModuleCodes, 'chests')) {
    return { gated: true, module: 'chests' };
  }
  if (type === 'avatar_pack' && !isModuleActive(activeModuleCodes, 'avatars')) {
    return { gated: true, module: 'avatars' };
  }
  return { gated: false, module: null };
}

function isModuleActive(activeCodes: string[] | null, moduleKey: string): boolean {
  if (!activeCodes || activeCodes.length === 0) return true;
  return activeCodes.includes(moduleKey);
}

export function isCurrencyAwareRewardType(type: RewardTypeCode): boolean {
  return CURRENCY_AWARE_REWARD_TYPES.includes(type);
}

export function bonusesForRewardType(
  context: RewardOperatorContext,
  rewardType: RewardTypeCode,
) {
  if (!BONUS_REWARD_TYPES.includes(rewardType)) return [];
  return context.operator_bonuses.filter((b) => b.bonus_type === rewardType);
}

export const GATED_MODULE_LABELS: Record<string, string> = {
  wheels: 'Ruletas',
  chests: 'Cofres',
  avatars: 'Avatares',
};

export const rewardValueSchema = z
  .object({
    reward_type: rewardTypeEnum,
    reward_config: z.record(z.string(), z.unknown()),
    currency_mode: z.enum(['auto_usd', 'manual_per_currency']).optional(),
  })
  .superRefine((value, ctx) => {
    validateRewardFormFields(rewardValueToForm(value), ctx);
  });
