import { describe, expect, it } from 'vitest';

import {
  buildRewardConfig,
  defaultShopProductForm,
  formToPayload,
  productToForm,
  shopProductFormSchema,
  validateShopProductForm,
} from './shopProductForm';

describe('shopProductFormSchema', () => {
  it('valida producto freespin mínimo', () => {
    const values = {
      ...defaultShopProductForm(),
      code: 'freespin_test',
      name: 'Test spins',
    };
    const parsed = shopProductFormSchema.safeParse(values);
    expect(parsed.success).toBe(true);
  });

  it('rechaza code con mayúsculas', () => {
    const values = { ...defaultShopProductForm(), code: 'Invalid-Code', name: 'Test' };
    const parsed = shopProductFormSchema.safeParse(values);
    expect(parsed.success).toBe(false);
  });

  it('rechaza freespin sin bonus_id', () => {
    const values = {
      ...defaultShopProductForm(),
      code: 'freespin_zero',
      name: 'Test',
      reward: { reward_type: 'freespin' as const, reward_config: {} },
    };
    const parsed = shopProductFormSchema.safeParse(values);
    expect(parsed.success).toBe(false);
  });

  it('requiere stock si no es ilimitado y está activo', () => {
    const values = {
      ...defaultShopProductForm(),
      code: 'stock_test',
      name: 'Test stock',
      unlimited_stock: false,
      stock: 0,
      is_active: true,
    };
    const parsed = shopProductFormSchema.safeParse(values);
    expect(parsed.success).toBe(false);
  });
});

describe('buildRewardConfig / formToPayload', () => {
  it('arma reward_config freebet con bonus_id y kind', () => {
    const values = {
      ...defaultShopProductForm(),
      reward_type: 'freebet' as const,
      reward: { reward_type: 'freebet' as const, reward_config: { bonus_id: 'ob_fb_sports_25' } },
    };
    expect(buildRewardConfig(values)).toEqual({ bonus_id: 'ob_fb_sports_25', kind: 'freebet' });
  });

  it('payload incluye stock null si ilimitado', () => {
    const payload = formToPayload({
      ...defaultShopProductForm(),
      code: 'unlimited_prod',
      name: 'Ilimitado',
      unlimited_stock: true,
    });
    expect(payload.stock).toBeNull();
    expect(payload.code).toBe('unlimited_prod');
  });
});

describe('productToForm', () => {
  it('normaliza campos nullable del backend sin crash', () => {
    const form = productToForm({
      id: 'p1',
      code: 'test_null',
      name: 'Test',
      description: null,
      image_url: null,
      cost_in_coins: 50,
      currency_code: null as unknown as string,
      stock: null,
      reward_type: 'freespin',
      reward_config: { bonus_id: null as unknown as string },
      min_level: null,
      vip_only: false,
      max_per_player: null,
      valid_from: null,
      valid_until: null,
      is_active: true,
      status: 'active',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });

    expect(form.description).toBe('');
    expect(form.image_url).toBe('');
    expect(form.currency_code).toBe('');
    expect(form.reward.reward_config).toMatchObject({ bonus_id: '' });
  });
});

describe('validateShopProductForm', () => {
  it('detecta code duplicado', () => {
    const values = {
      ...defaultShopProductForm(),
      code: 'existing_code',
      name: 'Duplicado',
    };
    const errors = validateShopProductForm(values, ['existing_code']);
    expect(errors.code).toMatch(/ya existe/i);
  });
});
