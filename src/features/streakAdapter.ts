/**
 * Sprint #6 fix — adapter BO ↔ backend para streak_programs.
 *
 * BO model (flat):
 *   { name, activity_type: 'login'|'deposit_individual'|'deposit_cumulative'|'bet_individual'|'bet_cumulative',
 *     activity_config: union según type, timezone, reset_policy: 'strict'|'grace'|'soft_reset',
 *     reset_policy_config: union, daily_micro_reward: {type, config}|null,
 *     milestones: [{day_number, reward_type, reward_config}] }
 *
 * Backend model (nested discriminated unions):
 *   { name, timezone,
 *     activity: { type: 'login'|'deposit'|'bet', threshold_count?|threshold_amount+aggregation_mode },
 *     reset_policy: { type, grace_days },
 *     micro_reward: { reward_type_id, reward_config{kind} } | null,
 *     milestones: [{ day_number, reward_type_id, reward_config{kind} }] }
 */
import type {
  StreakProgram,
  StreakRewardConfig,
  StreakRewardType,
} from '@/types/streakPrograms';

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
const REWARD_ID_TO_KIND: Record<number, string> = Object.fromEntries(
  Object.entries(REWARD_KIND_TO_ID).map(([k, v]) => [v, k]),
);

const VALID_KINDS = new Set(Object.keys(REWARD_KIND_TO_ID));

function buildRewardForBackend(
  rewardType: StreakRewardType,
  cfg: StreakRewardConfig,
  fallbackDescription: string,
): { reward_type_id: number; reward_config: Record<string, unknown> } {
  const rawCfg = (cfg ?? {}) as Record<string, unknown>;
  let kind: string;
  let payload: Record<string, unknown>;
  if (rewardType === 'xp') {
    const amount = Number(rawCfg.amount ?? 0);
    kind = 'manual';
    payload = { kind: 'manual', description: `${amount} XP bonus`, value_usd: 0 };
  } else if (rewardType === 'coins') {
    const amount = Math.max(1, Math.floor(Number(rawCfg.amount ?? 1)));
    const code = String(rawCfg.coin_code ?? 'main');
    kind = 'coins';
    payload = { kind: 'coins', amount, currency_code: code };
  } else if (rewardType === 'chest') {
    kind = 'chest';
    payload = { kind: 'chest', chest_type_code: String(rawCfg.chest_id ?? 'default_chest') };
  } else if (rewardType === 'manual') {
    kind = 'manual';
    payload = {
      kind: 'manual',
      description: String(rawCfg.description ?? fallbackDescription),
      value_usd: 0,
    };
  } else if (rewardType === 'freespin') {
    kind = 'freespin';
    payload = rawCfg.bonus_id
      ? { kind: 'freespin', bonus_id: String(rawCfg.bonus_id) }
      : {
          kind: 'freespin',
          quantity: Math.max(1, Math.floor(Number(rawCfg.quantity ?? 1))),
          game_code: String(rawCfg.game_id ?? 'default_game'),
        };
  } else if (rewardType === 'freebet') {
    kind = 'freebet';
    payload = rawCfg.bonus_id
      ? { kind: 'freebet', bonus_id: String(rawCfg.bonus_id) }
      : {
          kind: 'freebet',
          amount: Number(rawCfg.amount ?? 1),
          currency: String(rawCfg.currency ?? 'USD').toUpperCase().slice(0, 3),
        };
  } else if (rewardType === 'cashback') {
    kind = 'cashback';
    payload = rawCfg.bonus_id
      ? { kind: 'cashback', bonus_id: String(rawCfg.bonus_id) }
      : {
          kind: 'cashback',
          percentage: Number(rawCfg.percentage ?? 5),
          valid_for_days: 7,
        };
  } else if (rewardType === 'bonus_deposit') {
    kind = 'bonus_deposit';
    payload = rawCfg.bonus_id
      ? { kind: 'bonus_deposit', bonus_id: String(rawCfg.bonus_id) }
      : {
          kind: 'bonus_deposit',
          amount: Number(rawCfg.amount ?? 1),
          currency: String(rawCfg.currency ?? 'USD').toUpperCase().slice(0, 3),
        };
  } else if (VALID_KINDS.has(String(rewardType))) {
    kind = String(rewardType);
    payload = { ...rawCfg, kind };
  } else {
    kind = 'manual';
    payload = { kind: 'manual', description: fallbackDescription, value_usd: 0 };
  }
  return {
    reward_type_id: REWARD_KIND_TO_ID[kind] ?? 5,
    reward_config: payload,
  };
}

function buildActivity(
  activityType: string,
  activityConfig: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const cfg = activityConfig ?? {};
  if (activityType === 'login') {
    return {
      type: 'login',
      threshold_count: Math.max(1, Math.floor(Number(cfg.minimum_logins_per_day ?? 1))),
    };
  }
  if (activityType === 'deposit_individual' || activityType === 'deposit_cumulative') {
    const amount = Number(
      cfg.minimum_amount_per_deposit ?? cfg.minimum_amount_total_per_day ?? 1,
    );
    return {
      type: 'deposit',
      threshold_amount: Math.max(0.01, amount),
      aggregation_mode: activityType === 'deposit_cumulative' ? 'cumulative' : 'individual',
    };
  }
  if (activityType === 'bet_individual' || activityType === 'bet_cumulative') {
    const amount = Number(
      cfg.minimum_amount_per_bet ?? cfg.minimum_amount_total_per_day ?? 1,
    );
    return {
      type: 'bet',
      threshold_amount: Math.max(0.01, amount),
      aggregation_mode: activityType === 'bet_cumulative' ? 'cumulative' : 'individual',
    };
  }
  // fallback login
  return { type: 'login', threshold_count: 1 };
}

function buildResetPolicy(
  policy: string,
  config: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const cfg = config ?? {};
  if (policy === 'strict') {
    return { type: 'strict', grace_days: 0 };
  }
  if (policy === 'grace') {
    const days = Math.min(30, Math.max(1, Math.floor(Number(cfg.grace_days_per_rolling_window ?? 1))));
    return { type: 'grace', grace_days: days };
  }
  if (policy === 'soft_reset') {
    const days = Math.min(30, Math.max(1, Math.floor(Number(cfg.days_lost_on_break ?? cfg.days_lost_after_grace ?? 1))));
    return { type: 'soft_reset', grace_days: days };
  }
  return { type: 'strict', grace_days: 0 };
}

export function adaptStreakForBackend(payload: Partial<StreakProgram>): Record<string, unknown> {
  const milestonesRaw = Array.isArray(payload.milestones) ? payload.milestones : [];
  const milestones = milestonesRaw.map((m) => {
    const reward = buildRewardForBackend(
      m.reward_type,
      m.reward_config,
      `Milestone día ${m.day_number}`,
    );
    return {
      day_number: Math.max(1, Math.floor(Number(m.day_number ?? 1))),
      reward_type_id: reward.reward_type_id,
      reward_config: reward.reward_config,
    };
  });

  const micro = payload.daily_micro_reward
    ? (() => {
        const r = buildRewardForBackend(
          payload.daily_micro_reward.type,
          payload.daily_micro_reward.config,
          'Premio diario',
        );
        return {
          reward_type_id: r.reward_type_id,
          reward_config: r.reward_config,
        };
      })()
    : null;

  return {
    name: (payload.name ?? '').trim() || 'Programa de racha',
    activity: buildActivity(
      String(payload.activity_type ?? 'login'),
      payload.activity_config as Record<string, unknown> | undefined,
    ),
    timezone: payload.timezone || 'UTC',
    reset_policy: buildResetPolicy(
      String(payload.reset_policy ?? 'strict'),
      payload.reset_policy_config as Record<string, unknown> | undefined,
    ),
    micro_reward: micro,
    milestones,
  };
}

/**
 * Normaliza la response del backend al shape rico de StreakProgram (BO).
 * Backend devuelve `activity_type` + threshold_* sueltos en el row;
 * el BO espera el shape combinado.
 */
export function normalizeBackendStreak(raw: Record<string, unknown>): StreakProgram {
  const activityType = String(raw.activity_type ?? 'login');
  const aggMode = String(raw.activity_aggregation_mode ?? 'individual');
  let boActivityType: StreakProgram['activity_type'];
  let activityConfig: Record<string, unknown>;
  if (activityType === 'login') {
    boActivityType = 'login';
    activityConfig = {
      minimum_logins_per_day: Number(raw.activity_threshold_count ?? 1),
    };
  } else if (activityType === 'deposit') {
    boActivityType = aggMode === 'cumulative' ? 'deposit_cumulative' : 'deposit_individual';
    const amount = Number(raw.activity_threshold_amount ?? 1);
    activityConfig =
      aggMode === 'cumulative'
        ? { minimum_amount_total_per_day: amount }
        : { minimum_amount_per_deposit: amount };
  } else {
    // bet
    boActivityType = aggMode === 'cumulative' ? 'bet_cumulative' : 'bet_individual';
    const amount = Number(raw.activity_threshold_amount ?? 1);
    activityConfig =
      aggMode === 'cumulative'
        ? { minimum_amount_total_per_day: amount, category_filter: null }
        : { minimum_amount_per_bet: amount, category_filter: null };
  }

  const resetType = String(raw.reset_policy_type ?? 'strict') as StreakProgram['reset_policy'];
  const graceDays = Number(raw.reset_policy_grace_days ?? 0);
  let resetPolicyConfig: Record<string, unknown>;
  if (resetType === 'strict') resetPolicyConfig = {};
  else if (resetType === 'grace')
    resetPolicyConfig = {
      grace_days_per_rolling_window: graceDays,
      after_grace_action: 'reset_to_zero',
    };
  else resetPolicyConfig = { days_lost_on_break: graceDays };

  const microRewardTypeId =
    typeof raw.micro_reward_type_id === 'number' ? (raw.micro_reward_type_id as number) : null;
  const microRewardCfgRaw = (raw.micro_reward_config as Record<string, unknown> | null) ?? null;
  const dailyMicro =
    microRewardTypeId && microRewardCfgRaw
      ? {
          type: (REWARD_ID_TO_KIND[microRewardTypeId] ??
            'manual') as StreakProgram['daily_micro_reward'] extends infer X
            ? X extends { type: infer T }
              ? T
              : StreakRewardType
            : StreakRewardType,
          config: microRewardCfgRaw as unknown as StreakRewardConfig,
        }
      : null;

  const milestonesRaw = Array.isArray(raw.milestones)
    ? (raw.milestones as Array<Record<string, unknown>>)
    : [];
  const milestones = milestonesRaw.map((m) => {
    const rewardTypeId = Number(m.reward_type_id ?? 5);
    return {
      day_number: Number(m.day_number ?? 1),
      reward_type: (REWARD_ID_TO_KIND[rewardTypeId] ?? 'manual') as StreakRewardType,
      reward_config: (m.reward_config as unknown as StreakRewardConfig) ?? ({} as StreakRewardConfig),
    };
  });

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: typeof raw.description === 'string' ? raw.description : undefined,
    activity_type: boActivityType,
    activity_config: activityConfig as StreakProgram['activity_config'],
    timezone: String(raw.timezone ?? 'UTC'),
    reset_policy: resetType,
    reset_policy_config: resetPolicyConfig as StreakProgram['reset_policy_config'],
    daily_micro_reward: dailyMicro as StreakProgram['daily_micro_reward'],
    milestones,
    is_active: Boolean(raw.is_active),
    activated_at: typeof raw.activated_at === 'string' ? raw.activated_at : undefined,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    updated_at: typeof raw.updated_at === 'string' ? raw.updated_at : undefined,
  };
}
