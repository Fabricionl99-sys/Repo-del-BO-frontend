import { z } from 'zod';

import { probabilitiesValid } from '@/features/wheels/wheelPrizeForm';
import type {
  DailyCooldownMode,
  WheelOccasion,
  WheelOccasionType,
  WheelPrizePayload,
  WheelType,
  WheelTypeCreatePayload,
} from '@/types/wheels';

export const WHEEL_COLOR_PRESETS = [
  { label: 'Oro', value: '#FFD700' },
  { label: 'Púrpura VIP', value: '#7C3AED' },
  { label: 'Rojo', value: '#DC2626' },
  { label: 'Cyan', value: '#06B6D4' },
  { label: 'Verde', value: '#10B981' },
] as const;

export const OCCASION_LABELS: Record<WheelOccasionType, string> = {
  welcome_register: 'Al registrarse en la plataforma',
  daily_spin: 'Cada día (giro diario gratis)',
  level_milestone: 'Cuando llegan a nivel X — cada N niveles',
  zero_balance: 'Cuando se queda sin saldo',
  withdrawal_consolation: 'Después de retirar más de X',
  shop_purchase: 'Compra en la tienda',
  first_deposit: 'Al hacer primer depósito',
  birthday: 'El día del cumpleaños del jugador',
  mission_streak_chest_reward: 'Premio en misión, racha o cofre',
  manual_grant: 'Asignación manual desde admin',
};

export const OCCASION_CATEGORIES: Array<{
  key: string;
  title: string;
  types: WheelOccasionType[];
}> = [
  {
    key: 'engagement',
    title: 'Engagement',
    types: ['welcome_register', 'daily_spin', 'level_milestone'],
  },
  {
    key: 'anti_churn',
    title: 'Anti-churn',
    types: ['zero_balance', 'withdrawal_consolation'],
  },
  {
    key: 'monetization',
    title: 'Monetización',
    types: ['shop_purchase', 'first_deposit'],
  },
  { key: 'events', title: 'Eventos', types: ['birthday'] },
  {
    key: 'gamification',
    title: 'Gamificación',
    types: ['mission_streak_chest_reward', 'manual_grant'],
  },
];

const codeSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(64, 'Máximo 64 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

export interface WheelFormValues {
  code: string;
  name: string;
  description: string;
  image_url: string;
  color_theme: string;
  is_active: boolean;
  pity_enabled: boolean;
  pity_threshold: number;
  pity_guaranteed_prize_id: string;
  show_probabilities_to_players: boolean;
  daily_cooldown_mode: DailyCooldownMode;
  daily_cooldown_hours: number;
  spins_expire: boolean;
  spin_expiration_hours: number;
  archive_mode_default: 'normal' | 'emergency';
}

export const wheelFormSchema = z
  .object({
    code: codeSchema,
    name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres'),
    image_url: z.string().url('URL inválida').or(z.literal('')),
    color_theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido'),
    is_active: z.boolean(),
    pity_enabled: z.boolean(),
    pity_threshold: z.number().int().min(1, 'Mínimo 1'),
    pity_guaranteed_prize_id: z.string(),
    show_probabilities_to_players: z.boolean(),
    daily_cooldown_mode: z.enum(['hours_exact', 'utc_reset']),
    daily_cooldown_hours: z.number().int().min(1, 'Mínimo 1 hora'),
    spins_expire: z.boolean(),
    spin_expiration_hours: z.number().int().min(1, 'Mínimo 1 hora'),
    archive_mode_default: z.enum(['normal', 'emergency']),
  })
  .superRefine((values, ctx) => {
    if (values.pity_enabled && !values.pity_guaranteed_prize_id.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Elegí un premio raro garantizado',
        path: ['pity_guaranteed_prize_id'],
      });
    }
  });

export function defaultWheelForm(): WheelFormValues {
  return {
    code: '',
    name: '',
    description: '',
    image_url: '',
    color_theme: '#FFD700',
    is_active: true,
    pity_enabled: false,
    pity_threshold: 10,
    pity_guaranteed_prize_id: '',
    show_probabilities_to_players: false,
    daily_cooldown_mode: 'hours_exact',
    daily_cooldown_hours: 24,
    spins_expire: false,
    spin_expiration_hours: 72,
    archive_mode_default: 'normal',
  };
}

export function defaultOccasions(): WheelOccasion[] {
  const types: WheelOccasionType[] = [
    'welcome_register',
    'daily_spin',
    'level_milestone',
    'zero_balance',
    'withdrawal_consolation',
    'shop_purchase',
    'first_deposit',
    'birthday',
    'mission_streak_chest_reward',
    'manual_grant',
  ];
  return types.map((occasion_type) => ({
    occasion_type,
    is_active: occasion_type === 'manual_grant',
    config: defaultOccasionConfig(occasion_type),
  }));
}

export function defaultOccasionConfig(type: WheelOccasionType): Record<string, unknown> {
  switch (type) {
    case 'welcome_register':
      return { first_registration_only: true };
    case 'daily_spin':
      return { mode: 'hours_exact', hours: 24 };
    case 'level_milestone':
      return { every_n_levels: 5, min_level: 1 };
    case 'zero_balance':
      return { max_per_day: 1, cooldown_hours: 24 };
    case 'withdrawal_consolation':
      return { min_withdrawal_usd: 100 };
    case 'first_deposit':
      return { first_deposit_only: true };
    default:
      return {};
  }
}

export function wheelToForm(wheel: WheelType): WheelFormValues {
  return {
    code: wheel.code,
    name: wheel.name,
    description: wheel.description,
    image_url: wheel.image_url,
    color_theme: wheel.color_theme,
    is_active: wheel.is_active,
    pity_enabled: wheel.pity_enabled,
    pity_threshold: wheel.pity_threshold ?? 10,
    pity_guaranteed_prize_id: wheel.pity_guaranteed_prize_id ?? '',
    show_probabilities_to_players: wheel.show_probabilities_to_players,
    daily_cooldown_mode: wheel.daily_cooldown_mode,
    daily_cooldown_hours: wheel.daily_cooldown_hours,
    spins_expire: wheel.spins_expire,
    spin_expiration_hours: wheel.spin_expiration_hours ?? 72,
    archive_mode_default: wheel.archive_mode_default,
  };
}

export function mergeOccasions(wheel?: WheelType | null): WheelOccasion[] {
  const defaults = defaultOccasions();
  if (!wheel?.occasions?.length) return defaults;
  return defaults.map((d) => {
    const found = wheel.occasions.find((o) => o.occasion_type === d.occasion_type);
    return found ? { ...d, ...found } : d;
  });
}

export function formToCreatePayload(
  values: WheelFormValues,
  prizes: WheelPrizePayload[],
  occasions: WheelOccasion[],
): WheelTypeCreatePayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim(),
    color_theme: values.color_theme,
    is_active: values.is_active,
    pity_enabled: values.pity_enabled,
    pity_threshold: values.pity_enabled ? values.pity_threshold : null,
    pity_guaranteed_prize_id: values.pity_enabled ? values.pity_guaranteed_prize_id || null : null,
    show_probabilities_to_players: values.show_probabilities_to_players,
    daily_cooldown_mode: values.daily_cooldown_mode,
    daily_cooldown_hours: values.daily_cooldown_hours,
    spins_expire: values.spins_expire,
    spin_expiration_hours: values.spins_expire ? values.spin_expiration_hours : null,
    archive_mode_default: values.archive_mode_default,
    prizes,
    occasions,
  };
}

export function validateWheelSave(
  values: WheelFormValues,
  prizes: WheelPrizePayload[],
  existingCodes: string[],
  editingCode?: string,
): { probabilityError?: string; pityError?: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  if (!editingCode && existingCodes.includes(values.code.trim())) {
    fieldErrors.code = 'Este código ya existe';
  }
  if (prizes.length < 2) {
    return { fieldErrors, probabilityError: 'Agregá al menos 2 premios' };
  }
  if (!probabilitiesValid(prizes)) {
    const total = prizes.reduce((s, p) => s + p.probability_percent, 0);
    return {
      fieldErrors,
      probabilityError: `La suma debe ser 100% (actual: ${total.toFixed(2)}%)`,
    };
  }
  if (values.pity_enabled) {
    const rareIds = prizes.filter((p) => p.is_rare).map((p) => p.name);
    if (rareIds.length === 0) {
      return { fieldErrors, pityError: 'Marcá al menos un premio como raro para activar pity' };
    }
  }
  return { fieldErrors };
}

/** Lighter/darker slice suggestions from wheel theme hex. */
export function sliceColorSuggestions(baseHex: string): string[] {
  const hex = baseHex.replace('#', '');
  if (hex.length !== 6) return WHEEL_COLOR_PRESETS.map((p) => p.value);
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const steps = [0.85, 0.7, 0.55, 0.4, 0.25];
  return steps.map((factor) => {
    const lr = Math.min(255, Math.round(r + (255 - r) * factor));
    const lg = Math.min(255, Math.round(g + (255 - g) * factor));
    const lb = Math.min(255, Math.round(b + (255 - b) * factor));
    return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
  });
}

export const SPIN_DELIVERY_LABELS = {
  pending: 'pendiente',
  in_flight: 'en vuelo',
  delivered: 'entregado',
  failed: 'fallido',
} as const;

export const OCCASION_TYPE_LABELS = OCCASION_LABELS;
