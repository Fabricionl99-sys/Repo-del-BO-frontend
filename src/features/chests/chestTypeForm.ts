import { z } from 'zod';

import type { ChestPrize, ChestType, ChestTypeCreatePayload, ChestTypeMetadataPayload } from '@/types/chests';

import { probabilitiesValid } from './chestPrizeForm';

export const CHEST_COLOR_PRESETS = [
  { label: 'Bronce', value: '#CD7F32' },
  { label: 'Plata', value: '#C0C0C0' },
  { label: 'Oro', value: '#FFD700' },
  { label: 'Diamante', value: '#B9F2FF' },
  { label: 'Legendario', value: '#9B59B6' },
] as const;

export interface ChestTypeFormValues {
  code: string;
  name: string;
  description: string;
  image_url: string;
  color_theme: string;
  is_active: boolean;
  no_expiration: boolean;
  default_expiration_hours: number;
  has_pity_system: boolean;
  pity_threshold: number;
  pity_guaranteed_prize_id: string;
}

const codeSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(64, 'Máximo 64 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

export const chestTypeFormSchema = z
  .object({
    code: codeSchema,
    name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres'),
    image_url: z.string().url('URL inválida').or(z.literal('')),
    color_theme: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido'),
    is_active: z.boolean(),
    no_expiration: z.boolean(),
    default_expiration_hours: z.number().int().min(1, 'Mínimo 1 hora'),
    has_pity_system: z.boolean(),
    pity_threshold: z.number().int().min(1, 'Mínimo 1'),
    pity_guaranteed_prize_id: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.has_pity_system && !values.pity_guaranteed_prize_id.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['pity_guaranteed_prize_id'],
        message: 'Elegí un premio raro garantizado',
      });
    }
  });

export function defaultChestTypeForm(): ChestTypeFormValues {
  return {
    code: '',
    name: '',
    description: '',
    image_url: '',
    color_theme: CHEST_COLOR_PRESETS[0].value,
    is_active: true,
    no_expiration: true,
    default_expiration_hours: 72,
    has_pity_system: false,
    pity_threshold: 10,
    pity_guaranteed_prize_id: '',
  };
}

export function chestTypeToForm(type: ChestType): ChestTypeFormValues {
  return {
    code: type.code,
    name: type.name,
    description: type.description,
    image_url: type.image_url,
    color_theme: type.color_theme,
    is_active: type.is_active,
    no_expiration: type.default_expiration_hours === null,
    default_expiration_hours: type.default_expiration_hours ?? 72,
    has_pity_system: type.has_pity_system,
    pity_threshold: type.pity_threshold ?? 10,
    pity_guaranteed_prize_id: type.pity_guaranteed_prize_id ?? '',
  };
}

export function formToMetadataPayload(values: ChestTypeFormValues): ChestTypeMetadataPayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim(),
    color_theme: values.color_theme,
    is_active: values.is_active,
    default_expiration_hours: values.no_expiration ? null : values.default_expiration_hours,
    has_pity_system: values.has_pity_system,
    pity_threshold: values.has_pity_system ? values.pity_threshold : null,
    pity_guaranteed_prize_id:
      values.has_pity_system && values.pity_guaranteed_prize_id.trim()
        ? values.pity_guaranteed_prize_id.trim()
        : null,
  };
}

export function formToCreatePayload(
  values: ChestTypeFormValues,
  prizes: Omit<ChestPrize, 'id'>[],
): ChestTypeCreatePayload {
  return {
    code: values.code.trim(),
    ...formToMetadataPayload(values),
    prizes,
  };
}

export function validateChestTypeSave(
  values: ChestTypeFormValues,
  prizes: ChestPrize[],
  existingCodes: string[],
  editingCode?: string,
): { fieldErrors: Partial<Record<keyof ChestTypeFormValues, string>>; probabilityError?: string } {
  const parsed = chestTypeFormSchema.safeParse(values);
  const fieldErrors: Partial<Record<keyof ChestTypeFormValues, string>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ChestTypeFormValues;
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
  }
  const normalized = values.code.trim();
  if (normalized && existingCodes.some((c) => c === normalized && c !== editingCode)) {
    fieldErrors.code = 'El code ya existe';
  }
  if (prizes.length === 0) {
    return { fieldErrors, probabilityError: 'Agregá al menos un premio' };
  }
  if (!probabilitiesValid(prizes)) {
    return { fieldErrors, probabilityError: 'La suma de probabilidades debe ser exactamente 100.00' };
  }
  if (values.has_pity_system && values.pity_guaranteed_prize_id.trim()) {
    const prize = prizes.find((p) => p.id === values.pity_guaranteed_prize_id.trim());
    if (!prize?.is_rare) {
      fieldErrors.pity_guaranteed_prize_id = 'El premio de pity debe estar marcado como raro';
    }
  }
  return { fieldErrors };
}
