import { describe, expect, it } from 'vitest';

import { adaptChestGrantManualPayload } from '@/features/chests/chestsApi';
import { adaptWheelGrantManualPayload } from '@/features/wheels/wheelsApi';
import { adaptAvatarGrantManualPayload } from '@/features/avatars/avatarsApi';

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

  it('adaptChestGrantManualPayload prefers reason over notes', () => {
    expect(
      adaptChestGrantManualPayload({
        player_id: 'state-uuid',
        chest_type_code: 'WELCOME',
        reason: 'Premio torneo fin de semana',
        notes: 'ignored',
      }),
    ).toEqual({
      player_state_id: 'state-uuid',
      chest_type_code: 'WELCOME',
      reason: 'Premio torneo fin de semana',
    });
  });

  it('adaptChestGrantManualPayload maps notes to reason when reason omitted', () => {
    expect(
      adaptChestGrantManualPayload({
        player_id: 'state-uuid',
        chest_type_code: 'WELCOME',
        notes: 'Entrega manual desde BO',
      }),
    ).toEqual({
      player_state_id: 'state-uuid',
      chest_type_code: 'WELCOME',
      reason: 'Entrega manual desde BO',
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

  it('adaptAvatarGrantManualPayload keeps canonical player_state_id and reason', () => {
    expect(
      adaptAvatarGrantManualPayload({
        player_state_id: 'state-uuid',
        avatar_ids: ['av_1', 'av_2'],
        reason: 'Premio torneo',
      }),
    ).toEqual({
      player_state_id: 'state-uuid',
      avatar_ids: ['av_1', 'av_2'],
      reason: 'Premio torneo',
    });
  });
});
