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

/** Catálogo alineado con migración pricing 2026-05-26 (GET /admin/modules/catalog). */
export const moduleCatalog: ModulePublic[] = [
  {
    code: 'xp_engine',
    name: 'Motor de XP',
    description: 'Reglas de XP, niveles y curva de progresión',
    price_usd_monthly: 1000,
    category: 'core',
  },
  {
    code: 'coins',
    name: 'Monedas',
    description: 'Monedas virtuales y economía interna',
    price_usd_monthly: 0,
    category: 'core',
  },
  {
    code: 'streaks',
    name: 'Rachas',
    description: 'Programas de racha y recompensas diarias',
    price_usd_monthly: 250,
    category: 'engagement',
  },
  {
    code: 'missions',
    name: 'Misiones',
    description: 'Misiones diarias, semanales y especiales',
    price_usd_monthly: 500,
    category: 'engagement',
  },
  {
    code: 'shop',
    name: 'Tienda virtual',
    description: 'Catálogo de ítems canjeables por monedas',
    price_usd_monthly: 350,
    category: 'operations',
  },
  {
    code: 'rewards_delivery',
    name: 'Entrega de premios',
    description: 'Bandeja de premios y webhooks de fulfillment',
    price_usd_monthly: 0,
    category: 'operations',
  },
  {
    code: 'chests',
    name: 'Cofres',
    description: 'Cofres con recompensas aleatorias',
    price_usd_monthly: 250,
    category: 'engagement',
  },
  {
    code: 'wheels',
    name: 'Ruedas de la fortuna',
    description: 'Ruletas configurables con premios y ocasiones',
    price_usd_monthly: 250,
    category: 'engagement',
  },
  {
    code: 'tournaments',
    name: 'Torneos',
    description: 'Competencias con ranking y premios',
    price_usd_monthly: 500,
    category: 'engagement',
  },
  {
    code: 'predictions',
    name: 'Predicciones',
    description: 'Eventos deportivos con apuestas sociales',
    price_usd_monthly: 300,
    category: 'engagement',
  },
  {
    code: 'raffles',
    name: 'Sorteos',
    description: 'Sorteos provably-fair con moneda dedicada',
    price_usd_monthly: 250,
    category: 'engagement',
  },
  {
    code: 'rankings',
    name: 'Rankings',
    description: 'Leaderboards por categoría y período',
    price_usd_monthly: 350,
    category: 'engagement',
  },
  {
    code: 'avatars',
    name: 'Avatares',
    description: 'Personalización visual del jugador',
    price_usd_monthly: 150,
    category: 'customization',
  },
  {
    code: 'branding',
    name: 'Branding',
    description: 'Paleta, logos y estilo del widget',
    price_usd_monthly: 0,
    category: 'customization',
  },
  {
    code: 'multi_currency',
    name: 'Multi-moneda',
    description: 'Múltiples monedas virtuales por operador',
    price_usd_monthly: 150,
    category: 'core',
  },
  {
    code: 'notifications',
    name: 'Notificaciones',
    description: 'Templates y envío de notificaciones in-app',
    price_usd_monthly: 150,
    category: 'operations',
  },
  {
    code: 'news',
    name: 'Noticias',
    description: 'Novedades y banners en el widget del jugador',
    price_usd_monthly: 200,
    category: 'operations',
  },
  {
    code: 'social',
    name: 'Bet Sharing',
    description: 'Feed social, perfiles y moderación de posts',
    price_usd_monthly: 1000,
    category: 'engagement',
  },
];

export function operatorPriceForModule(_code: ModuleCode, catalogPrice: number): number {
  return catalogPrice;
}

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

function catalogPrice(code: ModuleCode): number {
  return moduleCatalog.find((m) => m.code === code)?.price_usd_monthly ?? 0;
}

function mockActiveModule(
  code: ModuleCode,
  daysAgo: number,
  operatorPrice: number,
  opts?: { pending?: boolean; renewalInDays?: number },
): OperatorActiveModulePublic {
  const renewalInDays = opts?.renewalInDays ?? 30;
  return {
    code,
    activated_at: iso(daysAgo),
    next_renewal_at: new Date(Date.now() + renewalInDays * 86400000).toISOString(),
    last_cycle_amount_usd: operatorPrice,
    deactivation_pending_cycle_end: opts?.pending ?? false,
    deactivated_at: null,
    operator_price_usd_monthly: operatorPrice,
  };
}

export const activeModules: OperatorActiveModulePublic[] = [
  mockActiveModule('xp_engine', 120, 179),
  mockActiveModule('coins', 120, 0),
  mockActiveModule('streaks', 90, catalogPrice('streaks')),
  mockActiveModule('missions', 90, 161),
  mockActiveModule('shop', 60, catalogPrice('shop')),
  mockActiveModule('rewards_delivery', 60, 0),
  mockActiveModule('chests', 45, catalogPrice('chests')),
  mockActiveModule('wheels', 40, catalogPrice('wheels')),
  mockActiveModule('tournaments', 30, catalogPrice('tournaments')),
  mockActiveModule('predictions', 30, catalogPrice('predictions')),
  mockActiveModule('raffles', 30, catalogPrice('raffles')),
  mockActiveModule('rankings', 20, catalogPrice('rankings')),
  mockActiveModule('avatars', 18, catalogPrice('avatars')),
  mockActiveModule('branding', 15, 0),
  mockActiveModule('notifications', 10, catalogPrice('notifications'), {
    pending: true,
    renewalInDays: 7,
  }),
  mockActiveModule('news', 8, catalogPrice('news')),
  mockActiveModule('social', 5, 450),
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
