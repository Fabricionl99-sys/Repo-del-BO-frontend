import { describe, expect, it } from 'vitest';

import { formToRewardValue, rewardValueToForm, summarizeReward } from './rewardForm';

describe('rewardForm', () => {
  it('convierte freespin con bonus_id interno', () => {
    const value = formToRewardValue(
      {
        ...rewardValueToForm({ reward_type: 'freespin', reward_config: {} }),
        bonus_id: '550e8400-e29b-41d4-a716-446655440000',
      },
      {
        operator_bonuses: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            external_id: 'FS_BOOK',
            bonus_type: 'freespin',
            name: '50 FS Book',
            description: '',
            image_url: '',
            default_value_usd: 10,
            metadata: null,
            source: 'manual',
            status: 'active',
            is_active: true,
            verified_at: null,
            created_at: '',
            updated_at: '',
          },
        ],
      },
    );
    expect(value.reward_config).toEqual({
      kind: 'freespin',
      bonus_id: '550e8400-e29b-41d4-a716-446655440000',
    });
  });

  it('resume bono con contexto', () => {
    const text = summarizeReward(
      { reward_type: 'freespin', reward_config: { bonus_id: 'ob_fs_book_dead' } },
      {
        operator_bonuses: [
          {
            id: 'ob_fs_book_dead',
            external_id: 'FS_BOOK',
            bonus_type: 'freespin',
            name: '50 FS Book',
            description: '',
            image_url: '',
            default_value_usd: 10,
            metadata: null,
            source: 'manual',
            status: 'active',
            is_active: true,
            verified_at: null,
            created_at: '',
            updated_at: '',
          },
        ],
        available_chests: [],
        available_wheels: [],
        available_avatars: [],
        available_coins: [],
        active_currencies: [],
        activeModuleCodes: null,
      },
    );
    expect(text).toContain('50 FS Book');
  });
});
