import { z } from 'zod';

import type {
  RankingPrize,
  RankingPrizePayload,
  RankingPrizeRewardConfig,
  RankingPrizeRewardType,
} from '@/types/rankings';

export const RANKING_PRIZE_REWARD_TYPES: RankingPrizeRewardType[] = [
  'coins',
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'chest',
  'avatar_pack',
  'manual',
];

export interface RankingPrizeFormValues {
  position_from: number;
  position_to: number;
  reward_type: RankingPrizeRewardType;
  is_active: boolean;
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

export const rankingPrizeFormSchema = z
  .object({
    position_from: z.number().int().min(1, 'Mínimo 1'),
    position_to: z.number().int().min(1, 'Mínimo 1'),
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
    is_active: z.boolean(),
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
    if (values.position_from > values.position_to) {
      ctx.addIssue({ code: 'custom', path: ['position_to'], message: 'Debe ser >= position_from' });
    }
    switch (values.reward_type) {
      case 'coins':
        if (values.coins_amount <= 0) {
          ctx.addIssue({ code: 'custom', path: ['coins_amount'], message: 'Monto requerido' });
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
        if (!values.chest_type_code.trim()) {
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

export function defaultRankingPrizeForm(): RankingPrizeFormValues {
  return {
    position_from: 1,
    position_to: 1,
    reward_type: 'coins',
    is_active: true,
    coins_amount: 1000,
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

export function buildRankingPrizeRewardConfig(values: RankingPrizeFormValues): RankingPrizeRewardConfig {
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

export function prizeToForm(prize: RankingPrize): RankingPrizeFormValues {
  const base = defaultRankingPrizeForm();
  const cfg = prize.reward_config as unknown as Record<string, unknown>;
  return {
    ...base,
    position_from: prize.position_from,
    position_to: prize.position_to,
    reward_type: prize.reward_type,
    is_active: prize.is_active,
    coins_amount: Number(cfg.amount ?? 1000),
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

export function formToPrizePayload(values: RankingPrizeFormValues): RankingPrizePayload {
  return {
    position_from: values.position_from,
    position_to: values.position_to,
    reward_type: values.reward_type,
    is_active: values.is_active,
    reward_config: buildRankingPrizeRewardConfig(values),
  };
}

export function formatPositionRange(from: number, to: number): string {
  return from === to ? String(from) : `${from}-${to}`;
}

export function summarizeRankingReward(prize: RankingPrize): string {
  const cfg = prize.reward_config as unknown as Record<string, unknown>;
  switch (prize.reward_type) {
    case 'coins':
      return `${cfg.amount} ${cfg.currency_code}`;
    case 'freespin':
      return `${cfg.quantity} spins`;
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

export function rangesOverlap(
  a: { position_from: number; position_to: number },
  b: { position_from: number; position_to: number },
): boolean {
  return a.position_from <= b.position_to && b.position_from <= a.position_to;
}

export function findPrizeOverlap(
  prizes: Pick<RankingPrize, 'id' | 'position_from' | 'position_to'>[],
  candidate: { position_from: number; position_to: number },
  excludeId?: string,
): RankingPrize | undefined {
  return prizes.find(
    (p) =>
      p.id !== excludeId &&
      rangesOverlap(p, candidate),
  ) as RankingPrize | undefined;
}

export function prizeForPosition(
  prizes: RankingPrize[],
  position: number,
): RankingPrize | undefined {
  return prizes.find(
    (p) => p.is_active && position >= p.position_from && position <= p.position_to,
  );
}
