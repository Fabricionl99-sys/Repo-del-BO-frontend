import { describe, expect, it } from 'vitest';

import { avatarCategoryFormSchema, formToCategoryPayload } from './avatarCategoryForm';

describe('avatarCategoryFormSchema', () => {
  it('valida categoría mínima', () => {
    const parsed = avatarCategoryFormSchema.safeParse({
      code: 'test_cat',
      name: 'Test Cat',
      description: '',
      icon: 'Star',
      display_order: 0,
      is_active: true,
      restrictions: { min_level: null, vip_only: false, new_players_only: false },
    });
    expect(parsed.success).toBe(true);
  });

  it('rechaza code inválido', () => {
    const parsed = avatarCategoryFormSchema.safeParse({
      code: 'INVALID CODE',
      name: 'X',
      description: '',
      icon: 'Star',
      display_order: 0,
      is_active: true,
      restrictions: { min_level: null, vip_only: false, new_players_only: false },
    });
    expect(parsed.success).toBe(false);
  });

  it('mapea payload', () => {
    const payload = formToCategoryPayload({
      code: 'vip_test',
      name: 'VIP Test',
      description: 'desc',
      icon: 'Crown',
      display_order: 3,
      is_active: true,
      restrictions: { min_level: 5, vip_only: true, new_players_only: false },
    });
    expect(payload.code).toBe('vip_test');
    expect(payload.restrictions.vip_only).toBe(true);
  });
});
