import { z } from 'zod';

import type {
  ChestPrize,
  ChestPrizePayload,
  ChestPrizeRewardConfig,
  ChestPrizeRewardType,
} from '@/types/chests';

export const CHEST_PRIZE_REWARD_TYPES: ChestPrizeRewardType[] = [
  'coins',
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'chest',
  'avatar_pack',
  'manual',
];

export interface ChestPrizeFormValues {
  reward_type: ChestPrizeRewardType;
  name: string;
  image_url: string;
  probability_percent: number;
  is_rare: boolean;
  coins_amount: number;
  coins_currency_code: string;
  freespin_quantity: number;
  freespin_game_id: string;
  freebet_amount: number;
  freebet_currency: string;
  cashback_percentage: number;
  cashback_max_amount: number;
  bonus_amount: number;
  bonus_currency: string;
  chest_type_code: string;
  avatar_ids: string;
  manual_description: string;
}

const codeSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(64, 'Máximo 64 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

export const chestPrizeFormSchema = z
  .object({
    reward_type: z.enum([
      'coins',
      'freespin',
      'freebet',
      'cashback',
      'bonus_deposit',
      'chest',
      'avatar_pack',
      'manual',
    ]),
    name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    image_url: z.string().url('URL inválida').or(z.literal('')),
    probability_percent: z
      .number()
      .min(0, 'Mínimo 0')
      .max(100, 'Máximo 100')
      .refine((v) => Math.round(v * 100) === v * 100, 'Máximo 2 decimales'),
    is_rare: z.boolean(),
    coins_amount: z.number().min(0),
    coins_currency_code: z.string(),
    freespin_quantity: z.number().int().min(0),
    freespin_game_id: z.string(),
    freebet_amount: z.number().min(0),
    freebet_currency: z.string(),
    cashback_percentage: z.number().min(0).max(100),
    cashback_max_amount: z.number().min(0),
    bonus_amount: z.number().min(0),
    bonus_currency: z.string(),
    chest_type_code: z.string(),
    avatar_ids: z.string(),
    manual_description: z.string(),
  })
  .superRefine((values, ctx) => {
    switch (values.reward_type) {
      case 'coins':
        if (values.coins_amount <= 0) {
          ctx.addIssue({ code: 'custom', path: ['coins_amount'], message: 'Monto requerido' });
        }
        if (!values.coins_currency_code.trim()) {
          ctx.addIssue({ code: 'custom', path: ['coins_currency_code'], message: 'Moneda requerida' });
        }
        break;
      case 'freespin':
        if (values.freespin_quantity < 1) {
          ctx.addIssue({ code: 'custom', path: ['freespin_quantity'], message: 'Cantidad mínima 1' });
        }
        break;
      case 'freebet':
        if (values.freebet_amount <= 0) {
          ctx.addIssue({ code: 'custom', path: ['freebet_amount'], message: 'Monto requerido' });
        }
        break;
      case 'cashback':
        if (values.cashback_percentage <= 0) {
          ctx.addIssue({ code: 'custom', path: ['cashback_percentage'], message: 'Porcentaje requerido' });
        }
        break;
      case 'bonus_deposit':
        if (values.bonus_amount <= 0) {
          ctx.addIssue({ code: 'custom', path: ['bonus_amount'], message: 'Monto requerido' });
        }
        break;
      case 'chest':
        if (!codeSchema.safeParse(values.chest_type_code.trim()).success) {
          ctx.addIssue({ code: 'custom', path: ['chest_type_code'], message: 'Code de cofre requerido' });
        }
        break;
      case 'avatar_pack':
        if (!values.avatar_ids.trim()) {
          ctx.addIssue({ code: 'custom', path: ['avatar_ids'], message: 'avatar_ids requerido' });
        }
        break;
      case 'manual':
        if (!values.manual_description.trim()) {
          ctx.addIssue({ code: 'custom', path: ['manual_description'], message: 'Descripción requerida' });
        }
        break;
    }
  });

export function defaultChestPrizeForm(): ChestPrizeFormValues {
  return {
    reward_type: 'coins',
    name: '',
    image_url: '',
    probability_percent: 10,
    is_rare: false,
    coins_amount: 100,
    coins_currency_code: 'main',
    freespin_quantity: 10,
    freespin_game_id: '',
    freebet_amount: 10,
    freebet_currency: 'USD',
    cashback_percentage: 10,
    cashback_max_amount: 50,
    bonus_amount: 50,
    bonus_currency: 'USD',
    chest_type_code: '',
    avatar_ids: '',
    manual_description: '',
  };
}

export function buildPrizeRewardConfig(values: ChestPrizeFormValues): ChestPrizeRewardConfig {
  switch (values.reward_type) {
    case 'coins':
      return { amount: values.coins_amount, currency_code: values.coins_currency_code.trim() };
    case 'freespin':
      return {
        quantity: values.freespin_quantity,
        ...(values.freespin_game_id.trim() ? { game_id: values.freespin_game_id.trim() } : {}),
      };
    case 'freebet':
      return { amount: values.freebet_amount, currency: values.freebet_currency.trim() };
    case 'cashback':
      return { percentage: values.cashback_percentage, max_amount: values.cashback_max_amount };
    case 'bonus_deposit':
      return { amount: values.bonus_amount, currency: values.bonus_currency.trim() };
    case 'chest':
      return { chest_type_code: values.chest_type_code.trim() };
    case 'avatar_pack':
      return {
        avatar_ids: values.avatar_ids
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
    case 'manual':
      return { description: values.manual_description.trim() };
    default:
      return { description: '' };
  }
}

export function prizeToForm(prize: ChestPrize): ChestPrizeFormValues {
  const base = defaultChestPrizeForm();
  const cfg = prize.reward_config as unknown as Record<string, unknown>;
  return {
    ...base,
    reward_type: prize.reward_type,
    name: prize.name,
    image_url: prize.image_url,
    probability_percent: prize.probability_percent,
    is_rare: prize.is_rare,
    coins_amount: Number(cfg.amount ?? 100),
    coins_currency_code: String(cfg.currency_code ?? 'main'),
    freespin_quantity: Number(cfg.quantity ?? 10),
    freespin_game_id: String(cfg.game_id ?? ''),
    freebet_amount: Number(cfg.amount ?? 10),
    freebet_currency: String(cfg.currency ?? 'USD'),
    cashback_percentage: Number(cfg.percentage ?? 10),
    cashback_max_amount: Number(cfg.max_amount ?? 50),
    bonus_amount: Number(cfg.amount ?? 50),
    bonus_currency: String(cfg.currency ?? 'USD'),
    chest_type_code: String(cfg.chest_type_code ?? ''),
    avatar_ids: Array.isArray(cfg.avatar_ids) ? (cfg.avatar_ids as string[]).join(', ') : '',
    manual_description: String(cfg.description ?? ''),
  };
}

export function formToPrizePayload(values: ChestPrizeFormValues): ChestPrizePayload {
  return {
    reward_type: values.reward_type,
    name: values.name.trim(),
    image_url: values.image_url.trim(),
    probability_percent: values.probability_percent,
    is_rare: values.is_rare,
    reward_config: buildPrizeRewardConfig(values),
  };
}

export function summarizeRewardConfig(prize: ChestPrize): string {
  const cfg = prize.reward_config as unknown as Record<string, unknown>;
  switch (prize.reward_type) {
    case 'coins':
      return `${cfg.amount} ${cfg.currency_code}`;
    case 'freespin':
      return `${cfg.quantity} spins${cfg.game_id ? ` · ${cfg.game_id}` : ''}`;
    case 'freebet':
      return `${cfg.amount} ${cfg.currency}`;
    case 'cashback':
      return `${cfg.percentage}% (max ${cfg.max_amount})`;
    case 'bonus_deposit':
      return `${cfg.amount} ${cfg.currency}`;
    case 'chest':
      return `cofre ${cfg.chest_type_code}`;
    case 'avatar_pack':
      return `${Array.isArray(cfg.avatar_ids) ? cfg.avatar_ids.length : 0} avatars`;
    case 'manual':
      return String(cfg.description ?? '').slice(0, 40);
    default:
      return '—';
  }
}

export function sumProbabilities(prizes: Pick<ChestPrize, 'probability_percent'>[]): number {
  return prizes.reduce((acc, p) => acc + p.probability_percent, 0);
}

export function probabilitiesValid(prizes: Pick<ChestPrize, 'probability_percent'>[]): boolean {
  return Math.abs(sumProbabilities(prizes) - 100) < 0.001;
}
