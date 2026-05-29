import { z } from 'zod';

import type {
  RankingConfig,
  RankingCreatePayload,
  RankingMetadataPayload,
  RankingMetricType,
  RankingPeriodType,
  RankingPrize,
} from '@/types/rankings';

export const RANKING_METRIC_TYPES: RankingMetricType[] = [
  'xp_total',
  'coins_earned',
  'bets_placed',
  'amount_wagered',
  'levels_gained',
  'missions_completed',
  'streaks_completed',
  'chests_opened',
];

export const RANKING_PERIOD_TYPES: RankingPeriodType[] = ['daily', 'weekly', 'monthly', 'all_time'];

export const WEEKDAY_OPTIONS = [
  { value: 'monday', label: 'Lunes' },
  { value: 'tuesday', label: 'Martes' },
  { value: 'wednesday', label: 'Miércoles' },
  { value: 'thursday', label: 'Jueves' },
  { value: 'friday', label: 'Viernes' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
] as const;

export const METRIC_LABELS: Record<RankingMetricType, string> = {
  xp_total: 'XP total',
  coins_earned: 'Monedas ganadas',
  bets_placed: 'Apuestas realizadas',
  amount_wagered: 'Monto apostado',
  levels_gained: 'Niveles ganados',
  missions_completed: 'Misiones completadas',
  streaks_completed: 'Rachas completadas',
  chests_opened: 'Cofres abiertos',
};

export const PERIOD_LABELS: Record<RankingPeriodType, string> = {
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
  all_time: 'All-time',
};

export interface RankingFormValues {
  code: string;
  name: string;
  description: string;
  image_url: string;
  metric_type: RankingMetricType;
  period_type: RankingPeriodType;
  reset_time: string;
  reset_weekday: string;
  reset_day_of_month: number;
  is_active: boolean;
  is_visible_to_players: boolean;
  max_visible_positions: number;
  min_level: number | null;
  vip_only: boolean;
  new_players_only: boolean;
}

const codeSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(64, 'Máximo 64 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

export const rankingFormSchema = z
  .object({
    code: codeSchema,
    name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres'),
    image_url: z.string().url('URL inválida').or(z.literal('')),
    metric_type: z.enum([
      'xp_total',
      'coins_earned',
      'bets_placed',
      'amount_wagered',
      'levels_gained',
      'missions_completed',
      'streaks_completed',
      'chests_opened',
    ]),
    period_type: z.enum(['daily', 'weekly', 'monthly', 'all_time']),
    reset_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
    reset_weekday: z.string(),
    reset_day_of_month: z.number().int().min(1).max(28),
    is_active: z.boolean(),
    is_visible_to_players: z.boolean(),
    max_visible_positions: z.number().int().min(1).max(500),
    min_level: z.number().int().min(1).nullable(),
    vip_only: z.boolean(),
    new_players_only: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.period_type !== 'all_time' && !values.reset_time.trim()) {
      ctx.addIssue({ code: 'custom', path: ['reset_time'], message: 'Horario de reset requerido' });
    }
  });

export function defaultRankingForm(): RankingFormValues {
  return {
    code: '',
    name: '',
    description: '',
    image_url: '',
    metric_type: 'xp_total',
    period_type: 'weekly',
    reset_time: '00:00',
    reset_weekday: 'monday',
    reset_day_of_month: 1,
    is_active: true,
    is_visible_to_players: true,
    max_visible_positions: 100,
    min_level: null,
    vip_only: false,
    new_players_only: false,
  };
}

export function buildPeriodResetsAt(values: RankingFormValues): string | null {
  if (values.period_type === 'all_time') return null;
  const time = `${values.reset_time} UTC`;
  switch (values.period_type) {
    case 'daily':
      return `every day at ${time}`;
    case 'weekly':
      return `every ${values.reset_weekday} at ${time}`;
    case 'monthly':
      return `day ${values.reset_day_of_month} of month at ${time}`;
    default:
      return null;
  }
}

export function parsePeriodResetsAt(
  periodType: RankingPeriodType,
  periodResetsAt: string | null,
): Pick<RankingFormValues, 'reset_time' | 'reset_weekday' | 'reset_day_of_month'> {
  const base = { reset_time: '00:00', reset_weekday: 'monday', reset_day_of_month: 1 };
  if (!periodResetsAt) return base;
  const timeMatch = periodResetsAt.match(/(\d{2}:\d{2})/);
  if (timeMatch) base.reset_time = timeMatch[1];
  if (periodType === 'weekly') {
    const day = WEEKDAY_OPTIONS.find((d) => periodResetsAt.toLowerCase().includes(d.value));
    if (day) base.reset_weekday = day.value;
  }
  if (periodType === 'monthly') {
    const dayMatch = periodResetsAt.match(/day (\d+)/);
    if (dayMatch) base.reset_day_of_month = Number(dayMatch[1]);
  }
  return base;
}

export function rankingToForm(ranking: RankingConfig): RankingFormValues {
  const reset = parsePeriodResetsAt(ranking.period_type, ranking.period_resets_at);
  return {
    code: ranking.code,
    name: ranking.name,
    description: ranking.description,
    image_url: ranking.image_url ?? '',
    metric_type: ranking.metric_type,
    period_type: ranking.period_type,
    ...reset,
    is_active: ranking.is_active,
    is_visible_to_players: ranking.is_visible_to_players,
    max_visible_positions: ranking.max_visible_positions,
    min_level: ranking.restrictions.min_level,
    vip_only: ranking.restrictions.vip_only,
    new_players_only: ranking.restrictions.new_players_only,
  };
}

export function formToMetadataPayload(values: RankingFormValues): RankingMetadataPayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim() || null,
    metric_type: values.metric_type,
    period_type: values.period_type,
    period_resets_at: buildPeriodResetsAt(values),
    is_active: values.is_active,
    is_visible_to_players: values.is_visible_to_players,
    max_visible_positions: values.max_visible_positions,
    restrictions: {
      min_level: values.min_level,
      vip_only: values.vip_only,
      new_players_only: values.new_players_only,
    },
  };
}

export function formToCreatePayload(
  values: RankingFormValues,
  prizes: Omit<RankingPrize, 'id'>[],
): RankingCreatePayload {
  return {
    code: values.code.trim(),
    ...formToMetadataPayload(values),
    prizes,
  };
}

export function validateRankingSave(
  values: RankingFormValues,
  existingCodes: string[],
  editingCode?: string,
): Partial<Record<keyof RankingFormValues, string>> {
  const parsed = rankingFormSchema.safeParse(values);
  const errors: Partial<Record<keyof RankingFormValues, string>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof RankingFormValues;
      if (key && !errors[key]) errors[key] = issue.message;
    }
  }
  const normalized = values.code.trim();
  if (normalized && existingCodes.some((c) => c === normalized && c !== editingCode)) {
    errors.code = 'El code ya existe';
  }
  return errors;
}
