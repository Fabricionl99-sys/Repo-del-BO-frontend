import type { AdminPlayerSummary, PlayerSearchResult } from '@/types/players';
import type { PreviewPlayerSummary } from '@/types/widgetPreview';

export function adminSummaryToPlayerSearchResult(player: AdminPlayerSummary): PlayerSearchResult {
  const main = player.coins[0];
  return {
    player_id: player.id,
    external_player_id: player.external_player_id,
    level: player.current_level,
    coins: main?.balance ?? '0',
    currency_code: main?.currency_code ?? 'main',
  };
}

export function normalizePlayerSearchResult(raw: Record<string, unknown>): PlayerSearchResult {
  if (raw.player_id != null && raw.external_player_id != null && raw.id == null) {
    return {
      player_id: String(raw.player_id),
      external_player_id: String(raw.external_player_id),
      level: Number(raw.level ?? raw.current_level ?? 1),
      coins: Array.isArray(raw.coins)
        ? String((raw.coins[0] as Record<string, unknown>)?.balance ?? '0')
        : String(raw.coins ?? '0'),
      currency_code: Array.isArray(raw.coins)
        ? String((raw.coins[0] as Record<string, unknown>)?.currency_code ?? 'main')
        : String(raw.currency_code ?? 'main'),
    };
  }

  if (raw.external_player_id != null && raw.id != null) {
    return adminSummaryToPlayerSearchResult(normalizeAdminPlayer(raw));
  }

  const player_id = String(raw.player_id ?? raw.player_state_id ?? '');
  const external_player_id = String(
    raw.player_handle ?? raw.display_name ?? raw.external_player_id ?? player_id,
  );
  const level = Number(raw.current_level ?? raw.level ?? 1);

  if (Array.isArray(raw.coins) && raw.coins.length > 0) {
    const first = raw.coins[0] as Record<string, unknown>;
    return {
      player_id,
      external_player_id,
      level,
      coins: String(first.balance ?? first.amount ?? '0'),
      currency_code: String(first.currency_code ?? 'main'),
    };
  }

  return {
    player_id,
    external_player_id,
    level,
    coins: String(raw.coins ?? '0'),
    currency_code: String(raw.currency_code ?? 'main'),
  };
}

export function normalizeAdminPlayer(raw: Record<string, unknown>): AdminPlayerSummary {
  if (raw.external_player_id != null) {
    const coinsRaw = Array.isArray(raw.coins) ? raw.coins : [];
    return {
      id: String(raw.id ?? raw.player_id ?? raw.player_state_id ?? ''),
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
