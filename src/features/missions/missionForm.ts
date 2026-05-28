import { z } from 'zod';

import {
  actionFromBackend,
  actionToBackendPayload,
  MISSION_ACTION_TYPES,
  newMissionAction,
  type MissionActionFormValues,
  type MissionActionType,
} from '@/features/missions/missionActions';
import { rewardValueSchema } from '@/features/rewards/rewardForm';
import type { RewardValue } from '@/types/rewards';
import {
  availabilityWindowToIso,
  emptyAvailabilityWindow,
  isoToAvailabilityWindow,
  validateAvailabilityWindow,
} from '@/features/missions/missionAvailability';

export type { MissionActionFormValues, MissionActionType };

const actionTypeEnum = z.enum(MISSION_ACTION_TYPES);

const missionActionSchema = z
  .object({
    type: actionTypeEnum,
    amount: z.number().optional(),
    currency_code: z.string().optional(),
    aggregation_mode: z.enum(['individual', 'cumulative']).optional(),
    category_slug: z.string().optional(),
    min_amount: z.number().optional(),
    count: z.number().int().optional(),
  })
  .superRefine((action, ctx) => {
    if (action.type === 'bet_amount' || action.type === 'deposit_amount') {
      if (!action.amount || action.amount <= 0) {
        ctx.addIssue({ code: 'custom', message: 'Ingresá un monto mayor a 0', path: ['amount'] });
      }
    }
    if (action.type === 'bet_category' && !action.category_slug?.trim()) {
      ctx.addIssue({ code: 'custom', message: 'Elegí una categoría', path: ['category_slug'] });
    }
    if (action.type === 'cumulative_bets' && (!action.count || action.count < 1)) {
      ctx.addIssue({ code: 'custom', message: 'Cantidad mínima 1', path: ['count'] });
    }
  });

export const missionFormSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(120),
  description: z.string().max(500).default(''),
  code: z.string().max(64).default(''),
  type: z.enum(['daily', 'escalonada']),
  daily_validity_hours: z.number().int().min(1).max(168),
  timezone: z.string().min(1),
  restrictions: z.object({
    min_level: z.number().int().min(1).nullable(),
    vip_only: z.boolean(),
    new_players_only: z.boolean(),
  }),
  actions: z.array(missionActionSchema).min(1, 'Agregá al menos un requisito'),
  primaryReward: rewardValueSchema,
  availability_window: z
    .object({
      from_date: z.string().default(''),
      from_time: z.string().default(''),
      until_date: z.string().default(''),
      until_time: z.string().default(''),
    })
    .default(emptyAvailabilityWindow()),
}).superRefine((values, ctx) => {
  const err = validateAvailabilityWindow(values.availability_window);
  if (err) {
    ctx.addIssue({ code: 'custom', message: err, path: ['availability_window', 'until_date'] });
  }
});

export type MissionFormValues = z.infer<typeof missionFormSchema>;

export function defaultMissionForm(): MissionFormValues {
  return {
    name: '',
    description: '',
    code: '',
    type: 'daily',
    daily_validity_hours: 24,
    timezone: 'UTC',
    restrictions: {
      min_level: null,
      vip_only: false,
      new_players_only: false,
    },
    actions: [newMissionAction('bet_amount')],
    primaryReward: { reward_type: 'xp', reward_config: { amount: 500 } },
    availability_window: emptyAvailabilityWindow(),
  };
}

function slugifyCode(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'mission'
  );
}

function buildRewardsFromForm(reward: RewardValue): Array<Record<string, unknown>> {
  const REWARD_KIND_TO_ID: Record<string, number> = {
    freespin: 1,
    freebet: 2,
    cashback: 3,
    bonus_deposit: 4,
    manual: 5,
    chest: 6,
    coins: 7,
    avatar_pack: 8,
    wheel_spin: 9,
  };

  const pr = reward;
  let kind = 'manual';
  let cfg: Record<string, unknown> = {};

  if (pr.reward_type === 'xp') {
    kind = 'manual';
    cfg = { kind: 'manual', description: `${Number(pr.reward_config.amount ?? 0)} XP bonus`, value_usd: 0 };
  } else if (pr.reward_type === 'coins') {
    kind = 'coins';
    cfg = {
      kind: 'coins',
      amount: Math.max(1, Math.floor(Number(pr.reward_config.amount ?? 1))),
      currency_code: String(pr.reward_config.currency_code ?? 'main'),
    };
  } else if (pr.reward_type === 'chest') {
    kind = 'chest';
    cfg = { kind: 'chest', chest_type_code: String(pr.reward_config.chest_type_code ?? 'default_chest') };
  } else if (['freespin', 'freebet', 'cashback', 'bonus_deposit'].includes(pr.reward_type)) {
    kind = pr.reward_type;
    cfg = { kind: pr.reward_type, bonus_id: String(pr.reward_config.bonus_id ?? '') };
  } else if (pr.reward_type === 'manual') {
    kind = 'manual';
    cfg = {
      kind: 'manual',
      description: String(pr.reward_config.description ?? 'Premio manual'),
      value_usd: 0,
    };
  }

  return [
    {
      reward_type_id: REWARD_KIND_TO_ID[kind] ?? 5,
      reward_config: cfg,
      display_order: 0,
    },
  ];
}

export function formToBackendPayload(
  values: MissionFormValues,
  opts: { existingCode?: string },
): Record<string, unknown> {
  const code =
    opts.existingCode?.trim() ||
    values.code.trim() ||
    `${slugifyCode(values.name)}_${Date.now().toString(36)}`.slice(0, 64);

  const { available_from, available_until } = availabilityWindowToIso(values.availability_window);

  return {
    type: values.type,
    code: code.slice(0, 64),
    name: values.name.trim().slice(0, 255),
    description: values.description.trim() || null,
    icon_url: null,
    available_from,
    available_until,
    restrictions: {
      min_level: values.restrictions.min_level,
      vip_only: values.restrictions.vip_only,
      new_players_only: values.restrictions.new_players_only,
    },
    daily_validity_hours: values.daily_validity_hours,
    timezone: values.timezone,
    max_active_simultaneous_override: null,
    steps: [
      {
        name: null,
        description: null,
        actions: values.actions.map((a, i) => ({
          ...actionToBackendPayload(a),
          display_order: i,
        })),
        rewards: buildRewardsFromForm(values.primaryReward),
      },
    ],
  };
}

export function backendToForm(raw: Record<string, unknown>): MissionFormValues {
  const steps = Array.isArray(raw.steps) ? (raw.steps as Array<Record<string, unknown>>) : [];
  const firstStep = steps[0] ?? {};
  const actionsRaw = Array.isArray(firstStep.actions) ? (firstStep.actions as Array<Record<string, unknown>>) : [];
  const rewardsRaw = Array.isArray(firstStep.rewards) ? (firstStep.rewards as Array<Record<string, unknown>>) : [];

  let primaryReward: RewardValue = { reward_type: 'xp', reward_config: { amount: 500 } };
  const firstReward = rewardsRaw[0];
  if (firstReward) {
    const cfg = (firstReward.reward_config as Record<string, unknown>) ?? {};
    const kind = String(cfg.kind ?? 'manual');
    if (kind === 'coins') {
      primaryReward = {
        reward_type: 'coins',
        reward_config: { amount: Number(cfg.amount ?? 0), currency_code: String(cfg.currency_code ?? 'main') },
      };
    } else if (kind === 'chest') {
      primaryReward = {
        reward_type: 'chest',
        reward_config: { chest_type_code: String(cfg.chest_type_code ?? ''), quantity: 1 },
      };
    } else if (['freespin', 'freebet', 'cashback', 'bonus_deposit'].includes(kind)) {
      primaryReward = {
        reward_type: kind as RewardValue['reward_type'],
        reward_config: { bonus_id: String(cfg.bonus_id ?? '') },
      };
    } else if (kind === 'manual') {
      const desc = String(cfg.description ?? '');
      const xpMatch = desc.match(/^(\d+)\s*XP/i);
      primaryReward = xpMatch
        ? { reward_type: 'xp', reward_config: { amount: Number(xpMatch[1]) } }
        : { reward_type: 'manual', reward_config: { description: desc } };
    }
  }

  const restrictions = (raw.restrictions as Record<string, unknown>) ?? {};

  return {
    name: String(raw.name ?? ''),
    description: typeof raw.description === 'string' ? raw.description : '',
    code: String(raw.code ?? ''),
    type: raw.type === 'escalonada' ? 'escalonada' : 'daily',
    daily_validity_hours:
      typeof raw.daily_validity_hours === 'number' ? (raw.daily_validity_hours as number) : 24,
    timezone: typeof raw.timezone === 'string' ? raw.timezone : 'UTC',
    restrictions: {
      min_level: typeof restrictions.min_level === 'number' ? restrictions.min_level : null,
      vip_only: Boolean(restrictions.vip_only),
      new_players_only: Boolean(restrictions.new_players_only),
    },
    actions: actionsRaw.length ? actionsRaw.map((a) => actionFromBackend(a)) : [newMissionAction('login')],
    primaryReward,
    availability_window: isoToAvailabilityWindow(
      typeof raw.available_from === 'string' ? raw.available_from : null,
      typeof raw.available_until === 'string' ? raw.available_until : null,
    ),
  };
}
