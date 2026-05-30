import { describe, expect, it } from 'vitest';
import { backendToLevelsCurve, levelsCurveToBackend } from './levelsCurveApi';
import type { LevelsCurve } from '@/types/levels';

describe('levelsCurveApi', () => {
  it('serializa PUT con level_number, xp, name, badge_url e is_milestone', () => {
    const curve: LevelsCurve = {
      version: 1,
      totalLevels: 3,
      levels: [
        {
          level: 99,
          xpRequired: 0,
          displayName: 'Bronce',
          badgeImageUrl: undefined,
          milestoneEnabled: false,
          milestoneUnlock: null,
        },
        {
          level: 88,
          xpRequired: 100,
          displayName: 'Plata',
          badgeImageUrl: 'https://cdn.example.com/plata.png',
          milestoneEnabled: true,
          milestoneUnlock: null,
        },
        { level: 77, xpRequired: 600, milestoneEnabled: false, milestoneUnlock: null },
      ],
      updatedAt: '',
      publishedAt: null,
    };

    expect(levelsCurveToBackend(curve)).toEqual([
      {
        level_number: 1,
        xp_required: 0,
        rewards: [],
        name: 'Bronce',
        badge_url: null,
        is_milestone: false,
      },
      {
        level_number: 2,
        xp_required: 100,
        rewards: [],
        name: 'Plata',
        badge_url: 'https://cdn.example.com/plata.png',
        is_milestone: true,
      },
      {
        level_number: 3,
        xp_required: 600,
        rewards: [],
        name: null,
        badge_url: null,
        is_milestone: false,
      },
    ]);
  });

  it('parsea GET con name, badge_url e is_milestone', () => {
    const curve = backendToLevelsCurve([
      {
        level_number: 1,
        xp_required: 0,
        rewards: [],
        name: 'Bronce I',
        badge_url: 'https://cdn.example.com/bronce.png',
        is_milestone: true,
      },
    ]);

    expect(curve.levels[0]).toMatchObject({
      displayName: 'Bronce I',
      badgeImageUrl: 'https://cdn.example.com/bronce.png',
      milestoneEnabled: true,
    });
  });
});
