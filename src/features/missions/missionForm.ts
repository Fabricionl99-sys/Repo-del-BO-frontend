import { z } from 'zod';

import { getTriggerDef, type MissionTriggerCode } from '@/features/missions/missionTriggers';
import { rewardValueSchema } from '@/features/rewards/rewardForm';
import type { Mission, MissionType } from '@/types/tier3';
import type { RewardValue } from '@/types/rewards';

export interface MissionTriggerConfig {
  amount_threshold?: number;
  count_threshold?: number;
  time_window_hours?: number;
  consecutive_days?: number;
  session_minutes?: number;
  win_streak_count?: number;
}

export interface MissionFormValues {
  name: string;
  description: string;
  iconKey: string;
  category: string;
  type: MissionType;
  trigger: MissionTriggerCode;
  targetValue: number;
  trigger_config: MissionTriggerConfig;
  xpReward: number;
  coinsReward: number;
  coinId: string;
  primaryReward: RewardValue;
  allPlayers: boolean;
}

const triggerSchema = z.enum([
  'bet_placed',
  'deposit_first',
  'deposit_recurring',
  'deposit_crypto',
  'withdraw_made',
  'kyc_completed',
  'email_verified',
  'phone_verified',
  'login_consecutive',
  'session_duration',
  'bet_amount_total',
  'bet_count_total',
  'win_streak',
  'play_sports',
  'play_casino',
  'play_live_casino',
  'play_slots',
  'play_poker',
  'play_bingo',
  'referral_signup',
  'referral_deposit',
  'birthday',
  'profile_completed',
  'avatar_changed',
  'chat_message',
]);

export const missionFormSchema = z
  .object({
    name: z.string().min(2, 'Nombre requerido').max(120),
    description: z.string().min(2, 'Descripción requerida').max(500),
    iconKey: z.string().min(1),
    category: z.string().min(1),
    type: z.enum(['daily', 'weekly', 'monthly', 'one_time', 'event']),
    trigger: triggerSchema,
    targetValue: z.number().min(1, 'Objetivo mínimo 1'),
    trigger_config: z.object({
      amount_threshold: z.number().min(0).optional(),
      count_threshold: z.number().int().min(1).optional(),
      time_window_hours: z.number().int().min(1).optional(),
      consecutive_days: z.number().int().min(1).optional(),
      session_minutes: z.number().int().min(1).optional(),
      win_streak_count: z.number().int().min(1).optional(),
    }),
    xpReward: z.number().min(0),
    coinsReward: z.number().min(0),
    coinId: z.string().min(1),
    primaryReward: rewardValueSchema,
    allPlayers: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const def = getTriggerDef(data.trigger);
    if (!def) return;
    for (const field of def.configFields) {
      const val = data.trigger_config[field];
      if (val === undefined || val === null || (typeof val === 'number' && val <= 0)) {
        ctx.addIssue({
          code: 'custom',
          message: `${field} requerido para este trigger`,
          path: ['trigger_config', field],
        });
      }
    }
  });

export function defaultMissionForm(): MissionFormValues {
  return {
    name: '',
    description: '',
    iconKey: '🎯',
    category: 'Apuestas',
    type: 'weekly',
    trigger: 'bet_placed',
    targetValue: 10,
    trigger_config: {},
    xpReward: 500,
    coinsReward: 0,
    coinId: 'coin_oro',
    primaryReward: { reward_type: 'xp', reward_config: { amount: 500 } },
    allPlayers: true,
  };
}

export function missionToForm(m: Mission): MissionFormValues {
  const xp = m.rewards.find((r) => r.type === 'xp');
  const coins = m.rewards.find((r) => r.type === 'coins');
  return {
    name: m.name,
    description: m.description,
    iconKey: m.iconKey,
    category: m.category,
    type: m.type,
    trigger: (m.objective.event as MissionTriggerCode) ?? 'bet_placed',
    targetValue: m.objective.targetValue,
    trigger_config: (m.objective.trigger_config as MissionTriggerConfig) ?? {},
    xpReward: xp?.xpAmount ?? 0,
    coinsReward: coins?.coinsAmount ?? 0,
    coinId: coins?.coinId ?? 'coin_oro',
    primaryReward: xp
      ? { reward_type: 'xp', reward_config: { amount: xp.xpAmount ?? 0 } }
      : coins
        ? { reward_type: 'coins', reward_config: { amount: coins.coinsAmount ?? 0, currency_code: coins.coinId ?? 'main' } }
        : { reward_type: 'xp', reward_config: { amount: 0 } },
    allPlayers: m.targeting.allPlayers,
  };
}

export function formToMissionPayload(
  values: MissionFormValues,
  opts: { id?: string; status: Mission['status']; daysOfWeek: number[] },
): Partial<Mission> {
  const rewards = [];
  const pr = values.primaryReward;
  if (pr.reward_type === 'xp' && Number(pr.reward_config.amount ?? 0) > 0) {
    rewards.push({ type: 'xp' as const, xpAmount: Number(pr.reward_config.amount) });
  } else if (pr.reward_type === 'coins' && Number(pr.reward_config.amount ?? 0) > 0) {
    rewards.push({
      type: 'coins' as const,
      coinsAmount: Number(pr.reward_config.amount),
      coinId: String(pr.reward_config.currency_code ?? values.coinId),
    });
  } else if (pr.reward_type === 'chest') {
    rewards.push({ type: 'chest' as const, chestId: String(pr.reward_config.chest_type_code ?? '') });
  } else if (['freespin', 'freebet', 'cashback', 'bonus_deposit'].includes(pr.reward_type)) {
    const bonusTypeMap = {
      freespin: 'free_spins',
      freebet: 'free_bet',
      cashback: 'deposit_match',
      bonus_deposit: 'deposit_match',
    } as const;
    rewards.push({
      type: 'bonus' as const,
      bonusType: bonusTypeMap[pr.reward_type as keyof typeof bonusTypeMap] as 'free_spins' | 'free_bet' | 'deposit_match',
      bonusConfig: { bonus_id: pr.reward_config.bonus_id },
    });
  } else if (pr.reward_type === 'manual') {
    rewards.push({
      type: 'bonus' as const,
      bonusType: 'deposit_match' as const,
      bonusConfig: { description: String(pr.reward_config.description ?? '') },
    });
  }

  return {
    id: opts.id,
    name: values.name.trim(),
    description: values.description.trim(),
    iconKey: values.iconKey,
    category: values.category,
    type: values.type,
    objective: {
      type: 'counter',
      event: values.trigger,
      targetValue: values.targetValue,
      filters: [],
      trigger_config: values.trigger_config as Record<string, number>,
    },
    rewards,
    availability: { alwaysAvailable: false, daysOfWeek: opts.daysOfWeek },
    targeting: { allPlayers: values.allPlayers },
    status: opts.status,
  };
}
