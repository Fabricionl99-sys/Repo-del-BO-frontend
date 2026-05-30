import { z } from 'zod';

import {
  formToRewardValue,
  rewardValueSchema,
  rewardValueToForm,
  summarizeReward,
} from '@/features/rewards/rewardForm';
import { coerceNumber } from '@/lib/format';
import type {
  ChestPrize,
  ChestPrizePayload,
  ChestPrizeRewardType,
} from '@/types/chests';
import type { RewardValue } from '@/types/rewards';

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
  name: string;
  image_url: string;
  probability_percent: number;
  is_rare: boolean;
  reward: RewardValue;
}

export const chestPrizeFormSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    image_url: z.string().url('URL inválida').or(z.literal('')),
    probability_percent: z
      .number()
      .min(0, 'Mínimo 0')
      .max(100, 'Máximo 100')
      .refine((v) => Math.round(v * 100) === v * 100, 'Máximo 2 decimales'),
    is_rare: z.boolean(),
    reward: rewardValueSchema,
  });

export function defaultChestPrizeForm(): ChestPrizeFormValues {
  return {
    name: '',
    image_url: '',
    probability_percent: 10,
    is_rare: false,
    reward: formToRewardValue(rewardValueToForm({ reward_type: 'coins', reward_config: { amount: 100, currency_code: 'main' } })),
  };
}

export function prizeToForm(prize: ChestPrize): ChestPrizeFormValues {
  return {
    name: prize.name ?? '',
    image_url: prize.image_url ?? '',
    probability_percent: coerceNumber(prize.probability_percent, 0),
    is_rare: Boolean(prize.is_rare),
    reward: {
      reward_type: prize.reward_type as RewardValue['reward_type'],
      reward_config: prize.reward_config as unknown as Record<string, unknown>,
    },
  };
}

export function formToPrizePayload(values: ChestPrizeFormValues): ChestPrizePayload {
  return {
    reward_type: values.reward.reward_type as ChestPrizeRewardType,
    name: values.name.trim(),
    image_url: values.image_url.trim(),
    probability_percent: values.probability_percent,
    is_rare: values.is_rare,
    reward_config: values.reward.reward_config as unknown as ChestPrize['reward_config'],
  };
}

export function summarizeRewardConfig(prize: ChestPrize): string {
  return summarizeReward({
    reward_type: prize.reward_type as RewardValue['reward_type'],
    reward_config: prize.reward_config as unknown as Record<string, unknown>,
  });
}

export function sumProbabilities(prizes: Pick<ChestPrize, 'probability_percent'>[]): number {
  return prizes.reduce((acc, p) => acc + coerceNumber(p.probability_percent), 0);
}

export function probabilitiesValid(prizes: Pick<ChestPrize, 'probability_percent'>[]): boolean {
  return Math.abs(sumProbabilities(prizes) - 100) < 0.001;
}
