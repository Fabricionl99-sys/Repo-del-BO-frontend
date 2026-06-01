import { describe, expect, it } from 'vitest';

import {
  avatarFormSchema,
  defaultAvatarForm,
  formToCreatePayload,
  getAvatarImageUrl,
} from './avatarForm';

describe('avatarFormSchema', () => {
  it('valida unlock_config de shop', () => {
    const values = {
      ...defaultAvatarForm(),
      code: 'test_shop',
      name: 'Test Shop',
      category_id: 'cat_animales',
      unlock_method: 'shop' as const,
      shop_cost_in_coins: 100,
    };
    expect(avatarFormSchema.safeParse(values).success).toBe(true);
  });

  it('exige mission_code para método mission', () => {
    const values = {
      ...defaultAvatarForm(),
      code: 'test_mission',
      name: 'Test Mission',
      category_id: 'cat_animales',
      unlock_method: 'mission' as const,
      mission_code: '',
    };
    const parsed = avatarFormSchema.safeParse(values);
    expect(parsed.success).toBe(false);
  });

  it('exige chest_type_codes para método chest', () => {
    const values = {
      ...defaultAvatarForm(),
      code: 'test_chest',
      name: 'Test Chest',
      category_id: 'cat_animales',
      unlock_method: 'chest' as const,
      chest_type_codes: [],
    };
    expect(avatarFormSchema.safeParse(values).success).toBe(false);
  });

  it('mapea payload de creación con unlock_config', () => {
    const values = {
      ...defaultAvatarForm(),
      code: 'leon_test',
      name: 'León Test',
      category_id: 'cat_animales',
      unlock_method: 'level_up' as const,
      level_required_level: 10,
    };
    const payload = formToCreatePayload(values, 'https://example.com/leon.png');
    expect(payload.unlock_config).toEqual({ required_level: 10 });
    expect(payload.image_url).toBe('https://example.com/leon.png');
  });
});

describe('getAvatarImageUrl', () => {
  it('prefiere image_urls.original sobre image_url', () => {
    expect(
      getAvatarImageUrl({
        image_urls: { original: 'https://cdn.example.com/original.png' },
        image_url: 'https://cdn.example.com/alias.png',
      }),
    ).toBe('https://cdn.example.com/original.png');
  });

  it('usa image_url como fallback', () => {
    expect(getAvatarImageUrl({ image_url: 'https://cdn.example.com/alias.png' })).toBe(
      'https://cdn.example.com/alias.png',
    );
  });

  it('devuelve null si no hay imagen', () => {
    expect(getAvatarImageUrl({})).toBeNull();
    expect(getAvatarImageUrl(null)).toBeNull();
  });
});
