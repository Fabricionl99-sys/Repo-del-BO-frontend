import { describe, expect, it } from 'vitest';

import {
  buildRewardConfig,
  defaultShopProductForm,
  formToPayload,
  shopProductFormSchema,
  validateShopProductForm,
} from './shopProductForm';

describe('shopProductFormSchema', () => {
  it('valida producto freespin mínimo', () => {
    const values = {
      ...defaultShopProductForm(),
      code: 'freespin_test',
      name: 'Test spins',
      freespin_quantity: 10,
    };
    const parsed = shopProductFormSchema.safeParse(values);
    expect(parsed.success).toBe(true);
  });

  it('rechaza code con mayúsculas', () => {
    const values = { ...defaultShopProductForm(), code: 'Invalid-Code', name: 'Test' };
    const parsed = shopProductFormSchema.safeParse(values);
    expect(parsed.success).toBe(false);
  });

  it('rechaza freespin sin cantidad', () => {
    const values = {
      ...defaultShopProductForm(),
      code: 'freespin_zero',
      name: 'Test',
      freespin_quantity: 0,
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
      freespin_quantity: 5,
    };
    const parsed = shopProductFormSchema.safeParse(values);
    expect(parsed.success).toBe(false);
  });
});

describe('buildRewardConfig / formToPayload', () => {
  it('arma reward_config freebet', () => {
    const values = {
      ...defaultShopProductForm(),
      reward_type: 'freebet' as const,
      freebet_amount: 25,
      freebet_currency: 'USD',
    };
    expect(buildRewardConfig(values)).toEqual({ amount: 25, currency: 'USD' });
  });

  it('payload incluye stock null si ilimitado', () => {
    const payload = formToPayload({
      ...defaultShopProductForm(),
      code: 'unlimited_prod',
      name: 'Ilimitado',
      unlimited_stock: true,
      freespin_quantity: 5,
    });
    expect(payload.stock).toBeNull();
    expect(payload.code).toBe('unlimited_prod');
  });
});

describe('validateShopProductForm', () => {
  it('detecta code duplicado', () => {
    const values = {
      ...defaultShopProductForm(),
      code: 'existing_code',
      name: 'Duplicado',
      freespin_quantity: 5,
    };
    const errors = validateShopProductForm(values, ['existing_code']);
    expect(errors.code).toMatch(/ya existe/i);
  });
});
