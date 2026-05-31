import { z } from 'zod';

import { rewardValueSchema } from '@/features/rewards/rewardForm';
import type {
  ParticipationCostType,
  PoolAudienceType,
  PoolMatch,
  PoolRewardConfig,
  PredictionOption,
  PredictionPool,
  PredictionPoolPayload,
  PredictionRewardConfig,
  PredictionRewardType,
  RewardStructureType,
} from '@/types/predictions';
import type { RewardValue } from '@/types/rewards';

export const POOL_STATUSES = ['draft', 'open', 'closed', 'resolving', 'resolved', 'cancelled'] as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  open: 'Activo',
  closed: 'Cerrado',
  resolving: 'Resolviendo',
  resolved: 'Resuelto',
  cancelled: 'Archivado',
};

export const REWARD_STRUCTURE_LABELS: Record<RewardStructureType, string> = {
  all_correct_only: 'Solo si acierta TODOS',
  by_hits_tiers: 'Por cantidad de aciertos',
  top_positions: 'Top N posiciones',
  every_correct_gives: 'Cada acierto da premio',
};

export const AUDIENCE_LABELS: Record<PoolAudienceType, string> = {
  all: 'Todos los jugadores',
  vip_only: 'Solo VIP',
  new_players: 'Jugadores nuevos',
  by_level: 'Por nivel',
  specific_players: 'Jugadores específicos',
  by_country: 'Por país',
};

export interface MatchOptionFormValues {
  text: string;
  description: string;
  image_url: string;
}

export interface MatchFormValues {
  name: string;
  description: string;
  image_url: string;
  /** Opcional — label visual BO, backend hardcodea 'multiple_choice'. */
  prediction_type?: string;
  options: MatchOptionFormValues[];
}

export interface TierRewardFormValues {
  label: string;
  min_hits_percent: number;
  reward: RewardValue;
}

export interface PositionRewardFormValues {
  label: string;
  position_from: number;
  position_to: number;
  reward: RewardValue;
}

export interface PoolFormValues {
  code: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  opens_at: string;
  closes_at: string;
  resolves_at: string;
  participation_type: ParticipationCostType;
  cost_in_coins: number;
  reward_structure_type: RewardStructureType;
  jackpot_reward: RewardValue;
  tier_rewards: TierRewardFormValues[];
  position_rewards: PositionRewardFormValues[];
  per_hit_reward: RewardValue;
  max_predictions_per_player: number;
  is_visible_to_players: boolean;
  target_audience: PoolAudienceType;
  min_level: number | null;
  max_level: number | null;
  countries: string;
  player_ids: string;
  vip_only: boolean;
  new_players_only: boolean;
  events: MatchFormValues[];
}

const optionSchema = z.object({
  text: z.string().min(1, 'Texto requerido').max(120),
  description: z.string().max(500),
  image_url: z.string().url('URL inválida').or(z.literal('')),
});

const matchSchema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(120),
  description: z.string().max(500),
  image_url: z.string().url('URL inválida').or(z.literal('')),
  // Opcional — el backend no usa este campo (hardcodea 'multiple_choice');
  // sirve solo como label visual en el BO. Operador puede dejarlo vacío.
  prediction_type: z.string().max(64).default(''),
  options: z.array(optionSchema).min(2, 'Mínimo 2 opciones'),
});

const codeSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(64)
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

export const poolFormSchema = z
  .object({
    code: codeSchema,
    name: z.string().min(2).max(120),
    description: z.string().max(2000),
    image_url: z.string().url('URL inválida').or(z.literal('')),
    category: z.string().min(1).max(64),
    opens_at: z.string().min(1),
    closes_at: z.string().min(1),
    resolves_at: z.string().min(1),
    participation_type: z.enum(['free', 'paid']),
    cost_in_coins: z.number().int().min(0),
    reward_structure_type: z.enum([
      'all_correct_only',
      'by_hits_tiers',
      'top_positions',
      'every_correct_gives',
    ]),
    jackpot_reward: rewardValueSchema,
    tier_rewards: z.array(
      z.object({
        label: z.string().min(1),
        min_hits_percent: z.number().min(1).max(100),
        reward: rewardValueSchema,
      }),
    ),
    position_rewards: z.array(
      z.object({
        label: z.string().min(1),
        position_from: z.number().int().min(1),
        position_to: z.number().int().min(1),
        reward: rewardValueSchema,
      }),
    ),
    per_hit_reward: rewardValueSchema,
    max_predictions_per_player: z.number().int().min(1).max(10),
    is_visible_to_players: z.boolean(),
    target_audience: z.enum(['all', 'vip_only', 'new_players', 'by_level', 'specific_players', 'by_country']),
    min_level: z.number().int().min(1).nullable(),
    max_level: z.number().int().min(1).nullable(),
    countries: z.string(),
    player_ids: z.string(),
    vip_only: z.boolean(),
    new_players_only: z.boolean(),
    events: z.array(matchSchema).min(1, 'Mínimo 1 partido'),
  })
  .superRefine((data, ctx) => {
    const opens = new Date(data.opens_at).getTime();
    const closes = new Date(data.closes_at).getTime();
    const resolves = new Date(data.resolves_at).getTime();
    if (opens >= closes) {
      ctx.addIssue({ code: 'custom', message: 'Apertura debe ser anterior al cierre', path: ['closes_at'] });
    }
    if (closes >= resolves) {
      ctx.addIssue({ code: 'custom', message: 'Cierre debe ser anterior a resolución', path: ['resolves_at'] });
    }
    if (data.participation_type === 'paid' && data.cost_in_coins <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Costo debe ser mayor a 0', path: ['cost_in_coins'] });
    }
  });

function rewardToConfig(r: RewardValue): PredictionRewardConfig {
  return {
    reward_type: r.reward_type as PredictionRewardType,
    reward_config: r.reward_config,
    currency_mode: r.currency_mode ?? 'auto_usd',
  };
}

function configToReward(c: PredictionRewardConfig): RewardValue {
  return {
    reward_type: c.reward_type,
    reward_config: c.reward_config,
    currency_mode: c.currency_mode,
  };
}

const defaultReward: RewardValue = {
  reward_type: 'coins',
  reward_config: { amount: 500, currency_code: 'main' },
  currency_mode: 'auto_usd',
};

export function defaultPoolForm(): PoolFormValues {
  const now = new Date();
  const opens = new Date(now.getTime() + 3600000);
  const closes = new Date(now.getTime() + 86400000 * 2);
  const resolves = new Date(now.getTime() + 86400000 * 3);
  return {
    code: '',
    name: '',
    description: '',
    image_url: '',
    category: '',
    opens_at: opens.toISOString().slice(0, 16),
    closes_at: closes.toISOString().slice(0, 16),
    resolves_at: resolves.toISOString().slice(0, 16),
    participation_type: 'free',
    cost_in_coins: 100,
    reward_structure_type: 'all_correct_only',
    jackpot_reward: { ...defaultReward, reward_config: { amount: 5000, currency_code: 'main' } },
    tier_rewards: [
      { label: '100% aciertos', min_hits_percent: 100, reward: defaultReward },
      { label: '>= 80% aciertos', min_hits_percent: 80, reward: defaultReward },
      { label: '>= 50% aciertos', min_hits_percent: 50, reward: defaultReward },
    ],
    position_rewards: [
      { label: 'Posición 1', position_from: 1, position_to: 1, reward: defaultReward },
      { label: 'Posiciones 2-3', position_from: 2, position_to: 3, reward: defaultReward },
    ],
    per_hit_reward: defaultReward,
    max_predictions_per_player: 1,
    is_visible_to_players: true,
    target_audience: 'all',
    min_level: null,
    max_level: null,
    countries: '',
    player_ids: '',
    vip_only: false,
    new_players_only: false,
    events: [
      {
        name: '',
        description: '',
        image_url: '',
        prediction_type: '',
        options: [
          { text: '', description: '', image_url: '' },
          { text: '', description: '', image_url: '' },
        ],
      },
    ],
  };
}

function rewardConfigToForm(pool: PredictionPool): Partial<PoolFormValues> {
  const rc = pool.reward_config;
  if (rc.type === 'all_correct_only') {
    return { jackpot_reward: configToReward(rc.reward) };
  }
  if (rc.type === 'by_hits_tiers') {
    return {
      tier_rewards: rc.tiers.map((t) => ({
        label: t.label,
        min_hits_percent: t.min_hits_percent,
        reward: configToReward(t.reward),
      })),
    };
  }
  if (rc.type === 'top_positions') {
    return {
      position_rewards: rc.positions.map((p) => ({
        label: p.label,
        position_from: p.position_from,
        position_to: p.position_to,
        reward: configToReward(p.reward),
      })),
    };
  }
  return { per_hit_reward: configToReward(rc.reward) };
}

export function optionsToFormValues(options: PredictionOption[] | undefined | null): MatchOptionFormValues[] {
  const sorted = Array.isArray(options) ? [...options].sort((a, b) => a.display_order - b.display_order) : [];
  const mapped: MatchOptionFormValues[] = sorted.map((o) => ({
    text: o.text,
    description: o.description ?? '',
    image_url: o.image_url ?? '',
  }));
  while (mapped.length < 2) {
    mapped.push({ text: '', description: '', image_url: '' });
  }
  return mapped;
}

export function eventToFormValues(event: PoolMatch): MatchFormValues {
  return {
    name: event.name,
    description: event.description ?? '',
    image_url: event.image_url ?? '',
    prediction_type: event.prediction_type,
    options: optionsToFormValues(event.options),
  };
}

export function poolToForm(pool: PredictionPool): PoolFormValues {
  return {
    code: pool.code,
    name: pool.name,
    description: pool.description,
    image_url: pool.image_url ?? '',
    category: pool.category,
    opens_at: pool.opens_at.slice(0, 16),
    closes_at: pool.closes_at.slice(0, 16),
    resolves_at: pool.resolves_at.slice(0, 16),
    participation_type: pool.participation_cost.type,
    cost_in_coins: pool.participation_cost.cost_in_coins ?? 100,
    reward_structure_type: pool.reward_structure_type,
    jackpot_reward: defaultReward,
    tier_rewards: defaultPoolForm().tier_rewards,
    position_rewards: defaultPoolForm().position_rewards,
    per_hit_reward: defaultReward,
    max_predictions_per_player: pool.max_predictions_per_player,
    is_visible_to_players: pool.is_visible_to_players,
    target_audience: pool.target_audience,
    min_level: pool.restrictions.min_level,
    max_level: pool.audience_config.max_level ?? null,
    countries: (pool.audience_config.countries ?? []).join(', '),
    player_ids: (pool.audience_config.player_ids ?? []).join(', '),
    vip_only: pool.restrictions.vip_only,
    new_players_only: pool.restrictions.new_players_only,
    events: pool.events.sort((a, b) => a.display_order - b.display_order).map(eventToFormValues),
    ...rewardConfigToForm(pool),
  };
}

function formToRewardConfig(values: PoolFormValues): PoolRewardConfig {
  switch (values.reward_structure_type) {
    case 'all_correct_only':
      return { type: 'all_correct_only', reward: rewardToConfig(values.jackpot_reward) };
    case 'by_hits_tiers':
      return {
        type: 'by_hits_tiers',
        tiers: values.tier_rewards.map((t, i) => ({
          id: `tier_${i}`,
          label: t.label,
          min_hits_percent: t.min_hits_percent,
          reward: rewardToConfig(t.reward),
        })),
      };
    case 'top_positions':
      return {
        type: 'top_positions',
        positions: values.position_rewards.map((p, i) => ({
          id: `pos_${i}`,
          label: p.label,
          position_from: p.position_from,
          position_to: p.position_to,
          reward: rewardToConfig(p.reward),
        })),
      };
    case 'every_correct_gives':
      return { type: 'every_correct_gives', reward: rewardToConfig(values.per_hit_reward) };
  }
}

export function formToPayload(values: PoolFormValues): PredictionPoolPayload {
  const audience_config: PredictionPoolPayload['audience_config'] = {};
  if (values.target_audience === 'by_level') {
    audience_config.min_level = values.min_level ?? undefined;
    audience_config.max_level = values.max_level ?? undefined;
  }
  if (values.target_audience === 'by_country' && values.countries.trim()) {
    audience_config.countries = values.countries.split(',').map((c) => c.trim());
  }
  if (values.target_audience === 'specific_players' && values.player_ids.trim()) {
    audience_config.player_ids = values.player_ids.split(',').map((p) => p.trim());
  }

  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim() || null,
    category: values.category.trim(),
    opens_at: new Date(values.opens_at).toISOString(),
    closes_at: new Date(values.closes_at).toISOString(),
    resolves_at: new Date(values.resolves_at).toISOString(),
    participation_cost: {
      type: values.participation_type,
      cost_in_coins: values.participation_type === 'paid' ? values.cost_in_coins : null,
    },
    reward_structure_type: values.reward_structure_type,
    reward_config: formToRewardConfig(values),
    max_predictions_per_player: values.max_predictions_per_player,
    target_audience: values.target_audience,
    audience_config,
    restrictions: {
      min_level: values.min_level,
      vip_only: values.vip_only || values.target_audience === 'vip_only',
      new_players_only: values.new_players_only || values.target_audience === 'new_players',
    },
    is_visible_to_players: values.is_visible_to_players,
    events: values.events.map((ev, i) => ({
      name: ev.name.trim(),
      description: ev.description.trim() || undefined,
      image_url: ev.image_url.trim() || undefined,
      prediction_type: (ev.prediction_type ?? '').trim(),
      display_order: i,
      options: ev.options.map((o, j) => ({
        text: o.text.trim(),
        description: o.description.trim() || undefined,
        image_url: o.image_url.trim() || undefined,
        display_order: j,
      })),
    })),
  };
}
