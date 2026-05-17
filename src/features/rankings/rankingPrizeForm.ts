import { z } from 'zod';

import { rewardValueSchema, summarizeReward } from '@/features/rewards/rewardForm';
import type { RankingPrize, RankingPrizePayload, RankingPrizeRewardType } from '@/types/rankings';
import type { RewardValue } from '@/types/rewards';

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
  is_active: boolean;
  reward: RewardValue;
}

export const rankingPrizeFormSchema = z
  .object({
    position_from: z.number().int().min(1, 'Mínimo 1'),
    position_to: z.number().int().min(1, 'Mínimo 1'),
    is_active: z.boolean(),
    reward: rewardValueSchema,
  })
  .superRefine((values, ctx) => {
    if (values.position_from > values.position_to) {
      ctx.addIssue({ code: 'custom', path: ['position_to'], message: 'Debe ser >= position_from' });
    }
  });

export function defaultRankingPrizeForm(): RankingPrizeFormValues {
  return {
    position_from: 1,
    position_to: 1,
    is_active: true,
    reward: { reward_type: 'coins', reward_config: { amount: 1000, currency_code: 'main' } },
  };
}

export function prizeToForm(prize: RankingPrize): RankingPrizeFormValues {
  return {
    position_from: prize.position_from,
    position_to: prize.position_to,
    is_active: prize.is_active,
    reward: {
      reward_type: prize.reward_type as RewardValue['reward_type'],
      reward_config: prize.reward_config as unknown as Record<string, unknown>,
    },
  };
}

export function formToPrizePayload(values: RankingPrizeFormValues): RankingPrizePayload {
  return {
    position_from: values.position_from,
    position_to: values.position_to,
    reward_type: values.reward.reward_type as RankingPrizeRewardType,
    is_active: values.is_active,
    reward_config: values.reward.reward_config as unknown as RankingPrize['reward_config'],
  };
}

export function formatPositionRange(from: number, to: number): string {
  return from === to ? String(from) : `${from}-${to}`;
}

export function summarizeRankingReward(prize: RankingPrize): string {
  return summarizeReward({
    reward_type: prize.reward_type as RewardValue['reward_type'],
    reward_config: prize.reward_config as unknown as Record<string, unknown>,
  });
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
  return prizes.find((p) => p.id !== excludeId && rangesOverlap(p, candidate)) as RankingPrize | undefined;
}

export function prizeForPosition(prizes: RankingPrize[], position: number): RankingPrize | undefined {
  return prizes.find((p) => p.is_active && position >= p.position_from && position <= p.position_to);
}
