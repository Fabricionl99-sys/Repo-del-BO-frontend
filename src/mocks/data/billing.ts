import type {
  ModuleCode,
  ModulePublic,
  OperatorActiveModulePublic,
  OperatorBillingSnapshot,
  WalletTransaction,
} from '@/types/billing';

export const billingSnapshot: OperatorBillingSnapshot = {
  billing_mode: 'wallet',
  wallet_balance_usd: 2840.5,
  wallet_low_balance_threshold_usd: 500,
  status: 'active',
};

export const moduleCatalog: ModulePublic[] = [
  {
    code: 'xp_engine',
    name: 'Motor de XP',
    description: 'Reglas de XP, niveles y curva de progresión',
    price_usd_monthly: 199,
    category: 'core',
  },
  {
    code: 'coins',
    name: 'Monedas',
    description: 'Monedas virtuales y economía interna',
    price_usd_monthly: 149,
    category: 'core',
  },
  {
    code: 'streaks',
    name: 'Rachas',
    description: 'Programas de racha y recompensas diarias',
    price_usd_monthly: 129,
    category: 'engagement',
  },
  {
    code: 'missions',
    name: 'Misiones',
    description: 'Misiones diarias, semanales y especiales',
    price_usd_monthly: 179,
    category: 'engagement',
  },
  {
    code: 'shop',
    name: 'Tienda virtual',
    description: 'Catálogo de ítems canjeables por monedas',
    price_usd_monthly: 159,
    category: 'operations',
  },
  {
    code: 'rewards_delivery',
    name: 'Entrega de premios',
    description: 'Bandeja de premios y webhooks de fulfillment',
    price_usd_monthly: 99,
    category: 'operations',
  },
  {
    code: 'chests',
    name: 'Cofres',
    description: 'Cofres con recompensas aleatorias',
    price_usd_monthly: 119,
    category: 'engagement',
  },
  {
    code: 'tournaments',
    name: 'Torneos',
    description: 'Competencias con ranking y premios',
    price_usd_monthly: 189,
    category: 'engagement',
  },
  {
    code: 'predictions',
    name: 'Predicciones',
    description: 'Eventos deportivos con apuestas sociales',
    price_usd_monthly: 169,
    category: 'engagement',
  },
  {
    code: 'rankings',
    name: 'Rankings',
    description: 'Leaderboards por categoría y período',
    price_usd_monthly: 139,
    category: 'engagement',
  },
  {
    code: 'avatars',
    name: 'Avatares',
    description: 'Personalización visual del jugador',
    price_usd_monthly: 89,
    category: 'customization',
  },
  {
    code: 'branding',
    name: 'Branding',
    description: 'Paleta, logos y estilo del widget',
    price_usd_monthly: 79,
    category: 'customization',
  },
  {
    code: 'multi_currency',
    name: 'Multi-moneda',
    description: 'Múltiples monedas virtuales por operador',
    price_usd_monthly: 109,
    category: 'core',
  },
  {
    code: 'notifications',
    name: 'Notificaciones',
    description: 'Templates y envío de notificaciones in-app',
    price_usd_monthly: 99,
    category: 'operations',
  },
  {
    code: 'news',
    name: 'Noticias',
    description: 'Novedades y banners en el widget del jugador',
    price_usd_monthly: 79,
    category: 'operations',
  },
];

/** Operator-specific pricing overrides (catalog price * 0.9 or custom). */
export const operatorModulePricing: Partial<Record<ModuleCode, number>> = {
  xp_engine: 179,
  coins: 134,
  streaks: 116,
  missions: 161,
  shop: 143,
  rewards_delivery: 89,
  chests: 107,
  tournaments: 170,
  predictions: 152,
  rankings: 125,
  avatars: 80,
  branding: 71,
  multi_currency: 98,
  notifications: 89,
  news: 71,
};

export function operatorPriceForModule(code: ModuleCode, catalogPrice: number): number {
  return operatorModulePricing[code] ?? Math.round(catalogPrice * 0.9 * 100) / 100;
}

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

export const activeModules: OperatorActiveModulePublic[] = [
  { code: 'xp_engine', activated_at: iso(120), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 179 },
  { code: 'coins', activated_at: iso(120), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 134 },
  { code: 'streaks', activated_at: iso(90), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 116 },
  { code: 'missions', activated_at: iso(90), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 161 },
  { code: 'shop', activated_at: iso(60), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 143 },
  { code: 'rewards_delivery', activated_at: iso(60), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 89 },
  { code: 'chests', activated_at: iso(45), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 107 },
  { code: 'tournaments', activated_at: iso(30), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 170 },
  { code: 'predictions', activated_at: iso(30), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 152 },
  { code: 'rankings', activated_at: iso(20), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 125 },
  { code: 'avatars', activated_at: iso(18), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 80 },
  { code: 'branding', activated_at: iso(15), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 71 },
  { code: 'notifications', activated_at: iso(10), pending_deactivation: true, pending_deactivation_at: iso(-7), operator_price_usd_monthly: 89 },
  { code: 'news', activated_at: iso(8), pending_deactivation: false, pending_deactivation_at: null, operator_price_usd_monthly: 71 },
];

export const walletTransactions: WalletTransaction[] = [
  {
    id: 'tx_001',
    transaction_type: 'topup',
    amount_usd: 5000,
    reason: 'Recarga inicial',
    notes: 'Transferencia bancaria',
    balance_after_usd: 5000,
    created_at: iso(100),
  },
  {
    id: 'tx_002',
    transaction_type: 'charge',
    amount_usd: -199,
    reason: 'Mensualidad Motor de XP',
    notes: null,
    balance_after_usd: 4801,
    created_at: iso(95),
  },
  {
    id: 'tx_003',
    transaction_type: 'charge',
    amount_usd: -149,
    reason: 'Mensualidad Monedas',
    notes: null,
    balance_after_usd: 4652,
    created_at: iso(95),
  },
  {
    id: 'tx_004',
    transaction_type: 'topup',
    amount_usd: 1000,
    reason: 'Recarga crypto',
    notes: 'USDT TRC20',
    balance_after_usd: 5652,
    created_at: iso(60),
  },
  {
    id: 'tx_005',
    transaction_type: 'charge',
    amount_usd: -89,
    reason: 'Procesamiento eventos',
    notes: 'Marzo 2026',
    balance_after_usd: 2840.5,
    created_at: iso(5),
  },
  {
    id: 'tx_006',
    transaction_type: 'adjustment',
    amount_usd: 50,
    reason: 'Crédito promocional',
    notes: 'Onboarding B2B',
    balance_after_usd: 2890.5,
    created_at: iso(2),
  },
];
