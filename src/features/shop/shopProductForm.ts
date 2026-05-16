import { z } from 'zod';

import type { ShopProduct, ShopProductPayload, ShopRewardConfig, ShopRewardType } from '@/types/shop';

export const SHOP_REWARD_TYPES: ShopRewardType[] = [
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'avatar_pack',
  'theme',
  'manual',
];

export const SHOP_CURRENCY_CODES = ['main', 'vip'] as const;

export interface ShopProductFormValues {
  code: string;
  name: string;
  description: string;
  image_url: string;
  cost_in_coins: number;
  currency_code: string;
  unlimited_stock: boolean;
  stock: number;
  reward_type: ShopRewardType;
  freespin_quantity: number;
  freespin_game_id: string;
  freebet_amount: number;
  freebet_currency: string;
  cashback_percentage: number;
  cashback_max_amount: number;
  bonus_percentage: number;
  bonus_max_amount: number;
  avatar_pack_id: string;
  theme_id: string;
  manual_description: string;
  min_level: number | null;
  vip_only: boolean;
  max_per_player: number | null;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

const codeSchema = z
  .string()
  .min(2, 'Mínimo 2 caracteres')
  .max(64, 'Máximo 64 caracteres')
  .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y guión bajo');

export const shopProductFormSchema = z
  .object({
    code: codeSchema,
    name: z.string().min(2, 'Mínimo 2 caracteres').max(120, 'Máximo 120 caracteres'),
    description: z.string().max(2000, 'Máximo 2000 caracteres'),
    image_url: z.string().url('URL inválida').or(z.literal('')),
    cost_in_coins: z.number().int('Debe ser entero').min(1, 'Mínimo 1 moneda'),
    currency_code: z.string().min(1, 'Seleccioná moneda'),
    unlimited_stock: z.boolean(),
    stock: z.number().int().min(0, 'Stock no puede ser negativo'),
    reward_type: z.enum([
      'freespin',
      'freebet',
      'cashback',
      'bonus_deposit',
      'avatar_pack',
      'theme',
      'manual',
    ]),
    freespin_quantity: z.number().int().min(0),
    freespin_game_id: z.string(),
    freebet_amount: z.number().min(0),
    freebet_currency: z.string(),
    cashback_percentage: z.number().min(0).max(100),
    cashback_max_amount: z.number().min(0),
    bonus_percentage: z.number().min(0).max(500),
    bonus_max_amount: z.number().min(0),
    avatar_pack_id: z.string(),
    theme_id: z.string(),
    manual_description: z.string(),
    min_level: z.number().int().min(1).nullable(),
    vip_only: z.boolean(),
    max_per_player: z.number().int().min(1).nullable(),
    valid_from: z.string(),
    valid_until: z.string(),
    is_active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (!values.unlimited_stock && values.stock <= 0 && values.is_active) {
      ctx.addIssue({ code: 'custom', path: ['stock'], message: 'Stock requerido si no es ilimitado' });
    }
    if (values.valid_from && values.valid_until && values.valid_from > values.valid_until) {
      ctx.addIssue({ code: 'custom', path: ['valid_until'], message: 'Debe ser posterior a valid_from' });
    }
    switch (values.reward_type) {
      case 'freespin':
        if (values.freespin_quantity < 1) {
          ctx.addIssue({ code: 'custom', path: ['freespin_quantity'], message: 'Cantidad mínima 1' });
        }
        break;
      case 'freebet':
        if (values.freebet_amount <= 0) {
          ctx.addIssue({ code: 'custom', path: ['freebet_amount'], message: 'Monto requerido' });
        }
        break;
      case 'cashback':
        if (values.cashback_percentage <= 0) {
          ctx.addIssue({ code: 'custom', path: ['cashback_percentage'], message: 'Porcentaje requerido' });
        }
        break;
      case 'bonus_deposit':
        if (values.bonus_percentage <= 0) {
          ctx.addIssue({ code: 'custom', path: ['bonus_percentage'], message: 'Porcentaje requerido' });
        }
        break;
      case 'avatar_pack':
        if (!values.avatar_pack_id.trim()) {
          ctx.addIssue({ code: 'custom', path: ['avatar_pack_id'], message: 'pack_id requerido' });
        }
        break;
      case 'theme':
        if (!values.theme_id.trim()) {
          ctx.addIssue({ code: 'custom', path: ['theme_id'], message: 'theme_id requerido' });
        }
        break;
      case 'manual':
        if (!values.manual_description.trim()) {
          ctx.addIssue({ code: 'custom', path: ['manual_description'], message: 'Descripción requerida' });
        }
        break;
    }
  });

export function defaultShopProductForm(): ShopProductFormValues {
  return {
    code: '',
    name: '',
    description: '',
    image_url: '',
    cost_in_coins: 100,
    currency_code: 'main',
    unlimited_stock: true,
    stock: 0,
    reward_type: 'freespin',
    freespin_quantity: 10,
    freespin_game_id: '',
    freebet_amount: 10,
    freebet_currency: 'USD',
    cashback_percentage: 10,
    cashback_max_amount: 50,
    bonus_percentage: 50,
    bonus_max_amount: 100,
    avatar_pack_id: '',
    theme_id: '',
    manual_description: '',
    min_level: null,
    vip_only: false,
    max_per_player: null,
    valid_from: '',
    valid_until: '',
    is_active: true,
  };
}

export function buildRewardConfig(values: ShopProductFormValues): ShopRewardConfig {
  switch (values.reward_type) {
    case 'freespin':
      return {
        quantity: values.freespin_quantity,
        ...(values.freespin_game_id.trim() ? { game_id: values.freespin_game_id.trim() } : {}),
      };
    case 'freebet':
      return { amount: values.freebet_amount, currency: values.freebet_currency };
    case 'cashback':
      return { percentage: values.cashback_percentage, max_amount: values.cashback_max_amount };
    case 'bonus_deposit':
      return { percentage: values.bonus_percentage, max_amount: values.bonus_max_amount };
    case 'avatar_pack':
      return { pack_id: values.avatar_pack_id.trim() };
    case 'theme':
      return { theme_id: values.theme_id.trim() };
    case 'manual':
      return { description: values.manual_description.trim() };
    default:
      return { description: '' };
  }
}

export function productToForm(product: ShopProduct): ShopProductFormValues {
  const base = defaultShopProductForm();
  const cfg = product.reward_config as unknown as Record<string, unknown>;
  return {
    ...base,
    code: product.code,
    name: product.name,
    description: product.description,
    image_url: product.image_url,
    cost_in_coins: product.cost_in_coins,
    currency_code: product.currency_code,
    unlimited_stock: product.stock === null,
    stock: product.stock ?? 0,
    reward_type: product.reward_type,
    freespin_quantity: Number(cfg.quantity ?? 10),
    freespin_game_id: String(cfg.game_id ?? ''),
    freebet_amount: Number(cfg.amount ?? 10),
    freebet_currency: String(cfg.currency ?? 'USD'),
    cashback_percentage: Number(cfg.percentage ?? 10),
    cashback_max_amount: Number(cfg.max_amount ?? 50),
    bonus_percentage: Number(cfg.percentage ?? 50),
    bonus_max_amount: Number(cfg.max_amount ?? 100),
    avatar_pack_id: String(cfg.pack_id ?? ''),
    theme_id: String(cfg.theme_id ?? ''),
    manual_description: String(cfg.description ?? ''),
    min_level: product.min_level,
    vip_only: product.vip_only,
    max_per_player: product.max_per_player,
    valid_from: product.valid_from?.slice(0, 10) ?? '',
    valid_until: product.valid_until?.slice(0, 10) ?? '',
    is_active: product.is_active,
  };
}

export function formToPayload(values: ShopProductFormValues): ShopProductPayload {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim(),
    cost_in_coins: values.cost_in_coins,
    currency_code: values.currency_code,
    stock: values.unlimited_stock ? null : values.stock,
    reward_type: values.reward_type,
    reward_config: buildRewardConfig(values),
    min_level: values.min_level,
    vip_only: values.vip_only,
    max_per_player: values.max_per_player,
    valid_from: values.valid_from ? `${values.valid_from}T00:00:00.000Z` : null,
    valid_until: values.valid_until ? `${values.valid_until}T23:59:59.000Z` : null,
    is_active: values.is_active,
  };
}

export function validateShopProductForm(
  values: ShopProductFormValues,
  existingCodes: string[],
  editingCode?: string,
): Partial<Record<keyof ShopProductFormValues | 'code', string>> {
  const parsed = shopProductFormSchema.safeParse(values);
  const errors: Partial<Record<keyof ShopProductFormValues | 'code', string>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ShopProductFormValues;
      if (key && !errors[key]) errors[key] = issue.message;
    }
  }
  const normalized = values.code.trim();
  if (normalized && existingCodes.some((c) => c === normalized && c !== editingCode)) {
    errors.code = 'El code ya existe';
  }
  return errors;
}
