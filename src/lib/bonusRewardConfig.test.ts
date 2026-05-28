import { describe, expect, it } from 'vitest';

import { buildBackendBonusRewardConfig, isBonusUuid, resolveOperatorBonusId } from './bonusRewardConfig';

describe('bonusRewardConfig', () => {
  const bonuses = [
    { id: '550e8400-e29b-41d4-a716-446655440000', external_id: 'bono_welcome_freespin_001' },
  ];

  it('detecta UUID válido', () => {
    expect(isBonusUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isBonusUuid('bono_welcome_freespin_001')).toBe(false);
  });

  it('resuelve external_id al id interno', () => {
    expect(resolveOperatorBonusId('bono_welcome_freespin_001', bonuses)).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('arma payload backend sin campos extra', () => {
    expect(
      buildBackendBonusRewardConfig('freespin', { bonus_id: 'bono_welcome_freespin_001', external_bonus_id: 'x' }, bonuses),
    ).toEqual({
      kind: 'freespin',
      bonus_id: '550e8400-e29b-41d4-a716-446655440000',
    });
  });
});
