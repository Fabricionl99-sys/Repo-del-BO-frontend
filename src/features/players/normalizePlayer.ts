import type { AdminPlayerSummary } from '@/types/players';
import type { PreviewPlayerSummary } from '@/types/widgetPreview';

export function normalizeAdminPlayer(raw: Record<string, unknown>): AdminPlayerSummary {
  if (raw.external_player_id != null) {
    const coinsRaw = Array.isArray(raw.coins) ? raw.coins : [];
    return {
      id: String(raw.id),
      external_player_id: String(raw.external_player_id),
      total_xp: String(raw.total_xp ?? '0'),
      current_level: Number(raw.current_level ?? 1),
      last_event_at: (raw.last_event_at as string | null) ?? null,
      created_at: String(raw.created_at ?? new Date().toISOString()),
      coins: coinsRaw.map((c) => {
        const row = c as Record<string, unknown>;
        return {
          currency_code: String(row.currency_code ?? 'main'),
          balance: String(row.balance ?? '0'),
        };
      }),
    };
  }

  const legacy = raw as unknown as PreviewPlayerSummary;
  return {
    id: String(legacy.id),
    external_player_id: legacy.handle ?? legacy.display_name ?? String(legacy.id),
    total_xp: String(legacy.xp ?? 0),
    current_level: Number(legacy.level ?? 1),
    last_event_at: null,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    coins: [
      {
        currency_code: legacy.currency_code ?? 'main',
        balance: String(legacy.coins ?? 0),
      },
    ],
  };
}

export function toPreviewPlayerSummary(player: AdminPlayerSummary): PreviewPlayerSummary {
  const main = player.coins[0];
  const tag =
    player.current_level >= 20
      ? 'vip'
      : player.current_level <= 3
        ? 'new'
        : 'mission_active';

  return {
    id: player.id,
    handle: player.external_player_id,
    display_name: player.external_player_id,
    avatar_url: '',
    level: player.current_level,
    xp: Number(player.total_xp) || 0,
    xp_to_next: 0,
    coins: Number(main?.balance ?? 0),
    currency_code: main?.currency_code ?? 'main',
    streak_days: 0,
    pending_rewards_count: 0,
    active_missions_count: 0,
    profile_tag: tag,
  };
}
