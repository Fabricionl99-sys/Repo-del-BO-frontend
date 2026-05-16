import { z } from 'zod';

import type { AvatarCategory, AvatarCategoryPayload, AvatarRestrictions } from '@/types/avatars';

export const AVATAR_ICON_PRESETS = [
  'PawPrint',
  'Trophy',
  'Star',
  'Crown',
  'Gem',
  'Snowflake',
  'Heart',
  'Zap',
  'Flame',
  'Sparkles',
] as const;

export type AvatarIconPreset = (typeof AVATAR_ICON_PRESETS)[number];

const codeSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(64, 'Máximo 64 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

const restrictionsSchema = z.object({
  min_level: z.number().int().min(1).nullable(),
  vip_only: z.boolean(),
  new_players_only: z.boolean(),
});

export const avatarCategoryFormSchema = z.object({
  code: codeSchema,
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres'),
  icon: z.string().min(1, 'Elegí un ícono'),
  display_order: z.number().int().min(0),
  is_active: z.boolean(),
  restrictions: restrictionsSchema,
});

export type AvatarCategoryFormValues = z.infer<typeof avatarCategoryFormSchema>;

export function defaultRestrictions(): AvatarRestrictions {
  return { min_level: null, vip_only: false, new_players_only: false };
}

export function defaultAvatarCategoryForm(order = 0): AvatarCategoryFormValues {
  return {
    code: '',
    name: '',
    description: '',
    icon: AVATAR_ICON_PRESETS[0],
    display_order: order,
    is_active: true,
    restrictions: defaultRestrictions(),
  };
}

export function categoryToForm(category: AvatarCategory): AvatarCategoryFormValues {
  return {
    code: category.code,
    name: category.name,
    description: category.description,
    icon: category.icon,
    display_order: category.display_order,
    is_active: category.is_active,
    restrictions: category.restrictions,
  };
}

export function formToCategoryPayload(values: AvatarCategoryFormValues): AvatarCategoryPayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    icon: values.icon,
    display_order: values.display_order,
    is_active: values.is_active,
    restrictions: values.restrictions,
  };
}
