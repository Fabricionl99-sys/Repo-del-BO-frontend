import { z } from 'zod';

import type {
  Avatar,
  AvatarCreatePayload,
  AvatarMetadataPayload,
  AvatarUnlockConfig,
  AvatarUnlockMethod,
} from '@/types/avatars';

import { defaultRestrictions } from './avatarCategoryForm';

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

export const avatarFormSchema = z
  .object({
    code: codeSchema,
    name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres'),
    category_id: z.string().min(1, 'Elegí una categoría'),
    is_active: z.boolean(),
    is_premium: z.boolean(),
    unlock_method: z.enum(['shop', 'level_up', 'mission', 'chest', 'manual', 'auto']),
    shop_cost_in_coins: z.number().int().min(1),
    shop_currency_code: z.string().min(1),
    level_required_level: z.number().int().min(1),
    mission_code: z.string(),
    chest_type_codes: z.array(z.string()),
    auto_from_date: z.string(),
    restrictions: restrictionsSchema,
  })
  .superRefine((values, ctx) => {
    if (values.unlock_method === 'shop' && values.shop_cost_in_coins < 1) {
      ctx.addIssue({ code: 'custom', path: ['shop_cost_in_coins'], message: 'Costo mínimo 1' });
    }
    if (values.unlock_method === 'level_up' && values.level_required_level < 1) {
      ctx.addIssue({ code: 'custom', path: ['level_required_level'], message: 'Nivel mínimo 1' });
    }
    if (values.unlock_method === 'mission' && !values.mission_code.trim()) {
      ctx.addIssue({ code: 'custom', path: ['mission_code'], message: 'Elegí una misión' });
    }
    if (values.unlock_method === 'chest' && values.chest_type_codes.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['chest_type_codes'], message: 'Elegí al menos un cofre' });
    }
    if (values.unlock_method === 'auto' && !values.auto_from_date.trim()) {
      ctx.addIssue({ code: 'custom', path: ['auto_from_date'], message: 'Elegí una fecha' });
    }
  });

export type AvatarFormValues = z.infer<typeof avatarFormSchema>;

export function defaultAvatarForm(): AvatarFormValues {
  return {
    code: '',
    name: '',
    description: '',
    category_id: '',
    is_active: true,
    is_premium: false,
    unlock_method: 'shop',
    shop_cost_in_coins: 500,
    shop_currency_code: 'main',
    level_required_level: 5,
    mission_code: '',
    chest_type_codes: [],
    auto_from_date: '',
    restrictions: defaultRestrictions(),
  };
}

function unlockConfigFromForm(values: AvatarFormValues): AvatarUnlockConfig {
  switch (values.unlock_method) {
    case 'shop':
      return { cost_in_coins: values.shop_cost_in_coins, currency_code: values.shop_currency_code };
    case 'level_up':
      return { required_level: values.level_required_level };
    case 'mission':
      return { mission_code: values.mission_code.trim() };
    case 'chest':
      return { chest_type_codes: values.chest_type_codes };
    case 'manual':
      return {};
    case 'auto':
      return { from_date: values.auto_from_date };
    default:
      return {};
  }
}

function unlockFieldsFromAvatar(avatar: Avatar): Pick<
  AvatarFormValues,
  | 'shop_cost_in_coins'
  | 'shop_currency_code'
  | 'level_required_level'
  | 'mission_code'
  | 'chest_type_codes'
  | 'auto_from_date'
> {
  const cfg = avatar.unlock_config;
  switch (avatar.unlock_method) {
    case 'shop':
      return {
        shop_cost_in_coins: 'cost_in_coins' in cfg ? cfg.cost_in_coins : 500,
        shop_currency_code: 'currency_code' in cfg ? cfg.currency_code : 'main',
        level_required_level: 5,
        mission_code: '',
        chest_type_codes: [],
        auto_from_date: '',
      };
    case 'level_up':
      return {
        shop_cost_in_coins: 500,
        shop_currency_code: 'main',
        level_required_level: 'required_level' in cfg ? cfg.required_level : 5,
        mission_code: '',
        chest_type_codes: [],
        auto_from_date: '',
      };
    case 'mission':
      return {
        shop_cost_in_coins: 500,
        shop_currency_code: 'main',
        level_required_level: 5,
        mission_code: 'mission_code' in cfg ? cfg.mission_code : '',
        chest_type_codes: [],
        auto_from_date: '',
      };
    case 'chest':
      return {
        shop_cost_in_coins: 500,
        shop_currency_code: 'main',
        level_required_level: 5,
        mission_code: '',
        chest_type_codes: 'chest_type_codes' in cfg ? cfg.chest_type_codes : [],
        auto_from_date: '',
      };
    case 'auto':
      return {
        shop_cost_in_coins: 500,
        shop_currency_code: 'main',
        level_required_level: 5,
        mission_code: '',
        chest_type_codes: [],
        auto_from_date: 'from_date' in cfg ? cfg.from_date.slice(0, 10) : '',
      };
    default:
      return {
        shop_cost_in_coins: 500,
        shop_currency_code: 'main',
        level_required_level: 5,
        mission_code: '',
        chest_type_codes: [],
        auto_from_date: '',
      };
  }
}

export function getAvatarImageUrl(
  avatar: Pick<Avatar, 'image_urls' | 'image_url'> | null | undefined,
): string | null {
  if (!avatar) return null;
  return avatar.image_urls?.original ?? avatar.image_url ?? null;
}

export function avatarToForm(avatar: Avatar): AvatarFormValues {
  return {
    code: avatar.code,
    name: avatar.name,
    description: avatar.description,
    category_id: avatar.category_id,
    is_active: avatar.is_active,
    is_premium: avatar.is_premium,
    unlock_method: avatar.unlock_method,
    restrictions: avatar.restrictions,
    ...unlockFieldsFromAvatar(avatar),
  };
}

export function formToMetadataPayload(values: AvatarFormValues): AvatarMetadataPayload {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    category_id: values.category_id,
    is_active: values.is_active,
    is_premium: values.is_premium,
    unlock_method: values.unlock_method,
    unlock_config: unlockConfigFromForm(values),
    restrictions: values.restrictions,
  };
}

export function formToCreatePayload(values: AvatarFormValues, imageUrl: string): AvatarCreatePayload {
  return {
    code: values.code.trim(),
    image_url: imageUrl,
    ...formToMetadataPayload(values),
  };
}

export function unlockMethodLabel(method: AvatarUnlockMethod): string {
  const labels: Record<AvatarUnlockMethod, string> = {
    shop: 'tienda',
    level_up: 'level up',
    mission: 'misión',
    chest: 'cofre',
    manual: 'manual',
    auto: 'automático',
  };
  return labels[method];
}
