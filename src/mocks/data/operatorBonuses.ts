import type {
  BonusGrantHistoryEntry,
  BonusSyncHistoryEntry,
  OperatorBonus,
  OperatorBonusApiConfig,
  OperatorBonusCatalogStats,
} from '@/types/operatorBonuses';

const ago = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

export const operatorBonuses: OperatorBonus[] = [
  {
    id: 'ob_fs_book_dead',
    external_id: 'FS_BOOK_DEAD_50',
    bonus_type: 'freespin',
    name: '50 Free Spins Book of Dead',
    description: 'Pack promocional slots',
    image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200',
    default_value_usd: 25,
    metadata: { game_id: 'book_of_dead', quantity: 50 },
    source: 'manual',
    status: 'active',
    is_active: true,
    verified_at: daysAgo(10),
    created_at: daysAgo(30),
    updated_at: daysAgo(2),
  },
  {
    id: 'ob_fs_starburst',
    external_id: 'FS_STARBURST_20',
    bonus_type: 'freespin',
    name: '20 Free Spins Starburst',
    description: 'Sync desde plataforma',
    image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200',
    default_value_usd: 10,
    metadata: null,
    source: 'api_sync',
    status: 'active',
    is_active: true,
    verified_at: ago(3),
    created_at: daysAgo(14),
    updated_at: ago(3),
  },
  {
    id: 'ob_fs_sweet',
    external_id: 'FS_SWEET_100',
    bonus_type: 'freespin',
    name: '100 Free Spins Sweet Bonanza',
    description: 'Alta rotación',
    image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200',
    default_value_usd: 50,
    metadata: null,
    source: 'api_sync',
    status: 'unverified',
    is_active: true,
    verified_at: null,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
  {
    id: 'ob_fs_legacy',
    external_id: 'FS_LEGACY_10',
    bonus_type: 'freespin',
    name: '10 FS Legacy (deprecated)',
    description: 'Ya no existe en plataforma',
    image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200',
    default_value_usd: 5,
    metadata: null,
    source: 'api_sync',
    status: 'deprecated',
    is_active: false,
    verified_at: daysAgo(60),
    created_at: daysAgo(90),
    updated_at: ago(48),
  },
  {
    id: 'ob_fb_sports_25',
    external_id: 'FB_SPORTS_25',
    bonus_type: 'freebet',
    name: 'Free Bet $25 Deportes',
    description: 'Apuesta gratis sportsbook',
    image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba9681?w=200',
    default_value_usd: 25,
    metadata: { min_odds: 1.5 },
    source: 'manual',
    status: 'active',
    is_active: true,
    verified_at: daysAgo(5),
    created_at: daysAgo(20),
    updated_at: daysAgo(5),
  },
  {
    id: 'ob_fb_casino_10',
    external_id: 'FB_CASINO_10',
    bonus_type: 'freebet',
    name: 'Free Bet $10 Casino',
    description: 'Sync API',
    image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200',
    default_value_usd: 10,
    metadata: null,
    source: 'api_sync',
    status: 'active',
    is_active: true,
    verified_at: ago(5),
    created_at: daysAgo(7),
    updated_at: ago(5),
  },
  {
    id: 'ob_fb_vip',
    external_id: 'FB_VIP_100',
    bonus_type: 'freebet',
    name: 'Free Bet VIP $100',
    description: 'Solo VIP',
    image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba9681?w=200',
    default_value_usd: 100,
    metadata: null,
    source: 'manual',
    status: 'unverified',
    is_active: true,
    verified_at: null,
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
  },
  {
    id: 'ob_cb_weekly',
    external_id: 'CB_WEEKLY_10',
    bonus_type: 'cashback',
    name: 'Cashback 10% Semanal',
    description: 'Max $200 USD',
    image_url: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=200',
    default_value_usd: 200,
    metadata: { percentage: 10, max_amount: 200 },
    source: 'manual',
    status: 'active',
    is_active: true,
    verified_at: daysAgo(8),
    created_at: daysAgo(45),
    updated_at: daysAgo(8),
  },
  {
    id: 'ob_cb_live',
    external_id: 'CB_LIVE_5',
    bonus_type: 'cashback',
    name: 'Cashback 5% Live Casino',
    description: 'Sync plataforma',
    image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=200',
    default_value_usd: 50,
    metadata: null,
    source: 'api_sync',
    status: 'deprecated',
    is_active: false,
    verified_at: daysAgo(30),
    created_at: daysAgo(60),
    updated_at: ago(72),
  },
  {
    id: 'ob_bd_welcome',
    external_id: 'BD_WELCOME_50',
    bonus_type: 'bonus_deposit',
    name: 'Bono Bienvenida 50%',
    description: 'Hasta $200, rollover 5x',
    image_url: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=200',
    default_value_usd: 200,
    metadata: { rollover_multiplier: 5 },
    source: 'manual',
    status: 'active',
    is_active: true,
    verified_at: daysAgo(15),
    created_at: daysAgo(60),
    updated_at: daysAgo(15),
  },
  {
    id: 'ob_bd_reload',
    external_id: 'BD_RELOAD_25',
    bonus_type: 'bonus_deposit',
    name: 'Bono Recarga 25%',
    description: 'Sync API',
    image_url: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=200',
    default_value_usd: 100,
    metadata: null,
    source: 'api_sync',
    status: 'active',
    is_active: true,
    verified_at: ago(2),
    created_at: daysAgo(10),
    updated_at: ago(2),
  },
  {
    id: 'ob_bd_weekend',
    external_id: 'BD_WEEKEND_100',
    bonus_type: 'bonus_deposit',
    name: 'Bono Finde $100',
    description: 'Pendiente verificación',
    image_url: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=200',
    default_value_usd: 100,
    metadata: null,
    source: 'manual',
    status: 'unverified',
    is_active: true,
    verified_at: null,
    created_at: daysAgo(1),
    updated_at: daysAgo(1),
  },
];

export let apiConfig: OperatorBonusApiConfig = {
  api_enabled: true,
  list_endpoint_url: 'https://platform.example.com/api/v1/bonuses',
  validate_endpoint_url: 'https://platform.example.com/api/v1/bonuses/validate',
  grant_endpoint_url: 'https://platform.example.com/api/v1/bonuses/grant',
  auth_type: 'bearer',
  auth_credential: '••••••••••••',
  api_key_header_name: 'X-API-Key',
  auto_sync_enabled: true,
  auto_sync_interval_hours: 6,
  last_sync_at: ago(2),
  last_sync_status: 'success',
};

export const syncHistory: BonusSyncHistoryEntry[] = Array.from({ length: 20 }, (_, i) => ({
  id: `sync_${i}`,
  ran_at: ago(i * 6 + 1),
  run_type: i % 4 === 0 ? 'manual' : 'auto',
  status: i === 3 ? 'failed' : i === 7 ? 'partial' : 'success',
  added_count: i === 3 ? 0 : Math.floor(Math.random() * 3),
  updated_count: i === 3 ? 0 : Math.floor(Math.random() * 5) + 1,
  deprecated_count: i === 7 ? 2 : Math.floor(Math.random() * 2),
  error_message: i === 3 ? 'Connection timeout after 30s' : null,
}));

const modules = ['missions', 'chests', 'rankings', 'shop', 'streaks', 'tournaments', 'predictions'];
const players = ['crypto_king_88', 'MariaG_bet', 'tigre_loco_82', 'joaquin_play', 'sofia_bet'];

export const grantHistory: BonusGrantHistoryEntry[] = Array.from({ length: 50 }, (_, i) => {
  const bonus = operatorBonuses[i % operatorBonuses.length];
  const player = players[i % players.length];
  const status = i % 10 === 0 ? 'failed' : i % 15 === 0 ? 'sent' : 'success';
  return {
    id: `grant_${i}`,
    granted_at: ago(i * 2 + 0.5),
    bonus_id: bonus.id,
    bonus_name: bonus.name,
    bonus_external_id: bonus.external_id,
    player_id: `player_${player}`,
    player_handle: `@${player}`,
    source_module: modules[i % modules.length],
    status,
    attempts_count: status === 'failed' ? 3 : 1,
    last_response: status === 'success' ? { ok: true, grant_id: `g_${i}` } : { error: 'timeout' },
    request_payload: {
      bonus_external_id: bonus.external_id,
      player_id: `player_${player}`,
      source: modules[i % modules.length],
    },
    attempts: [
      {
        id: `att_${i}_1`,
        attempted_at: ago(i * 2 + 0.5),
        status: status === 'failed' ? 'failed' : status,
        http_status: status === 'failed' ? 504 : 200,
        response_body: status === 'failed' ? { error: 'timeout' } : { ok: true },
        error_message: status === 'failed' ? 'Gateway timeout' : null,
      },
    ],
  };
});

export function computeCatalogStats(bonuses: OperatorBonus[]): OperatorBonusCatalogStats {
  return {
    total_active: bonuses.filter((b) => b.status === 'active').length,
    total_deprecated: bonuses.filter((b) => b.status === 'deprecated').length,
    total_unverified: bonuses.filter((b) => b.status === 'unverified').length,
    last_sync_at: apiConfig.last_sync_at,
    last_sync_status: apiConfig.last_sync_status,
  };
}

export const seedOperatorBonuses: OperatorBonus[] = JSON.parse(JSON.stringify(operatorBonuses));
export const seedApiConfig: OperatorBonusApiConfig = JSON.parse(JSON.stringify(apiConfig));
export const seedSyncHistory: BonusSyncHistoryEntry[] = JSON.parse(JSON.stringify(syncHistory));
export const seedGrantHistory: BonusGrantHistoryEntry[] = JSON.parse(JSON.stringify(grantHistory));

export function resetOperatorBonusesStore() {
  operatorBonuses.length = 0;
  operatorBonuses.push(...JSON.parse(JSON.stringify(seedOperatorBonuses)));
  apiConfig = JSON.parse(JSON.stringify(seedApiConfig));
  syncHistory.length = 0;
  syncHistory.push(...JSON.parse(JSON.stringify(seedSyncHistory)));
  grantHistory.length = 0;
  grantHistory.push(...JSON.parse(JSON.stringify(seedGrantHistory)));
}

export function filterOperatorBonuses(params: URLSearchParams): OperatorBonus[] {
  const type = params.get('bonus_type');
  const source = params.get('source');
  const status = params.get('status');
  const search = params.get('search')?.toLowerCase();
  return operatorBonuses.filter((b) => {
    if (type && type !== 'all' && b.bonus_type !== type) return false;
    if (source && source !== 'all' && b.source !== source) return false;
    if (status && status !== 'all' && b.status !== status) return false;
    if (
      search &&
      !b.name.toLowerCase().includes(search) &&
      !b.external_id.toLowerCase().includes(search)
    ) {
      return false;
    }
    return true;
  });
}

export function filterGrantHistory(params: URLSearchParams): BonusGrantHistoryEntry[] {
  const status = params.get('status');
  const bonusId = params.get('bonus_id');
  const module = params.get('source_module');
  const playerSearch = params.get('player_search')?.toLowerCase();
  return grantHistory.filter((g) => {
    if (status && status !== 'all' && g.status !== status) return false;
    if (bonusId && bonusId !== 'all' && g.bonus_id !== bonusId) return false;
    if (module && module !== 'all' && g.source_module !== module) return false;
    if (
      playerSearch &&
      !g.player_handle.toLowerCase().includes(playerSearch) &&
      !g.player_id.toLowerCase().includes(playerSearch)
    ) {
      return false;
    }
    return true;
  });
}
