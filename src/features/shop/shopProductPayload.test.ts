import { describe, expect, it } from 'vitest';

import type { Coin } from '@/types/coins';
import type { ShopProductPayload } from '@/types/shop';

import { adaptShopPayloadForBackend, resolveShopCurrencyCode } from './shopProductPayload';

const COIN_UUID = '550e8400-e29b-41d4-a716-446655440000';

const coins: Coin[] = [
  {
    id: COIN_UUID,
    name: 'Moneda Oro',
    symbol: 'ORO',
    deliveryMode: 'manual',
    caps: {},
    p2p: { enabled: false },
    isDefault: true,
    active: true,
    totalInCirculation: 0,
    emittedThisWeek: 0,
    redeemedThisWeek: 0,
  },
];

function basePayload(overrides: Partial<ShopProductPayload> = {}): ShopProductPayload {
  return {
    code: 'test_product',
    name: 'Test',
    description: '',
    image_url: 'https://cdn.social2game.com/test.png',
    cost_in_coins: 100,
    currency_code: 'ORO',
    stock: null,
    reward_type: 'manual',
    reward_config: { description: 'Premio manual' },
    min_level: null,
    vip_only: false,
    max_per_player: null,
    valid_from: null,
    valid_until: null,
    is_active: true,
    ...overrides,
  };
}

describe('resolveShopCurrencyCode', () => {
  it('resuelve UUID a code del catálogo', () => {
    expect(resolveShopCurrencyCode(COIN_UUID, coins)).toBe('ORO');
  });

  it('deja pasar code string', () => {
    expect(resolveShopCurrencyCode('USD', coins)).toBe('USD');
  });
});

describe('adaptShopPayloadForBackend', () => {
  it('envía currency_code string, no currency_id', () => {
    const body = adaptShopPayloadForBackend(
      basePayload({ currency_code: COIN_UUID }),
      coins,
    );
    expect(body.currency_code).toBe('ORO');
    expect(body).not.toHaveProperty('currency_id');
  });

  it('normaliza cost_in_coins a entero positivo', () => {
    const body = adaptShopPayloadForBackend(basePayload({ cost_in_coins: 99.7 }));
    expect(body.cost_in_coins).toBe(99);
  });

  it('alinea reward_config.kind con reward_type', () => {
    const body = adaptShopPayloadForBackend(
      basePayload({
        reward_type: 'freespin',
        reward_config: { bonus_id: 'bonus-uuid' },
      }),
    );
    expect(body.reward_type).toBe('freespin');
    expect((body.reward_config as { kind: string }).kind).toBe('freespin');
  });

  it('rechaza image_url sin https', () => {
    expect(() =>
      adaptShopPayloadForBackend(basePayload({ image_url: 'http://insecure.example/a.png' })),
    ).toThrow(/https/i);
  });
});
