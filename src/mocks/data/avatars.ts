import type {
  Avatar,
  AvatarCategory,
  AvatarUnlockConfig,
  AvatarUnlockMethod,
  AvatarUnlockedVia,
  PlayerAvatarInventoryItem,
} from '@/types/avatars';

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

const none = { min_level: null as number | null, vip_only: false, new_players_only: false };

export const avatarCategories: AvatarCategory[] = [
  {
    id: 'cat_animales',
    code: 'animales',
    name: 'Animales',
    description: 'Mascotas y fauna para todos los jugadores',
    icon: 'PawPrint',
    display_order: 0,
    is_active: true,
    restrictions: none,
  },
  {
    id: 'cat_deportes',
    code: 'deportes',
    name: 'Deportes',
    description: 'Íconos deportivos y equipos',
    icon: 'Trophy',
    display_order: 1,
    is_active: true,
    restrictions: none,
  },
  {
    id: 'cat_famosos',
    code: 'famosos',
    name: 'Famosos',
    description: 'Personajes icónicos y estilo pop',
    icon: 'Star',
    display_order: 2,
    is_active: true,
    restrictions: none,
  },
  {
    id: 'cat_vip',
    code: 'vip',
    name: 'VIP',
    description: 'Solo para jugadores VIP',
    icon: 'Crown',
    display_order: 3,
    is_active: true,
    restrictions: { min_level: 10, vip_only: true, new_players_only: false },
  },
  {
    id: 'cat_premium',
    code: 'premium',
    name: 'Premium',
    description: 'Alta calidad y ediciones limitadas',
    icon: 'Gem',
    display_order: 4,
    is_active: true,
    restrictions: { min_level: 5, vip_only: false, new_players_only: false },
  },
  {
    id: 'cat_estacionales',
    code: 'estacionales',
    name: 'Estacionales',
    description: 'Temporadas y eventos especiales',
    icon: 'Snowflake',
    display_order: 5,
    is_active: true,
    restrictions: none,
  },
];

const avatarSeeds: Array<{
  code: string;
  name: string;
  category_id: string;
  color: string;
  method: AvatarUnlockMethod;
  premium?: boolean;
  active?: boolean;
}> = [
  { code: 'leon_dorado', name: 'León Dorado', category_id: 'cat_animales', color: 'FFD700', method: 'shop' },
  { code: 'tigre_nocturno', name: 'Tigre Nocturno', category_id: 'cat_animales', color: 'FF6B35', method: 'level_up' },
  { code: 'lobo_plata', name: 'Lobo Plata', category_id: 'cat_animales', color: 'C0C0C0', method: 'chest' },
  { code: 'aguila_real', name: 'Águila Real', category_id: 'cat_animales', color: '1E90FF', method: 'mission' },
  { code: 'panda_lucky', name: 'Panda Lucky', category_id: 'cat_animales', color: 'FFFFFF', method: 'auto' },
  { code: 'delfin_azul', name: 'Delfín Azul', category_id: 'cat_animales', color: '00CED1', method: 'shop' },
  { code: 'zorro_fuego', name: 'Zorro Fuego', category_id: 'cat_animales', color: 'FF4500', method: 'manual', premium: true },
  { code: 'baller_futbol', name: 'Baller Fútbol', category_id: 'cat_deportes', color: '0AF784', method: 'shop' },
  { code: 'tenis_pro', name: 'Tenis Pro', category_id: 'cat_deportes', color: 'ADFF2F', method: 'level_up' },
  { code: 'boxeo_champ', name: 'Boxeo Champ', category_id: 'cat_deportes', color: 'DC143C', method: 'chest' },
  { code: 'formula_one', name: 'Formula One', category_id: 'cat_deportes', color: 'E10600', method: 'mission' },
  { code: 'basket_mvp', name: 'Basket MVP', category_id: 'cat_deportes', color: 'FF8C00', method: 'shop' },
  { code: 'surf_wave', name: 'Surf Wave', category_id: 'cat_deportes', color: '20B2AA', method: 'auto' },
  { code: 'pop_star', name: 'Pop Star', category_id: 'cat_famosos', color: 'FF1493', method: 'shop' },
  { code: 'rock_legend', name: 'Rock Legend', category_id: 'cat_famosos', color: '8B008B', method: 'level_up' },
  { code: 'cinema_icon', name: 'Cinema Icon', category_id: 'cat_famosos', color: 'FFD700', method: 'chest' },
  { code: 'streamer_pro', name: 'Streamer Pro', category_id: 'cat_famosos', color: '9146FF', method: 'mission' },
  { code: 'dj_neon', name: 'DJ Neon', category_id: 'cat_famosos', color: '00FFFF', method: 'manual' },
  { code: 'vip_emperor', name: 'Emperador VIP', category_id: 'cat_vip', color: '9B59B6', method: 'manual', premium: true },
  { code: 'vip_diamond', name: 'Diamante VIP', category_id: 'cat_vip', color: 'B9F2FF', method: 'shop', premium: true },
  { code: 'vip_royal', name: 'Corona Real', category_id: 'cat_vip', color: 'FFD700', method: 'level_up', premium: true },
  { code: 'vip_black', name: 'Black Card', category_id: 'cat_vip', color: '111111', method: 'chest', premium: true },
  { code: 'premium_gold', name: 'Oro Premium', category_id: 'cat_premium', color: 'FFD700', method: 'shop', premium: true },
  { code: 'premium_neon', name: 'Neon Premium', category_id: 'cat_premium', color: '0AF784', method: 'level_up', premium: true },
  { code: 'premium_crystal', name: 'Cristal Premium', category_id: 'cat_premium', color: 'E0FFFF', method: 'chest', premium: true },
  { code: 'premium_legend', name: 'Leyenda Premium', category_id: 'cat_premium', color: 'FF6347', method: 'mission', premium: true },
  { code: 'navidad_elf', name: 'Duende Navideño', category_id: 'cat_estacionales', color: '228B22', method: 'auto' },
  { code: 'verano_sol', name: 'Sol de Verano', category_id: 'cat_estacionales', color: 'FFA500', method: 'auto' },
  { code: 'halloween_pumpkin', name: 'Calabaza Halloween', category_id: 'cat_estacionales', color: 'FF7518', method: 'chest' },
  { code: 'pascua_bunny', name: 'Conejo Pascua', category_id: 'cat_estacionales', color: 'FFB6C1', method: 'shop' },
  { code: 'carnaval_mask', name: 'Máscara Carnaval', category_id: 'cat_estacionales', color: '9400D3', method: 'mission' },
  { code: 'mascota_rojinegra', name: 'Mascota Rojinegra', category_id: 'cat_deportes', color: 'CC0000', method: 'shop', active: false },
  { code: 'archived_wolf', name: 'Lobo Archivado', category_id: 'cat_animales', color: '666666', method: 'manual', active: false },
  { code: 'test_shop', name: 'Avatar Shop Test', category_id: 'cat_animales', color: '0AF784', method: 'shop' },
  { code: 'test_level', name: 'Avatar Level Test', category_id: 'cat_famosos', color: '0AF784', method: 'level_up' },
];

function unlockConfigFor(method: AvatarUnlockMethod): AvatarUnlockConfig {
  switch (method) {
    case 'shop':
      return { cost_in_coins: 500 + Math.floor(Math.random() * 1500), currency_code: 'main' };
    case 'level_up':
      return { required_level: 3 + Math.floor(Math.random() * 20) };
    case 'mission':
      return { mission_code: 'mission_daily_bets' };
    case 'chest':
      return { chest_type_codes: ['cofre_oro', 'cofre_plata'] };
    case 'manual':
      return {} as Record<string, never>;
    case 'auto':
      return { from_date: iso(-30) };
    default:
      return {} as Record<string, never>;
  }
}

function categoryMeta(categoryId: string) {
  const cat = avatarCategories.find((c) => c.id === categoryId)!;
  return { category_code: cat.code, category_name: cat.name };
}

export const avatars: Avatar[] = avatarSeeds.map((seed, index) => {
  const cat = avatarCategories.find((c) => c.id === seed.category_id)!;
  const meta = categoryMeta(seed.category_id);
  const archived = seed.active === false;
  const imageUrl = `https://dummyimage.com/256x256/${seed.color}/0E1116&text=${encodeURIComponent(seed.name.slice(0, 2))}`;
  return {
    id: `av_${seed.code}`,
    code: seed.code,
    name: seed.name,
    description: `Avatar ${seed.name} en categoría ${cat.name}`,
    image_urls: { original: imageUrl },
    image_url: imageUrl,
    category_id: seed.category_id,
    ...meta,
    is_active: seed.active !== false,
    is_premium: Boolean(seed.premium),
    unlock_method: seed.method,
    unlock_config: unlockConfigFor(seed.method),
    restrictions: cat.restrictions,
    status: archived ? 'archived' : 'active',
    created_at: iso(60 - index),
    updated_at: iso(5),
  };
});

const players = [
  { player_id: 'pl_8821', player_handle: 'crypto_king_88' },
  { player_id: 'pl_4412', player_handle: 'MariaG_bet' },
  { player_id: 'pl_1190', player_handle: 'slot_hunter' },
  { player_id: 'pl_3301', player_handle: 'vip_roller' },
  { player_id: 'pl_7720', player_handle: 'neon_player' },
  { player_id: 'pl_9922', player_handle: 'theme_fan' },
  { player_id: 'pl_5510', player_handle: 'retry_me' },
  { player_id: 'pl_6611', player_handle: 'manual_ops' },
  { player_id: 'pl_2244', player_handle: 'newbie_spin' },
  { player_id: 'pl_7788', player_handle: 'high_roller_x' },
];

const viaOptions: AvatarUnlockedVia[] = [
  'shop_purchase',
  'level_up',
  'mission_completed',
  'chest_opened',
  'manual_grant',
  'auto_available',
];

export const avatarInventory: PlayerAvatarInventoryItem[] = Array.from({ length: 72 }, (_, i) => {
  const avatar = avatars[i % avatars.length];
  const player = players[i % players.length];
  const cat = avatarCategories.find((c) => c.id === avatar.category_id)!;
  return {
    id: `pav_${i + 1}`,
    player_id: player.player_id,
    player_handle: player.player_handle,
    avatar_id: avatar.id,
    avatar_code: avatar.code,
    avatar_name: avatar.name,
    avatar_image_url: avatar.image_urls?.original ?? avatar.image_url ?? '',
    category_id: avatar.category_id,
    category_name: cat.name,
    unlocked_at: iso(i % 45),
    unlocked_via: viaOptions[i % viaOptions.length],
    is_active: i % 8 === 0,
  };
});

export function syncCategoryAvatarCounts() {
  for (const cat of avatarCategories) {
    cat.avatar_count = avatars.filter((a) => a.category_id === cat.id && a.status === 'active').length;
  }
}

syncCategoryAvatarCounts();

export function activeAvatarCount() {
  return avatars.filter((a) => a.status === 'active').length;
}
