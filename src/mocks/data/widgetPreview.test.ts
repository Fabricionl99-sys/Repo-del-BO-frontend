import { describe, expect, it } from 'vitest';

import { buildPlayerWidgetData, getPreviewPlayers } from '@/mocks/data/widgetPreview';

describe('widgetPreview mocks', () => {
  it('expone 5 jugadores con tags variados', () => {
    const players = getPreviewPlayers();
    expect(players).toHaveLength(5);
    const tags = players.map((p) => p.profile_tag);
    expect(tags).toContain('new');
    expect(tags).toContain('vip');
    expect(tags).toContain('mission_active');
    expect(tags).toContain('streak');
    expect(tags).toContain('pending_rewards');
  });

  it('arma widget completo por jugador', () => {
    const data = buildPlayerWidgetData('pl_mission');
    expect(data?.player.handle).toBe('crypto_king_88');
    expect(data?.missions.length).toBeGreaterThan(0);
    expect(data?.rankings.top_entries).toHaveLength(3);
  });
});
