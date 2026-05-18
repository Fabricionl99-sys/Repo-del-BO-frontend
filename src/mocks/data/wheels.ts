import type {
  SpinDeliveryStatus,
  SpinHistoryEntry,
  WheelCatalogStats,
  WheelManualGrantHistoryItem,
  WheelOccasion,
  WheelOccasionType,
  WheelType,
} from '@/types/wheels';

const iso = (daysAgo: number, hours = 0) =>
  new Date(Date.now() - daysAgo * 86400000 - hours * 3600000).toISOString();

const ALL_OCCASIONS: WheelOccasionType[] = [
  'welcome_register',
  'daily_spin',
  'level_milestone',
  'zero_balance',
  'withdrawal_consolation',
  'shop_purchase',
  'first_deposit',
  'birthday',
  'mission_streak_chest_reward',
  'manual_grant',
];

function occasion(
  type: WheelOccasionType,
  active: boolean,
  config: Record<string, unknown> = {},
): WheelOccasion {
  return { occasion_type: type, is_active: active, config };
}

export const seedWheels: WheelType[] = [
  {
    code: 'daily',
    name: 'Rueda Daily',
    description: 'Giro diario gratuito con premios balanceados para retención.',
    image_url: 'https://images.unsplash.com/photo-1611591437281-460bfac57584?w=400',
    color_theme: '#FFD700',
    is_active: true,
    pity_enabled: false,
    pity_threshold: null,
    pity_guaranteed_prize_id: null,
    show_probabilities_to_players: false,
    daily_cooldown_mode: 'hours_exact',
    daily_cooldown_hours: 24,
    spins_expire: true,
    spin_expiration_hours: 24,
    archive_mode_default: 'normal',
    prizes: [
      { id: 'p_daily_1', name: '25 monedas', image_url: 'https://images.unsplash.com/photo-1621761190629-7961477624c4?w=128', reward_type: 'coins', reward_config: { amount: 25, currency_code: 'main' }, probability_percent: 22, color_theme: '#FDE68A', is_rare: false, display_order: 0 },
      { id: 'p_daily_2', name: '50 monedas', image_url: 'https://images.unsplash.com/photo-1621761190629-7961477624c4?w=128', reward_type: 'coins', reward_config: { amount: 50, currency_code: 'main' }, probability_percent: 20, color_theme: '#FCD34D', is_rare: false, display_order: 1 },
      { id: 'p_daily_3', name: '100 XP', image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=128', reward_type: 'xp', reward_config: { amount: 100 }, probability_percent: 18, color_theme: '#FBBF24', is_rare: false, display_order: 2 },
      { id: 'p_daily_4', name: '3 Free Spins', image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=128', reward_type: 'freespin', reward_config: { bonus_id: 'ob_fs_starburst' }, probability_percent: 15, color_theme: '#F59E0B', is_rare: false, display_order: 3 },
      { id: 'p_daily_5', name: 'Cofre Bronce', image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=128', reward_type: 'chest', reward_config: { chest_type_code: 'bronce' }, probability_percent: 12, color_theme: '#D97706', is_rare: false, display_order: 4 },
      { id: 'p_daily_6', name: 'Freebet $2', image_url: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?w=128', reward_type: 'freebet', reward_config: { bonus_id: 'ob_fb_sports_25' }, probability_percent: 8, color_theme: '#B45309', is_rare: false, display_order: 5 },
      { id: 'p_daily_7', name: '200 monedas', image_url: 'https://images.unsplash.com/photo-1621761190629-7961477624c4?w=128', reward_type: 'coins', reward_config: { amount: 200, currency_code: 'main' }, probability_percent: 4, color_theme: '#92400E', is_rare: true, display_order: 6 },
      { id: 'p_daily_8', name: 'Jackpot diario', image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=128', reward_type: 'manual', reward_config: { description: 'Premio manual jackpot diario' }, probability_percent: 1, color_theme: '#78350F', is_rare: true, display_order: 7 },
    ],
    occasions: [
      occasion('welcome_register', true, { first_registration_only: true }),
      occasion('daily_spin', true, { mode: 'hours_exact', hours: 24 }),
      occasion('level_milestone', false, { every_n_levels: 5, min_level: 1 }),
      occasion('zero_balance', false, { max_per_day: 1, cooldown_hours: 24 }),
      occasion('withdrawal_consolation', false, { min_withdrawal_usd: 100 }),
      occasion('shop_purchase', false),
      occasion('first_deposit', false, { first_deposit_only: true }),
      occasion('birthday', false),
      occasion('mission_streak_chest_reward', false),
      occasion('manual_grant', true),
    ],
    status: 'active',
    created_at: iso(120),
    updated_at: iso(3),
  },
  {
    code: 'vip',
    name: 'Rueda VIP',
    description: 'Ruleta exclusiva con pity y probabilidades visibles.',
    image_url: 'https://images.unsplash.com/photo-1610375461245-0973aa8e7b74?w=400',
    color_theme: '#7C3AED',
    is_active: true,
    pity_enabled: true,
    pity_threshold: 8,
    pity_guaranteed_prize_id: 'p_vip_5',
    show_probabilities_to_players: true,
    daily_cooldown_mode: 'utc_reset',
    daily_cooldown_hours: 24,
    spins_expire: false,
    spin_expiration_hours: null,
    archive_mode_default: 'emergency',
    prizes: [
      { id: 'p_vip_1', name: '500 monedas', image_url: 'https://images.unsplash.com/photo-1621761190629-7961477624c4?w=128', reward_type: 'coins', reward_config: { amount: 500, currency_code: 'main' }, probability_percent: 30, color_theme: '#C4B5FD', is_rare: false, display_order: 0 },
      { id: 'p_vip_2', name: '20 Free Spins', image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=128', reward_type: 'freespin', reward_config: { bonus_id: 'ob_fs_book_dead' }, probability_percent: 25, color_theme: '#A78BFA', is_rare: false, display_order: 1 },
      { id: 'p_vip_3', name: 'Cashback 10%', image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=128', reward_type: 'cashback', reward_config: { bonus_id: 'ob_cb_weekly' }, probability_percent: 25, color_theme: '#8B5CF6', is_rare: false, display_order: 2 },
      { id: 'p_vip_4', name: 'Cofre Oro', image_url: 'https://images.unsplash.com/photo-1611591437281-460bfac57584?w=128', reward_type: 'chest', reward_config: { chest_type_code: 'oro' }, probability_percent: 15, color_theme: '#6D28D9', is_rare: false, display_order: 3 },
      { id: 'p_vip_5', name: 'Bonus VIP $100', image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=128', reward_type: 'bonus_deposit', reward_config: { bonus_id: 'ob_bd_vip_100' }, probability_percent: 5, color_theme: '#5B21B6', is_rare: true, display_order: 4 },
    ],
    occasions: [
      occasion('welcome_register', false, { first_registration_only: true }),
      occasion('daily_spin', true, { mode: 'utc_reset' }),
      occasion('level_milestone', true, { every_n_levels: 10, min_level: 20 }),
      occasion('zero_balance', false, { max_per_day: 1, cooldown_hours: 48 }),
      occasion('withdrawal_consolation', true, { min_withdrawal_usd: 500 }),
      occasion('shop_purchase', false),
      occasion('first_deposit', true, { first_deposit_only: false }),
      occasion('birthday', true),
      occasion('mission_streak_chest_reward', false),
      occasion('manual_grant', true),
    ],
    status: 'active',
    created_at: iso(90),
    updated_at: iso(5),
  },
  {
    code: 'welcome',
    name: 'Rueda Welcome',
    description: 'Bienvenida para nuevos jugadores sin expiración de spins.',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400',
    color_theme: '#DC2626',
    is_active: true,
    pity_enabled: false,
    pity_threshold: null,
    pity_guaranteed_prize_id: null,
    show_probabilities_to_players: true,
    daily_cooldown_mode: 'hours_exact',
    daily_cooldown_hours: 24,
    spins_expire: false,
    spin_expiration_hours: null,
    archive_mode_default: 'normal',
    prizes: [
      { id: 'p_welcome_1', name: '100 monedas', image_url: 'https://images.unsplash.com/photo-1621761190629-7961477624c4?w=128', reward_type: 'coins', reward_config: { amount: 100, currency_code: 'main' }, probability_percent: 25, color_theme: '#FCA5A5', is_rare: false, display_order: 0 },
      { id: 'p_welcome_2', name: '250 XP', image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=128', reward_type: 'xp', reward_config: { amount: 250 }, probability_percent: 20, color_theme: '#F87171', is_rare: false, display_order: 1 },
      { id: 'p_welcome_3', name: '10 Free Spins', image_url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=128', reward_type: 'freespin', reward_config: { bonus_id: 'ob_fs_starburst' }, probability_percent: 20, color_theme: '#EF4444', is_rare: false, display_order: 2 },
      { id: 'p_welcome_4', name: 'Cofre Plata', image_url: 'https://images.unsplash.com/photo-1610375461245-0973aa8e7b74?w=128', reward_type: 'chest', reward_config: { chest_type_code: 'plata' }, probability_percent: 20, color_theme: '#DC2626', is_rare: false, display_order: 3 },
      { id: 'p_welcome_5', name: 'Avatar pack', image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128', reward_type: 'avatar_pack', reward_config: { avatar_ids: ['av_01', 'av_02'] }, probability_percent: 10, color_theme: '#B91C1C', is_rare: false, display_order: 4 },
      { id: 'p_welcome_6', name: 'Bono bienvenida', image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=128', reward_type: 'bonus_deposit', reward_config: { bonus_id: 'ob_bd_welcome' }, probability_percent: 5, color_theme: '#991B1B', is_rare: true, display_order: 5 },
    ],
    occasions: [
      occasion('welcome_register', true, { first_registration_only: true }),
      occasion('daily_spin', false, { mode: 'hours_exact', hours: 24 }),
      occasion('level_milestone', false, { every_n_levels: 5, min_level: 1 }),
      occasion('zero_balance', false, { max_per_day: 1, cooldown_hours: 24 }),
      occasion('withdrawal_consolation', false, { min_withdrawal_usd: 50 }),
      occasion('shop_purchase', false),
      occasion('first_deposit', true, { first_deposit_only: true }),
      occasion('birthday', false),
      occasion('mission_streak_chest_reward', false),
      occasion('manual_grant', true),
    ],
    status: 'active',
    created_at: iso(60),
    updated_at: iso(2),
  },
];

export let wheelTypes: WheelType[] = seedWheels.map((w) => ({
  ...w,
  prizes: w.prizes.map((p) => ({ ...p })),
  occasions: w.occasions.map((o) => ({ ...o })),
}));

const players = [
  { player_id: 'pl_8821', player_handle: 'crypto_king_88' },
  { player_id: 'pl_4412', player_handle: 'MariaG_bet' },
  { player_id: 'pl_1190', player_handle: 'slot_hunter' },
  { player_id: 'pl_3301', player_handle: 'vip_roller' },
  { player_id: 'pl_7720', player_handle: 'neon_player' },
  { player_id: 'pl_5510', player_handle: 'retry_me' },
  { player_id: 'pl_2244', player_handle: 'newbie_spin' },
  { player_id: 'pl_7788', player_handle: 'high_roller_x' },
];

const occasionTypes: WheelOccasionType[] = [
  'daily_spin',
  'welcome_register',
  'manual_grant',
  'shop_purchase',
  'first_deposit',
  'level_milestone',
  'zero_balance',
  'birthday',
  'mission_streak_chest_reward',
  'withdrawal_consolation',
];

const deliveryStatuses: SpinDeliveryStatus[] = ['delivered', 'delivered', 'delivered', 'pending', 'in_flight', 'failed'];

function buildSpinHistory(): SpinHistoryEntry[] {
  const items: SpinHistoryEntry[] = [];
  for (let i = 0; i < 100; i++) {
    const wheel = wheelTypes[i % wheelTypes.length];
    const prize = wheel.prizes[i % wheel.prizes.length];
    const player = players[i % players.length];
    const status = deliveryStatuses[i % deliveryStatuses.length];
    const spunAt = iso(i % 30, i % 24);
    items.push({
      id: `spin_${1000 + i}`,
      spun_at: spunAt,
      wheel_code: wheel.code,
      wheel_name: wheel.name,
      player_id: player.player_id,
      player_handle: player.player_handle,
      occasion_type: occasionTypes[i % occasionTypes.length],
      prize_id: prize.id,
      prize_name: prize.name,
      prize_image_url: prize.image_url,
      reward_type: prize.reward_type,
      reward_config: { ...prize.reward_config },
      delivery_status: status,
      delivery_attempts: [
        {
          id: `att_${i}_1`,
          attempted_at: spunAt,
          status: status === 'failed' ? 'failed' : status === 'delivered' ? 'success' : 'in_flight',
          error_message: status === 'failed' ? 'Provider timeout (502)' : null,
        },
        ...(status === 'failed'
          ? [
              {
                id: `att_${i}_2`,
                attempted_at: iso(i % 30, (i % 24) - 1),
                status: 'failed' as const,
                error_message: 'Invalid bonus mapping',
              },
            ]
          : []),
      ],
      audit_log: [
        { at: spunAt, action: 'spin_completed', actor: 'system', detail: `occasion=${occasionTypes[i % occasionTypes.length]}` },
        { at: spunAt, action: 'delivery_started', actor: 'rewards_delivery' },
        ...(status === 'delivered'
          ? [{ at: iso(i % 30, (i % 24) - 0.5), action: 'delivery_succeeded', actor: 'rewards_delivery' }]
          : status === 'failed'
            ? [{ at: iso(i % 30, (i % 24) - 0.5), action: 'delivery_failed', actor: 'rewards_delivery', detail: 'retry available' }]
            : []),
      ],
    });
  }
  return items.sort((a, b) => (a.spun_at < b.spun_at ? 1 : -1));
}

export let spinHistory: SpinHistoryEntry[] = buildSpinHistory();

function buildManualGrants(): WheelManualGrantHistoryItem[] {
  const items: WheelManualGrantHistoryItem[] = [];
  for (let i = 0; i < 20; i++) {
    const wheel = wheelTypes[i % wheelTypes.length];
    const player = players[i % players.length];
    items.push({
      id: `grant_${2000 + i}`,
      player_id: player.player_id,
      player_handle: player.player_handle,
      wheel_code: wheel.code,
      wheel_name: wheel.name,
      quantity: (i % 3) + 1,
      reason: i % 2 === 0 ? 'Compensación por incidente de entrega' : 'Campaña CRM VIP fin de semana',
      granted_by: 'admin@operator.com',
      granted_at: iso(i % 14, i % 12),
    });
  }
  return items.sort((a, b) => (a.granted_at < b.granted_at ? 1 : -1));
}

export let manualGrants: WheelManualGrantHistoryItem[] = buildManualGrants();

export function computeWheelStats(): WheelCatalogStats {
  const active = wheelTypes.filter((w) => w.status === 'active');
  const spinCounts = new Map<string, number>();
  for (const s of spinHistory) {
    spinCounts.set(s.wheel_code, (spinCounts.get(s.wheel_code) ?? 0) + 1);
  }
  let topCode: string | null = null;
  let topCount = 0;
  for (const [code, count] of spinCounts) {
    if (count > topCount) {
      topCount = count;
      topCode = code;
    }
  }
  const topWheel = topCode ? wheelTypes.find((w) => w.code === topCode) : null;
  return {
    total_active: active.length,
    total_spins_granted: spinHistory.length + manualGrants.reduce((s, g) => s + g.quantity, 0),
    top_wheel_code: topCode,
    top_wheel_name: topWheel?.name ?? null,
  };
}

export function clearSpinHistoryForWheel(wheelCode: string) {
  spinHistory = spinHistory.filter((s) => s.wheel_code !== wheelCode);
}

export function resetWheelsStore() {
  wheelTypes = seedWheels.map((w) => ({
    ...w,
    prizes: w.prizes.map((p) => ({ ...p })),
    occasions: w.occasions.map((o) => ({ ...o })),
  }));
  spinHistory = buildSpinHistory();
  manualGrants = buildManualGrants();
}

export { ALL_OCCASIONS };
