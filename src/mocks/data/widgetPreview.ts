import type {
  PlayerWidgetData,
  PreviewPlayerSummary,
  WidgetInventoryItem,
  WidgetMission,
  WidgetNewsItem,
  WidgetRankingData,
  WidgetShopProduct,
} from '@/types/widgetPreview';

const img = {
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128',
  avatarVip: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128',
  avatarNeon: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=128',
  chest: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200',
  wheel: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200',
  shop: 'https://images.unsplash.com/photo-1621761190629-7961477624c4?w=200',
  news: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
  bonus: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=200',
};

export const previewPlayers: PreviewPlayerSummary[] = [
  {
    id: 'pl_newbie',
    handle: 'newbie_spin',
    display_name: 'Newbie Spin',
    avatar_url: img.avatar,
    level: 2,
    xp: 180,
    xp_to_next: 500,
    coins: 120,
    currency_code: 'main',
    streak_days: 0,
    pending_rewards_count: 0,
    active_missions_count: 1,
    profile_tag: 'new',
  },
  {
    id: 'pl_vip',
    handle: 'vip_roller',
    display_name: 'VIP Roller',
    avatar_url: img.avatarVip,
    level: 28,
    xp: 48200,
    xp_to_next: 52000,
    coins: 12500,
    currency_code: 'vip',
    streak_days: 5,
    pending_rewards_count: 2,
    active_missions_count: 3,
    profile_tag: 'vip',
  },
  {
    id: 'pl_mission',
    handle: 'crypto_king_88',
    display_name: 'Crypto King',
    avatar_url: img.avatarNeon,
    level: 14,
    xp: 12400,
    xp_to_next: 15000,
    coins: 2400,
    currency_code: 'main',
    streak_days: 3,
    pending_rewards_count: 1,
    active_missions_count: 3,
    profile_tag: 'mission_active',
  },
  {
    id: 'pl_streak',
    handle: 'slot_hunter',
    display_name: 'Slot Hunter',
    avatar_url: img.avatar,
    level: 9,
    xp: 6200,
    xp_to_next: 8000,
    coins: 890,
    currency_code: 'main',
    streak_days: 12,
    pending_rewards_count: 0,
    active_missions_count: 2,
    profile_tag: 'streak',
  },
  {
    id: 'pl_pending',
    handle: 'retry_me',
    display_name: 'Retry Me',
    avatar_url: img.avatarNeon,
    level: 11,
    xp: 9100,
    xp_to_next: 11000,
    coins: 1560,
    currency_code: 'main',
    streak_days: 1,
    pending_rewards_count: 4,
    active_missions_count: 2,
    profile_tag: 'pending_rewards',
  },
];

function missionsFor(playerId: string): WidgetMission[] {
  const base: Record<string, WidgetMission[]> = {
    pl_newbie: [
      {
        id: 'm1',
        title: 'Primer depósito',
        description: 'Depositá $10 y desbloqueá tu cofre de bienvenida',
        progress_percent: 0,
        progress_current: 0,
        progress_target: 10,
        reward_label: 'Cofre Bronce',
        expires_at: null,
      },
    ],
    pl_vip: [
      {
        id: 'm1',
        title: 'Apostá en slots premium',
        description: 'Acumulá $500 en apuestas en slots VIP',
        progress_percent: 72,
        progress_current: 360,
        progress_target: 500,
        reward_label: '50 Free Spins',
        expires_at: '2026-05-20T23:59:59Z',
      },
      {
        id: 'm2',
        title: 'Torneo semanal',
        description: 'Quedá en top 50 del torneo',
        progress_percent: 45,
        progress_current: 45,
        progress_target: 100,
        reward_label: 'Freebet $25',
        expires_at: '2026-05-18T23:59:59Z',
      },
      {
        id: 'm3',
        title: 'Misión diaria VIP',
        description: 'Completá 3 apuestas con odds > 2.0',
        progress_percent: 100,
        progress_current: 3,
        progress_target: 3,
        reward_label: '500 monedas VIP',
        expires_at: null,
      },
    ],
    pl_mission: [
      {
        id: 'm1',
        title: 'Ganá 3 apuestas seguidas',
        description: 'Racha de victorias en deportes',
        progress_percent: 66,
        progress_current: 2,
        progress_target: 3,
        reward_label: 'Freebet $10',
        expires_at: '2026-05-17T23:59:59Z',
      },
      {
        id: 'm2',
        title: 'Explorá la tienda',
        description: 'Canjeá un producto de la tienda',
        progress_percent: 0,
        progress_current: 0,
        progress_target: 1,
        reward_label: '200 monedas',
        expires_at: null,
      },
      {
        id: 'm3',
        title: 'Predicción del finde',
        description: 'Participá en el evento de predicción',
        progress_percent: 50,
        progress_current: 1,
        progress_target: 2,
        reward_label: '15 Free Spins',
        expires_at: '2026-05-19T12:00:00Z',
      },
    ],
    pl_streak: [
      {
        id: 'm1',
        title: 'Racha de login',
        description: 'Ingresá 12 días seguidos',
        progress_percent: 100,
        progress_current: 12,
        progress_target: 12,
        reward_label: 'Cofre Plata',
        expires_at: null,
      },
      {
        id: 'm2',
        title: 'Slots del día',
        description: 'Jugá 50 spins en slots',
        progress_percent: 80,
        progress_current: 40,
        progress_target: 50,
        reward_label: 'Cashback 5%',
        expires_at: '2026-05-16T23:59:59Z',
      },
    ],
    pl_pending: [
      {
        id: 'm1',
        title: 'Misión completada',
        description: 'Reclamá tu premio pendiente',
        progress_percent: 100,
        progress_current: 1,
        progress_target: 1,
        reward_label: 'Bono depósito',
        expires_at: null,
      },
      {
        id: 'm2',
        title: 'Cofre sin abrir',
        description: 'Tenés premios esperando en inventario',
        progress_percent: 100,
        progress_current: 4,
        progress_target: 4,
        reward_label: '4 premios',
        expires_at: null,
      },
    ],
  };
  return base[playerId] ?? base.pl_newbie;
}

function inventoryFor(playerId: string): WidgetInventoryItem[] {
  const chest: WidgetInventoryItem = {
    id: 'inv_chest',
    kind: 'chest',
    title: 'Cofre Bronce',
    subtitle: 'Sin abrir',
    image_url: img.chest,
    quantity: 1,
    status: 'available',
  };
  const wheel: WidgetInventoryItem = {
    id: 'inv_wheel',
    kind: 'wheel_spin',
    title: 'Giro de ruleta',
    subtitle: 'Ruleta diaria',
    image_url: img.wheel,
    quantity: 2,
    status: 'available',
  };
  const pending: WidgetInventoryItem = {
    id: 'inv_pending',
    kind: 'pending_reward',
    title: 'Freebet $10',
    subtitle: 'Pendiente de entrega',
    image_url: img.bonus,
    quantity: 1,
    status: 'pending',
  };
  const map: Record<string, WidgetInventoryItem[]> = {
    pl_newbie: [],
    pl_vip: [chest, wheel, pending, { ...pending, id: 'inv_p2', title: '50 Free Spins' }],
    pl_mission: [chest, { ...wheel, quantity: 1 }],
    pl_streak: [chest, { ...chest, id: 'inv_c2', title: 'Cofre Plata', subtitle: 'Pity activo' }],
    pl_pending: [
      pending,
      { ...pending, id: 'inv_p2', title: 'Bono $50' },
      { ...pending, id: 'inv_p3', title: 'Cashback 10%' },
      chest,
      { ...wheel, quantity: 1 },
    ],
  };
  return map[playerId] ?? [];
}

function shopFor(): WidgetShopProduct[] {
  return [
    {
      id: 'shop_1',
      name: '50 monedas bonus',
      image_url: img.shop,
      cost_coins: 200,
      currency_code: 'main',
      stock: null,
      reward_label: '50 monedas',
    },
    {
      id: 'shop_2',
      name: 'Cofre Plata',
      image_url: img.chest,
      cost_coins: 500,
      currency_code: 'main',
      stock: 12,
      reward_label: 'Cofre Plata',
    },
    {
      id: 'shop_3',
      name: '15 Free Spins',
      image_url: img.bonus,
      cost_coins: 350,
      currency_code: 'main',
      stock: 8,
      reward_label: '15 Free Spins',
    },
    {
      id: 'shop_4',
      name: 'Tema Neon',
      image_url: img.avatarNeon,
      cost_coins: 1200,
      currency_code: 'vip',
      stock: 3,
      reward_label: 'Tema exclusivo',
    },
  ];
}

function rankingsFor(playerId: string): WidgetRankingData {
  const handles = ['vip_roller', 'crypto_king_88', 'slot_hunter', 'MariaG_bet', 'neon_player'];
  const positions: Record<string, number> = {
    pl_newbie: 48,
    pl_vip: 2,
    pl_mission: 5,
    pl_streak: 12,
    pl_pending: 22,
  };
  const pos = positions[playerId] ?? 10;
  return {
    ranking_name: 'Top Apostadores Semanal',
    period_label: 'Semana actual',
    player_position: pos,
    player_score: 1200 + (50 - pos) * 80,
    top_entries: handles.slice(0, 3).map((h, i) => ({
      position: i + 1,
      player_handle: h,
      player_avatar_url: img.avatar,
      score: 5200 - i * 400,
      is_current_player: h === previewPlayers.find((p) => p.id === playerId)?.handle,
    })),
  };
}

function newsFor(): WidgetNewsItem[] {
  return [
    {
      id: 'news_1',
      title: 'Festival de Mayo · Doble XP',
      banner_image_url: img.news,
      category: 'promo',
      published_at: '2026-05-14T10:00:00Z',
    },
    {
      id: 'news_2',
      title: 'Nuevo torneo de slots',
      banner_image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=800',
      category: 'torneo',
      published_at: '2026-05-12T14:00:00Z',
    },
  ];
}

export function buildPlayerWidgetData(playerId: string): PlayerWidgetData | null {
  const player = previewPlayers.find((p) => p.id === playerId);
  if (!player) return null;
  return {
    player,
    missions: missionsFor(playerId),
    inventory: inventoryFor(playerId),
    shop_products: shopFor(),
    rankings: rankingsFor(playerId),
    news: newsFor(),
  };
}

export function getPreviewPlayers(): PreviewPlayerSummary[] {
  return [...previewPlayers];
}
