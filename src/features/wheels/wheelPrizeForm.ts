import { z } from 'zod';

import { formToRewardValue, rewardValueSchema, rewardValueToForm } from '@/features/rewards/rewardForm';
import type { WheelPrize, WheelPrizePayload } from '@/types/wheels';
import type { RewardValue } from '@/types/rewards';

export interface WheelPrizeFormValues {
  id?: string;
  name: string;
  image_url: string;
  probability_percent: number;
  color_theme: string;
  is_rare: boolean;
  reward: RewardValue;
}

export const wheelPrizeFormSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
  image_url: z.string().url('URL inválida').or(z.literal('')),
  probability_percent: z
    .number()
    .min(0, 'Mínimo 0')
    .max(100, 'Máximo 100')
    .refine((v) => Math.round(v * 100) === v * 100, 'Máximo 2 decimales'),
  color_theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido'),
  is_rare: z.boolean(),
  reward: rewardValueSchema,
});

export function defaultWheelPrizeForm(colorTheme = '#FFD700'): WheelPrizeFormValues {
  return {
    name: '',
    image_url: '',
    probability_percent: 10,
    color_theme: colorTheme,
    is_rare: false,
    reward: formToRewardValue(
      rewardValueToForm({ reward_type: 'coins', reward_config: { amount: 100, currency_code: 'main' } }),
    ),
  };
}

export function prizeToForm(prize: WheelPrize): WheelPrizeFormValues {
  return {
    id: prize.id,
    name: prize.name,
    image_url: prize.image_url,
    probability_percent: prize.probability_percent,
    color_theme: prize.color_theme,
    is_rare: prize.is_rare,
    reward: {
      reward_type: prize.reward_type,
      reward_config: prize.reward_config,
    },
  };
}

export function formToPrizePayload(values: WheelPrizeFormValues, displayOrder: number): WheelPrizePayload {
  return {
    name: values.name.trim(),
    image_url: values.image_url.trim(),
    probability_percent: values.probability_percent,
    color_theme: values.color_theme,
    is_rare: values.is_rare,
    reward_type: values.reward.reward_type,
    reward_config: values.reward.reward_config,
    display_order: displayOrder,
  };
}

export function sumProbabilities(prizes: Pick<WheelPrize, 'probability_percent'>[]): number {
  return prizes.reduce((acc, p) => acc + p.probability_percent, 0);
}

export function probabilitiesValid(prizes: Pick<WheelPrize, 'probability_percent'>[]): boolean {
  return Math.abs(sumProbabilities(prizes) - 100) < 0.001;
}

export function probabilitySummary(prizes: Pick<WheelPrize, 'probability_percent'>[]): {
  total: number;
  valid: boolean;
  missing: number;
} {
  const total = sumProbabilities(prizes);
  const valid = probabilitiesValid(prizes);
  return { total, valid, missing: Math.max(0, 100 - total) };
}
