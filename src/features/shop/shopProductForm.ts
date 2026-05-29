import { z } from 'zod';

import { rewardValueSchema } from '@/features/rewards/rewardForm';
import { resolveShopCurrencyCode } from '@/features/shop/shopProductPayload';
import type { Coin } from '@/types/coins';
import type { ShopProduct, ShopProductPayload, ShopRewardType } from '@/types/shop';
import type { RewardValue } from '@/types/rewards';

export const SHOP_REWARD_TYPES: ShopRewardType[] = [
  'freespin',
  'freebet',
  'cashback',
  'bonus_deposit',
  'coins',
  'chest',
  'avatar_pack',
  'manual',
];

// Sprint #6 — SHOP_CURRENCY_CODES legacy hardcoded eliminado. El form ahora
// usa `useCoins()` para listar las monedas reales del operador. Mantenemos
// el export para tests + retrocompat momentánea.
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
  reward: RewardValue;
  theme_id: string;
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
    image_url: z
      .string()
      .min(1, 'Imagen requerida')
      .regex(/^https:\/\/.+/i, 'La imagen debe ser URL HTTPS (https://…)'),
    cost_in_coins: z.number().int('Debe ser entero').min(1, 'Mínimo 1 moneda'),
    currency_code: z.string().min(1, 'Seleccioná moneda'),
    unlimited_stock: z.boolean(),
    stock: z.number().int().min(0, 'Stock no puede ser negativo'),
    reward_type: z.enum([
      'freespin',
      'freebet',
      'cashback',
      'bonus_deposit',
      'coins',
      'chest',
      'avatar_pack',
      'manual',
    ]),
    reward: rewardValueSchema,
    theme_id: z.string(),
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
  });

export function defaultShopProductForm(): ShopProductFormValues {
  return {
    code: '',
    name: '',
    description: '',
    image_url: 'https://cdn.social2game.com/defaults/shop-product.png',
    cost_in_coins: 100,
    currency_code: 'main',
    unlimited_stock: true,
    stock: 0,
    // Sprint #6 — default 'manual' para no exigir bonus_id que el tenant
    // puede no tener. El operador cambia a freespin/freebet/etc desde el
    // selector → ahí elige bono real del catálogo Bonos.
    reward_type: 'manual',
    reward: {
      reward_type: 'manual',
      reward_config: { description: 'Premio manual', value_usd: 0 },
      currency_mode: 'auto_usd',
    },
    theme_id: '',
    min_level: null,
    vip_only: false,
    max_per_player: null,
    valid_from: '',
    valid_until: '',
    is_active: true,
  };
}

export function buildRewardConfig(values: ShopProductFormValues): ShopProduct['reward_config'] {
  const cfg = values.reward.reward_config as unknown as Record<string, unknown>;
  const kind = values.reward.reward_type;
  return { ...cfg, kind } as unknown as ShopProduct['reward_config'];
}

export function productToForm(product: ShopProduct, coins: Coin[] = []): ShopProductFormValues {
  const base = defaultShopProductForm();
  const cfg = product.reward_config as unknown as Record<string, unknown>;
  const rewardType = product.reward_type as ShopRewardType;
  return {
    ...base,
    code: product.code,
    name: product.name,
    description: product.description,
    image_url: product.image_url,
    cost_in_coins: product.cost_in_coins,
    currency_code: resolveShopCurrencyCode(product.currency_code, coins),
    unlimited_stock: product.stock === null,
    stock: product.stock ?? 0,
    reward_type: rewardType,
    reward: {
      reward_type: rewardType as RewardValue['reward_type'],
      reward_config: cfg,
      currency_mode: 'auto_usd',
    },
    min_level: product.min_level,
    vip_only: product.vip_only,
    max_per_player: product.max_per_player,
    valid_from: product.valid_from?.slice(0, 10) ?? '',
    valid_until: product.valid_until?.slice(0, 10) ?? '',
    is_active: product.is_active,
  };
}

export function formToPayload(values: ShopProductFormValues, coins: Coin[] = []): ShopProductPayload {
  const rewardType = values.reward.reward_type;
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    description: values.description.trim(),
    image_url: values.image_url.trim(),
    cost_in_coins: Math.max(1, Math.floor(values.cost_in_coins)),
    currency_code: resolveShopCurrencyCode(values.currency_code, coins),
    stock: values.unlimited_stock ? null : values.stock,
    reward_type: rewardType as ShopRewardType,
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
