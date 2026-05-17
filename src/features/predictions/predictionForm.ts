import { z } from 'zod';

import { rewardValueSchema } from '@/features/rewards/rewardForm';
import type {
  ParticipationCostType,
  PredictionEvent,
  PredictionEventPayload,
  PredictionOption,
  PredictionRewardType,
} from '@/types/predictions';
import type { RewardValue } from '@/types/rewards';

export const PREDICTION_REWARD_TYPES: PredictionRewardType[] = [
  'coins',
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'chest',
  'manual',
];

export const PREDICTION_STATUSES = ['draft', 'open', 'closed', 'resolved', 'cancelled'] as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  open: 'Abierto',
  closed: 'Cerrado',
  resolved: 'Resuelto',
  cancelled: 'Cancelado',
};

export const REWARD_TYPE_LABELS: Record<PredictionRewardType, string> = {
  coins: 'Monedas',
  freespin: 'Free spins',
  freebet: 'Free bet',
  cashback: 'Cashback',
  bonus_deposit: 'Bono depósito',
  chest: 'Cofre',
  manual: 'Manual',
};

export interface PredictionOptionFormValues {
  text: string;
  description: string;
  image_url: string;
}

export interface PredictionFormValues {
  code: string;
  name: string;
  description: string;
  category: string;
  prediction_type: string;
  options: PredictionOptionFormValues[];
  opens_at: string;
  closes_at: string;
  resolves_at: string;
  participation_type: ParticipationCostType;
  cost_in_coins: number;
  reward: RewardValue;
  max_predictions_per_player: number;
  is_visible_to_players: boolean;
  min_level: number | null;
  vip_only: boolean;
  new_players_only: boolean;
}

const codeSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(64, 'Máximo 64 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

const optionSchema = z.object({
  text: z.string().min(1, 'Texto requerido').max(120, 'Máximo 120 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres'),
  image_url: z.string().url('URL inválida').or(z.literal('')),
});

export const predictionFormSchema = z
  .object({
    code: codeSchema,
    name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres'),
    category: z.string().min(1, 'Categoría requerida').max(64, 'Máximo 64 caracteres'),
    prediction_type: z.string().min(1, 'Tipo requerido').max(64, 'Máximo 64 caracteres'),
    options: z.array(optionSchema).min(2, 'Mínimo 2 opciones'),
    opens_at: z.string().min(1, 'Fecha de apertura requerida'),
    closes_at: z.string().min(1, 'Fecha de cierre requerida'),
    resolves_at: z.string().min(1, 'Fecha de resolución requerida'),
    participation_type: z.enum(['free', 'paid_with_coins']),
    cost_in_coins: z.number().int().min(0),
    reward: rewardValueSchema,
    max_predictions_per_player: z.number().int().min(1).max(10),
    is_visible_to_players: z.boolean(),
    min_level: z.number().int().min(1).nullable(),
    vip_only: z.boolean(),
    new_players_only: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const opens = new Date(data.opens_at).getTime();
    const closes = new Date(data.closes_at).getTime();
    const resolves = new Date(data.resolves_at).getTime();
    if (opens >= closes) {
      ctx.addIssue({
        code: 'custom',
        message: 'La apertura debe ser anterior al cierre',
        path: ['closes_at'],
      });
    }
    if (closes >= resolves) {
      ctx.addIssue({
        code: 'custom',
        message: 'El cierre debe ser anterior a la resolución',
        path: ['resolves_at'],
      });
    }
    if (data.participation_type === 'paid_with_coins' && data.cost_in_coins <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Costo en monedas debe ser mayor a 0',
        path: ['cost_in_coins'],
      });
    }
  });

export function defaultPredictionForm(): PredictionFormValues {
  const now = new Date();
  const opens = new Date(now.getTime() + 3600000);
  const closes = new Date(now.getTime() + 86400000 * 2);
  const resolves = new Date(now.getTime() + 86400000 * 3);
  return {
    code: '',
    name: '',
    description: '',
    category: '',
    prediction_type: '',
    options: [
      { text: '', description: '', image_url: '' },
      { text: '', description: '', image_url: '' },
    ],
    opens_at: opens.toISOString().slice(0, 16),
    closes_at: closes.toISOString().slice(0, 16),
    resolves_at: resolves.toISOString().slice(0, 16),
    participation_type: 'free',
    cost_in_coins: 100,
    reward: { reward_type: 'coins', reward_config: { amount: 500, currency_code: 'main' }, currency_mode: 'auto_usd' },
    max_predictions_per_player: 1,
    is_visible_to_players: true,
    min_level: null,
    vip_only: false,
    new_players_only: false,
  };
}

export function predictionToForm(event: PredictionEvent): PredictionFormValues {
  return {
    code: event.code,
    name: event.name,
    description: event.description,
    category: event.category,
    prediction_type: event.prediction_type,
    options: event.options
      .sort((a, b) => a.display_order - b.display_order)
      .map((o) => ({
        text: o.text,
        description: o.description ?? '',
        image_url: o.image_url ?? '',
      })),
    opens_at: event.opens_at.slice(0, 16),
    closes_at: event.closes_at.slice(0, 16),
    resolves_at: event.resolves_at.slice(0, 16),
    participation_type: event.participation_cost.type,
    cost_in_coins: event.participation_cost.cost_in_coins ?? 100,
    reward: {
      reward_type: event.reward_config.reward_type as RewardValue['reward_type'],
      reward_config: event.reward_config.reward_config as Record<string, unknown>,
      currency_mode: event.reward_config.currency_mode,
    },
    max_predictions_per_player: event.max_predictions_per_player,
    is_visible_to_players: event.is_visible_to_players,
    min_level: event.restrictions.min_level,
    vip_only: event.restrictions.vip_only,
    new_players_only: event.restrictions.new_players_only,
  };
}

export function formToPayload(values: PredictionFormValues): PredictionEventPayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    category: values.category.trim(),
    prediction_type: values.prediction_type.trim(),
    options: values.options.map((o, i) => ({
      text: o.text.trim(),
      description: o.description.trim() || undefined,
      image_url: o.image_url.trim() || undefined,
      display_order: i,
    })),
    opens_at: new Date(values.opens_at).toISOString(),
    closes_at: new Date(values.closes_at).toISOString(),
    resolves_at: new Date(values.resolves_at).toISOString(),
    participation_cost: {
      type: values.participation_type,
      cost_in_coins: values.participation_type === 'paid_with_coins' ? values.cost_in_coins : null,
    },
    reward_config: {
      reward_type: values.reward.reward_type as PredictionRewardType,
      reward_config: values.reward.reward_config,
      currency_mode: values.reward.currency_mode ?? 'auto_usd',
    },
    max_predictions_per_player: values.max_predictions_per_player,
    is_visible_to_players: values.is_visible_to_players,
    restrictions: {
      min_level: values.min_level,
      vip_only: values.vip_only,
      new_players_only: values.new_players_only,
    },
  };
}

export function validateScheduleOrder(
  opens_at: string,
  closes_at: string,
  resolves_at: string,
): string | null {
  const opens = new Date(opens_at).getTime();
  const closes = new Date(closes_at).getTime();
  const resolves = new Date(resolves_at).getTime();
  if (opens >= closes) return 'La apertura debe ser anterior al cierre';
  if (closes >= resolves) return 'El cierre debe ser anterior a la resolución';
  return null;
}

export function validateMinOptions(options: PredictionOptionFormValues[]): string | null {
  const filled = options.filter((o) => o.text.trim());
  if (filled.length < 2) return 'Mínimo 2 opciones con texto';
  return null;
}

export function reorderOptions<T>(options: T[], from: number, to: number): T[] {
  const next = [...options];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function preserveOptionIds(
  formOptions: PredictionOptionFormValues[],
  existing: PredictionOption[],
): PredictionOption[] {
  return formOptions.map((o, i) => ({
    id: existing[i]?.id ?? `opt_${Date.now()}_${i}`,
    text: o.text.trim(),
    description: o.description.trim() || undefined,
    image_url: o.image_url.trim() || undefined,
    display_order: i,
  }));
}
