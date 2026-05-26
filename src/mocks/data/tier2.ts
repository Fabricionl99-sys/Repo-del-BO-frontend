import type { Coin, CoinsGlobalRules } from '@/types/coins';
import type { CurvePreset, LevelEntry, LevelsCurve, PlayerDistribution } from '@/types/levels';
import type { RuleListItem, XPRule } from '@/types/rules';

const now = new Date();
const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString();

const coinBase = (partial: Partial<Coin> & Pick<Coin, 'id' | 'name' | 'symbol'>): Coin => ({
  emoji: '🪙',
  imageUrl: undefined,
  deliveryMode: 'auto_xp',
  xpPerUnit: 3,
  caps: {},
  p2p: { enabled: false },
  isDefault: false,
  active: true,
  totalInCirculation: 0,
  emittedThisWeek: 0,
  redeemedThisWeek: 0,
  ...partial,
});

export const coins: Coin[] = [
  coinBase({
    id: 'coin_oro',
    name: 'Monedas oro',
    symbol: 'GLD',
    isDefault: true,
    imageUrl: 'https://cdn-icons-png.flaticon.com/64/272/272525.png',
    totalInCirculation: 12_400_000,
    emittedThisWeek: 3_200_000,
    redeemedThisWeek: 1_800_000,
    xpPerUnit: 3,
    caps: { dailyPerPlayer: 50000, weeklyPerPlayer: null, monthlyPerPlayer: null, totalPerPlayer: null, expiryDays: null },
    p2p: { enabled: false },
  }),
  coinBase({
    id: 'coin_ruby',
    name: 'Rubíes',
    symbol: 'RBY',
    isDefault: false,
    deliveryMode: 'manual',
    emoji: '♦️',
    imageUrl: 'https://cdn-icons-png.flaticon.com/64/9431/9431065.png',
    xpPerUnit: null,
    totalInCirculation: 847_000,
    emittedThisWeek: 142_000,
    redeemedThisWeek: 89_000,
    caps: { expiryDays: 365 },
    p2p: {
      enabled: true,
      maxPerTransfer: 500,
      maxDailyPerPlayer: 2000,
      maxMonthlyPerPlayer: 20000,
      cooldownMinutes: 30,
      minAccountAgeDays: 7,
      vipPlusOnly: true,
      commissionPercent: 2,
    },
  }),
  coinBase({
    id: 'coin_tickets',
    name: 'Tickets de torneo',
    symbol: 'TKT',
    isDefault: false,
    deliveryMode: 'manual',
    emoji: '🎟️',
    totalInCirculation: 3487,
    emittedThisWeek: 1420,
    redeemedThisWeek: 892,
    caps: { dailyPerPlayer: 10 },
    p2p: { enabled: false },
  }),
];

export const coinsGlobalRules: CoinsGlobalRules = {
  maxBalancePerPlayer: 100000,
  maxDailyEmissionPerPlayer: 10000,
  allowP2P: false,
};

export const DEFAULT_LEVEL_THRESHOLDS = [
  100, 250, 500, 1000, 2500, 5000, 10000, 17500, 27500, 40000, 55000, 72500, 92500, 115000, 140000,
];

export function buildDefaultLevelsCurve(): LevelsCurve {
  const levels: LevelEntry[] = DEFAULT_LEVEL_THRESHOLDS.map((xp, i) => ({
    level: i + 1,
    xpRequired: xp,
    milestoneEnabled: false,
    milestoneUnlock: null,
  }));
  return { version: 1, totalLevels: levels.length, levels, updatedAt: iso(0), publishedAt: iso(14) };
}

export const levelsCurve: LevelsCurve = buildDefaultLevelsCurve();

/** Shape GET/PUT /admin/curve (prod). */
export const adminCurveLevels = DEFAULT_LEVEL_THRESHOLDS.map((xp, i) => ({
  level: i + 1,
  xp_required: xp,
}));

export const adminLevelConfig = { max_level: adminCurveLevels.length };

export const curvePresets: CurvePreset[] = [];
export const distribution: PlayerDistribution[] = [];

function ruleUsd(rule: XPRule): number {
  return rule.usd_per_xp ?? rule.action.xpPerAmount?.amount ?? rule.action.xpBase ?? 10;
}

export const xpRules: XPRule[] = [
  {
    id: 'rule_sports_win',
    name: 'Apuesta deportiva ganadora',
    description: 'boost x2 hasta domingo 23:59',
    status: 'active',
    category: 'deportes',
    usd_per_xp: 10,
    trigger: { event: 'bet_placed', category: 'deportes' },
    conditionsLogic: 'all',
    conditions: [],
    action: { xpBase: 1, xpPerAmount: { xp: 1, amount: 10, currency: 'USD' }, xpMaxPerEvent: 2000 },
    boost: {
      enabled: true,
      multiplier: 2,
      starts_at: iso(1),
      ends_at: iso(-5),
      scope: 'category',
      category_code: 'deportes',
    },
    createdAt: iso(120),
    updatedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    createdBy: { name: 'María López', initials: 'ML' },
  },
  {
    id: 'rule_slots_bet',
    name: 'Apuesta en casino',
    description: 'cuando bet_placed con categoría casino',
    status: 'active',
    category: 'casino',
    usd_per_xp: 1,
    trigger: { event: 'bet_placed', category: 'casino' },
    conditionsLogic: 'all',
    conditions: [],
    action: { xpBase: 1, xpPerAmount: { xp: 1, amount: 1, currency: 'USD' }, xpMaxPerEvent: 1500 },
    boost: { enabled: true, multiplier: 1.5, starts_at: iso(0.5), ends_at: iso(-2), scope: 'all' },
    createdAt: iso(112),
    updatedAt: iso(0.12),
    createdBy: { name: 'Carlos Rodríguez', initials: 'CR' },
  },
  {
    id: 'rule_first_deposit_month',
    name: 'Primer depósito del mes',
    description: 'legacy audit · no acredita XP automático en MVP',
    status: 'draft',
    category: 'casino',
    usd_per_xp: 50,
    trigger: { event: 'bet_placed', category: 'casino' },
    conditionsLogic: 'all',
    conditions: [],
    action: { xpBase: 1, xpPerAmount: { xp: 1, amount: 50, currency: 'USD' } },
    createdAt: iso(80),
    updatedAt: iso(1),
    createdBy: { name: 'Fabricio Lasagna', initials: 'FL' },
  },
  {
    id: 'rule_poker_win',
    name: 'Mano de poker ganada',
    description: 'cuando bet_placed en poker',
    status: 'active',
    category: 'poker',
    usd_per_xp: 5,
    trigger: { event: 'bet_placed', category: 'poker' },
    conditionsLogic: 'all',
    conditions: [],
    action: { xpBase: 1, xpPerAmount: { xp: 1, amount: 5, currency: 'USD' } },
    createdAt: iso(60),
    updatedAt: iso(2),
    createdBy: { name: 'María López', initials: 'ML' },
  },
  {
    id: 'rule_champions_weekend',
    name: 'Promo finde Champions League',
    description: 'event_type champions y fin de semana',
    status: 'paused',
    category: 'deportes',
    usd_per_xp: 10,
    trigger: { event: 'bet_placed', category: 'deportes' },
    conditionsLogic: 'all',
    conditions: [],
    action: { xpBase: 1, xpPerAmount: { xp: 1, amount: 10, currency: 'USD' } },
    createdAt: iso(20),
    updatedAt: iso(5),
    createdBy: { name: 'Carlos Rodríguez', initials: 'CR' },
  },
  {
    id: 'rule_live_table',
    name: 'Mesa en vivo bonificada',
    description: 'cuando bet_placed en casino en vivo',
    status: 'active',
    category: 'casino_vivo',
    usd_per_xp: 8,
    trigger: { event: 'bet_placed', category: 'casino_vivo' },
    conditionsLogic: 'all',
    conditions: [],
    action: { xpBase: 1, xpPerAmount: { xp: 1, amount: 8, currency: 'USD' } },
    boost: {
      enabled: true,
      multiplier: 3,
      starts_at: iso(0.2),
      ends_at: iso(-1),
      scope: 'category',
      category_code: 'casino_vivo',
    },
    createdAt: iso(10),
    updatedAt: iso(1),
    createdBy: { name: 'María López', initials: 'ML' },
  },
  {
    id: 'rule_virtual_match',
    name: 'Partido virtual jugado',
    description: 'cuando bet_placed en virtuales',
    status: 'active',
    category: 'virtuales',
    usd_per_xp: 4,
    trigger: { event: 'bet_placed', category: 'virtuales' },
    conditionsLogic: 'all',
    conditions: [],
    action: { xpBase: 1, xpPerAmount: { xp: 1, amount: 4, currency: 'USD' } },
    createdAt: iso(9),
    updatedAt: iso(1),
    createdBy: { name: 'Carlos Rodríguez', initials: 'CR' },
  },
];

export const ruleListItems = (): RuleListItem[] =>
  xpRules.map((rule) => ({
    id: rule.id,
    name: rule.name,
    description: rule.description,
    category: rule.category,
    xpDisplay: {
      value: `$${ruleUsd(rule)}`,
      perUnit: 'por 1 XP',
    },
    status: rule.status,
    updatedAt: rule.updatedAt,
    active: rule.status === 'active',
    boost: rule.boost,
  }));
