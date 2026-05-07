export type MilestoneUnlock = 'avatar_pack_1' | 'own_photo' | 'vip_tournaments';

export interface LevelEntry {
  level: number;
  xpRequired: number;
  displayName?: string;
  badgeImageUrl?: string;
  milestoneEnabled: boolean;
  milestoneUnlock?: MilestoneUnlock | null;
}

export interface LevelsCurve {
  version: number;
  totalLevels: number;
  levels: LevelEntry[];
  updatedAt: string;
  publishedAt: string | null;
}

/** @deprecated Presets removed from product UI; kept for optional tooling */
export interface CurvePreset {
  id: 'casual' | 'balanced' | 'vip-focused' | 'exponential';
  name: string;
  description: string;
  miniChart: number[];
  formula: { xpBase: number; multiplier: number; exponent: number };
}

export interface PlayerDistribution {
  level: number;
  count: number;
}

export interface CurvePreview {
  affectedPlayers: number;
  levelChanges: Array<{ fromLevel: number; toLevel: number; playersCount: number }>;
}
