import { describe, expect, it } from 'vitest';
import { levelsCurveToBackend } from './levelsCurveApi';
import type { LevelsCurve } from '@/types/levels';

describe('levelsCurveApi', () => {
  it('serializa PUT como array directo con level_number derivado del índice', () => {
    const curve: LevelsCurve = {
      version: 1,
      totalLevels: 3,
      levels: [
        { level: 99, xpRequired: 0, milestoneEnabled: false, milestoneUnlock: null },
        { level: 88, xpRequired: 100, milestoneEnabled: false, milestoneUnlock: null },
        { level: 77, xpRequired: 600, milestoneEnabled: false, milestoneUnlock: null },
      ],
      updatedAt: '',
      publishedAt: null,
    };

    expect(levelsCurveToBackend(curve)).toEqual([
      { level_number: 1, xp_required: 0, rewards: [] },
      { level_number: 2, xp_required: 100, rewards: [] },
      { level_number: 3, xp_required: 600, rewards: [] },
    ]);
  });
});
