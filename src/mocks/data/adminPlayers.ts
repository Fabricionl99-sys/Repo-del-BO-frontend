import type { AdminPlayerDetail, AdminPlayerSummary } from '@/types/players';
import { adminSummaryToPlayerSearchResult } from '@/features/players/normalizePlayer';
import { buildPlayerWidgetData } from '@/mocks/data/widgetPreview';

const iso = (offsetMs: number) => new Date(Date.now() - offsetMs).toISOString();

/** Lista canónica alineada al backend real (top 20 por last_event_at). */
export const adminPlayerSummaries: AdminPlayerSummary[] = [
  {
    id: 'ps_demo_operator',
    external_player_id: 'demo_fabricio',
    total_xp: '48200',
    current_level: 28,
    last_event_at: iso(5 * 60 * 1000),
    created_at: iso(120 * 86400000),
    coins: [
      { currency_code: 'main', balance: '12500' },
      { currency_code: 'vip', balance: '800' },
    ],
  },
  {
    id: 'pl_mission',
    external_player_id: 'crypto_king_88',
    total_xp: '12400',
    current_level: 14,
    last_event_at: iso(45 * 60 * 1000),
    created_at: iso(90 * 86400000),
    coins: [{ currency_code: 'main', balance: '2400' }],
  },
  {
    id: 'pl_vip',
    external_player_id: 'vip_roller',
    total_xp: '91000',
    current_level: 32,
    last_event_at: iso(3 * 3600000),
    created_at: iso(200 * 86400000),
    coins: [
      { currency_code: 'main', balance: '5400' },
      { currency_code: 'gems', balance: '120' },
    ],
  },
  {
    id: 'pl_streak',
    external_player_id: 'slot_hunter',
    total_xp: '6200',
    current_level: 9,
    last_event_at: iso(26 * 3600000),
    created_at: iso(45 * 86400000),
    coins: [{ currency_code: 'main', balance: '890' }],
  },
  {
    id: 'pl_newbie',
    external_player_id: 'newbie_spin',
    total_xp: '180',
    current_level: 2,
    last_event_at: null,
    created_at: iso(2 * 86400000),
    coins: [{ currency_code: 'main', balance: '120' }],
  },
];

export function getAdminPlayers(opts?: { search?: string; limit?: number }): AdminPlayerSummary[] {
  const search = opts?.search?.trim().toLowerCase() ?? '';
  let list = [...adminPlayerSummaries];

  if (search) {
    list = list.filter((p) => p.external_player_id.toLowerCase().includes(search));
  } else {
    list.sort((a, b) => {
      const ta = a.last_event_at ? new Date(a.last_event_at).getTime() : 0;
      const tb = b.last_event_at ? new Date(b.last_event_at).getTime() : 0;
      return tb - ta;
    });
  }

  const limit = Math.min(opts?.limit ?? (search ? 50 : 20), 100);
  return list.slice(0, limit);
}

export function getAdminPlayerDetail(playerId: string): AdminPlayerDetail | null {
  const summary = adminPlayerSummaries.find((p) => p.id === playerId);
  if (!summary) return null;

  const legacy = buildPlayerWidgetData(playerId);
  if (legacy) {
    return { ...legacy, player: summary };
  }

  return {
    player: summary,
    missions: [],
    inventory: [],
    shop_products: [],
    rankings: {
      ranking_name: '—',
      period_label: '—',
      player_position: 0,
      player_score: 0,
      top_entries: [],
    },
    news: [],
  };
}

export function setPlayerCurrency(playerId: string, currency_code: string): AdminPlayerSummary | null {
  const player = adminPlayerSummaries.find((p) => p.id === playerId);
  if (!player) return null;
  const idx = player.coins.findIndex((c) => c.currency_code === currency_code);
  if (idx > 0) {
    const [coin] = player.coins.splice(idx, 1);
    player.coins.unshift(coin);
  } else if (idx < 0) {
    player.coins.unshift({ currency_code, balance: '0' });
  }
  return player;
}

export function searchAdminPlayers(q: string, limit = 10) {
  return getAdminPlayers({ search: q, limit }).map(adminSummaryToPlayerSearchResult);
}

export function getPlayerSearchResultById(playerId: string) {
  const player = adminPlayerSummaries.find((p) => p.id === playerId);
  return player ? adminSummaryToPlayerSearchResult(player) : undefined;
}
