import { describe, expect, it } from 'vitest';

import { adaptChestGrantManualPayload } from '@/features/chests/chestsApi';
import { adaptWheelGrantManualPayload } from '@/features/wheels/wheelsApi';

describe('grant-manual payload adapters', () => {
  it('adaptChestGrantManualPayload maps player_id/notes to canonical fields', () => {
    expect(
      adaptChestGrantManualPayload({
        player_id: 'state-uuid',
        chest_type_code: 'WELCOME',
        notes: 'Premio torneo fin de semana',
      }),
    ).toEqual({
      player_state_id: 'state-uuid',
      chest_type_code: 'WELCOME',
      reason: 'Premio torneo fin de semana',
    });
  });

  it('adaptChestGrantManualPayload defaults reason to empty string', () => {
    expect(
      adaptChestGrantManualPayload({
        player_id: 'state-uuid',
        chest_type_code: 'WELCOME',
      }),
    ).toEqual({
      player_state_id: 'state-uuid',
      chest_type_code: 'WELCOME',
      reason: '',
    });
  });

  it('adaptWheelGrantManualPayload maps player_id to player_state_id', () => {
    expect(
      adaptWheelGrantManualPayload({
        player_id: 'state-uuid',
        wheel_code: 'DAILY',
        quantity: 3,
        reason: 'Compensación por incidencia',
      }),
    ).toEqual({
      player_state_id: 'state-uuid',
      wheel_code: 'DAILY',
      quantity: 3,
      reason: 'Compensación por incidencia',
    });
  });
});
