import { z } from 'zod';

import { asArray } from '@/lib/asArray';

import { rewardValueSchema, summarizeReward } from '@/features/rewards/rewardForm';
import type {
  Tournament,
  TournamentActivityType,
  TournamentAudienceType,
  TournamentCompetitionType,
  TournamentPayload,
  TournamentPeriodType,
  TournamentPrize,
  TournamentPrizeRewardType,
  TournamentRegistrationType,
} from '@/types/tournaments';

export const TOURNAMENT_ACTIVITY_TYPES: TournamentActivityType[] = [
  'casino',
  'sports',
  'live_casino',
  'poker',
  'esports',
  'crash_games',
  'slots',
  'bingo',
];

export const TOURNAMENT_COMPETITION_TYPES: TournamentCompetitionType[] = [
  'wagering',
  'bets_count',
  'xp_gained',
  'coins_earned',
  'win_streak',
  'biggest_multiplier',
];

export const TOURNAMENT_AUDIENCE_TYPES: TournamentAudienceType[] = [
  'all_players',
  'vip_only',
  'new_players',
  'by_level',
  'by_country',
  'manual_invite',
];

export const TOURNAMENT_REGISTRATION_TYPES: TournamentRegistrationType[] = [
  'auto_enroll',
  'opt_in_free',
  'opt_in_paid',
];

export const TOURNAMENT_PERIOD_TYPES: TournamentPeriodType[] = [
  'one_time',
  'recurring_weekly',
  'recurring_monthly',
];

export const TOURNAMENT_PRIZE_REWARD_TYPES: TournamentPrizeRewardType[] = [
  'coins',
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'chest',
  'manual',
];

export const ACTIVITY_LABELS: Record<TournamentActivityType, string> = {
  casino: 'Casino',
  sports: 'Sports',
  live_casino: 'Live Casino',
  poker: 'Poker',
  esports: 'Esports',
  crash_games: 'Crash Games',
  slots: 'Slots',
  bingo: 'Bingo',
};

export const COMPETITION_LABELS: Record<TournamentCompetitionType, string> = {
  wagering: 'Mayor monto apostado',
  bets_count: 'Mayor cantidad de apuestas',
  xp_gained: 'Mayor XP ganado',
  coins_earned: 'Mayor coins ganadas',
  win_streak: 'Racha más larga de wins',
  biggest_multiplier: 'Multiplicador más alto',
};

export const AUDIENCE_LABELS: Record<TournamentAudienceType, string> = {
  all_players: 'Todos los jugadores',
  vip_only: 'Solo VIP',
  new_players: 'Solo nuevos (30 días)',
  by_level: 'Por rango de nivel',
  by_country: 'Por país',
  manual_invite: 'Invitación manual',
};

export const REGISTRATION_LABELS: Record<TournamentRegistrationType, string> = {
  auto_enroll: 'Auto-inscripción',
  opt_in_free: 'Opt-in gratis',
  opt_in_paid: 'Opt-in pagado',
};

export const PERIOD_LABELS: Record<TournamentPeriodType, string> = {
  one_time: 'Una vez',
  recurring_weekly: 'Semanal recurrente',
  recurring_monthly: 'Mensual recurrente',
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
};

export interface TournamentPrizeFormValues {
  position_from: number;
  position_to: number;
  reward: import('@/types/rewards').RewardValue;
}

export interface TournamentFormValues {
  code: string;
  name: string;
  description: string;
  image_url: string;
  activity_types: TournamentActivityType[];
  competition_type: TournamentCompetitionType;
  min_bet_amount_usd: number | null;
  specific_games_only: string[];
  min_odds: number | null;
  audience_type: TournamentAudienceType;
  min_level: number;
  max_level: number;
  countries: string;
  player_ids: string;
  registration_type: TournamentRegistrationType;
  cost_in_coins: number;
  period_starts_at: string;
  period_ends_at: string;
  period_type: TournamentPeriodType;
  prizes: TournamentPrizeFormValues[];
  max_visible_positions: number;
  is_active: boolean;
}

const codeSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(64, 'Máximo 64 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

const prizeSchema = z
  .object({
    position_from: z.number().int().min(1),
    position_to: z.number().int().min(1),
    reward: rewardValueSchema,
  })
  .superRefine((p, ctx) => {
    if (p.position_from > p.position_to) {
      ctx.addIssue({
        code: 'custom',
        message: 'Desde no puede ser mayor que hasta',
        path: ['position_from'],
      });
    }
  });

export const tournamentFormSchema = z
  .object({
    code: codeSchema,
    name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres'),
    image_url: z.string().url('URL inválida').or(z.literal('')),
    activity_types: z
      .array(
        z.enum([
          'casino',
          'sports',
          'live_casino',
          'poker',
          'esports',
          'crash_games',
          'slots',
          'bingo',
        ]),
      )
      .min(1, 'Seleccioná al menos una actividad'),
    competition_type: z.enum([
      'wagering',
      'bets_count',
      'xp_gained',
      'coins_earned',
      'win_streak',
      'biggest_multiplier',
    ]),
    min_bet_amount_usd: z.number().min(0).nullable(),
    specific_games_only: z.array(z.string()),
    min_odds: z.number().min(1).nullable(),
    audience_type: z.enum([
      'all_players',
      'vip_only',
      'new_players',
      'by_level',
      'by_country',
      'manual_invite',
    ]),
    min_level: z.number().int().min(1),
    max_level: z.number().int().min(1),
    countries: z.string(),
    player_ids: z.string(),
    registration_type: z.enum(['auto_enroll', 'opt_in_free', 'opt_in_paid']),
    cost_in_coins: z.number().int().min(0),
    period_starts_at: z.string().min(1, 'Inicio requerido'),
    period_ends_at: z.string().min(1, 'Fin requerido'),
    period_type: z.enum(['one_time', 'recurring_weekly', 'recurring_monthly']),
    prizes: z.array(prizeSchema).min(1, 'Al menos 1 premio'),
    max_visible_positions: z.number().int().min(1).max(500),
    is_active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.period_starts_at).getTime();
    const end = new Date(data.period_ends_at).getTime();
    if (start >= end) {
      ctx.addIssue({
        code: 'custom',
        message: 'El inicio debe ser anterior al fin',
        path: ['period_ends_at'],
      });
    }
    if (data.registration_type === 'opt_in_paid' && data.cost_in_coins <= 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Costo en monedas debe ser mayor a 0',
        path: ['cost_in_coins'],
      });
    }
    if (data.audience_type === 'by_level' && data.min_level > data.max_level) {
      ctx.addIssue({
        code: 'custom',
        message: 'Nivel mínimo no puede ser mayor al máximo',
        path: ['min_level'],
      });
    }
    if (data.audience_type === 'by_country' && !data.countries.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ingresá al menos un país',
        path: ['countries'],
      });
    }
    if (data.audience_type === 'manual_invite' && !data.player_ids.trim()) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ingresá al menos un jugador',
        path: ['player_ids'],
      });
    }
    if (data.activity_types.includes('sports') && data.min_odds !== null && data.min_odds < 1) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cuota mínima debe ser >= 1',
        path: ['min_odds'],
      });
    }
    const overlap = findPrizeOverlapInList(data.prizes);
    if (overlap) {
      ctx.addIssue({
        code: 'custom',
        message: `Superposición en premios posiciones ${overlap.a.position_from}-${overlap.a.position_to} y ${overlap.b.position_from}-${overlap.b.position_to}`,
        path: ['prizes'],
      });
    }
  });

export function rangesOverlap(
  a: { position_from: number; position_to: number },
  b: { position_from: number; position_to: number },
): boolean {
  return a.position_from <= b.position_to && b.position_from <= a.position_to;
}

export function findPrizeOverlapInList(
  prizes: Pick<TournamentPrizeFormValues, 'position_from' | 'position_to'>[],
): { a: (typeof prizes)[number]; b: (typeof prizes)[number] } | null {
  for (let i = 0; i < prizes.length; i++) {
    for (let j = i + 1; j < prizes.length; j++) {
      if (rangesOverlap(prizes[i], prizes[j])) {
        return { a: prizes[i], b: prizes[j] };
      }
    }
  }
  return null;
}

function prizeToForm(p: TournamentPrize): TournamentPrizeFormValues {
  return {
    position_from: p.position_from,
    position_to: p.position_to,
    reward: {
      reward_type: p.reward_type as import('@/types/rewards').RewardTypeCode,
      reward_config: p.reward_config as Record<string, unknown>,
      currency_mode: p.currency_mode,
    },
  };
}

export function defaultTournamentForm(): TournamentFormValues {
  const now = new Date();
  const start = new Date(now.getTime() + 3600000);
  const end = new Date(now.getTime() + 86400000 * 7);
  return {
    code: '',
    name: '',
    description: '',
    image_url: '',
    activity_types: ['casino'],
    competition_type: 'wagering',
    min_bet_amount_usd: null,
    specific_games_only: [],
    min_odds: null,
    audience_type: 'all_players',
    min_level: 1,
    max_level: 50,
    countries: '',
    player_ids: '',
    registration_type: 'auto_enroll',
    cost_in_coins: 100,
    period_starts_at: start.toISOString().slice(0, 16),
    period_ends_at: end.toISOString().slice(0, 16),
    period_type: 'recurring_weekly',
    prizes: [
      {
        position_from: 1,
        position_to: 1,
        reward: { reward_type: 'coins', reward_config: { amount: 5000, currency_code: 'main' }, currency_mode: 'auto_usd' },
      },
    ],
    max_visible_positions: 100,
    is_active: true,
  };
}

export function tournamentToForm(t: Tournament): TournamentFormValues {
  const cfg = t.participants.audience_config;
  return {
    code: t.code,
    name: t.name,
    description: t.description,
    image_url: t.image_url,
    activity_types: t.activity_types,
    competition_type: t.competition_type,
    min_bet_amount_usd: t.filters.min_bet_amount_usd,
    specific_games_only: t.filters.specific_games_only,
    min_odds: t.filters.min_odds,
    audience_type: t.participants.audience_type,
    min_level: cfg.min_level ?? 1,
    max_level: cfg.max_level ?? 50,
    countries: (cfg.countries ?? []).join(', '),
    player_ids: (cfg.player_ids ?? []).join(', '),
    registration_type: t.registration.type,
    cost_in_coins: t.registration.cost_in_coins ?? 100,
    period_starts_at: t.period.starts_at.slice(0, 16),
    period_ends_at: t.period.ends_at.slice(0, 16),
    period_type: t.period.type,
    prizes: asArray(t.prizes).map(prizeToForm),
    max_visible_positions: t.max_visible_positions,
    is_active: t.is_active,
  };
}

export function formToPayload(values: TournamentFormValues): TournamentPayload {
  const audienceConfig: Tournament['participants']['audience_config'] = {};
  if (values.audience_type === 'by_level') {
    audienceConfig.min_level = values.min_level;
    audienceConfig.max_level = values.max_level;
  }
  if (values.audience_type === 'by_country') {
    audienceConfig.countries = values.countries
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (values.audience_type === 'manual_invite') {
    audienceConfig.player_ids = values.player_ids
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim(),
    activity_types: values.activity_types,
    competition_type: values.competition_type,
    filters: {
      min_bet_amount_usd: values.min_bet_amount_usd,
      specific_games_only: values.specific_games_only,
      min_odds: values.activity_types.includes('sports') ? values.min_odds : null,
    },
    participants: {
      audience_type: values.audience_type,
      audience_config: audienceConfig,
    },
    registration: {
      type: values.registration_type,
      cost_in_coins: values.registration_type === 'opt_in_paid' ? values.cost_in_coins : null,
    },
    period: {
      starts_at: new Date(values.period_starts_at).toISOString(),
      ends_at: new Date(values.period_ends_at).toISOString(),
      type: values.period_type,
    },
    prizes: values.prizes.map((p) => ({
      position_from: p.position_from,
      position_to: p.position_to,
      reward_type: p.reward.reward_type as TournamentPrizeRewardType,
      reward_config: p.reward.reward_config,
      currency_mode: p.reward.currency_mode ?? 'auto_usd',
    })),
    max_visible_positions: values.max_visible_positions,
    is_active: values.is_active,
  };
}

export function formatPositionRange(from: number, to: number): string {
  return from === to ? `#${from}` : `#${from}-${to}`;
}

export function summarizePrizeReward(p: TournamentPrizeFormValues): string {
  return summarizeReward(p.reward);
}
