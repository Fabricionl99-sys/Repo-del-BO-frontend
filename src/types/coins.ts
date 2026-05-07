export type CoinDeliveryMode = 'auto_xp' | 'manual';

export interface CoinCaps {
  dailyPerPlayer?: number | null;
  weeklyPerPlayer?: number | null;
  monthlyPerPlayer?: number | null;
  totalPerPlayer?: number | null;
  expiryDays?: number | null;
}

export interface CoinP2PConfig {
  enabled: boolean;
  maxPerTransfer?: number | null;
  maxDailyPerPlayer?: number | null;
  maxMonthlyPerPlayer?: number | null;
  cooldownMinutes?: number | null;
  minAccountAgeDays?: number | null;
  vipPlusOnly?: boolean;
  commissionPercent?: number | null;
}

export interface Coin {
  id: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  emoji?: string;
  deliveryMode: CoinDeliveryMode;
  /** Cuántos XP otorgan 1 unidad de esta moneda (solo auto_xp) */
  xpPerUnit?: number | null;
  caps: CoinCaps;
  p2p: CoinP2PConfig;
  isDefault: boolean;
  active: boolean;
  totalInCirculation: number;
  emittedThisWeek: number;
  redeemedThisWeek: number;
}

export interface CoinsGlobalRules {
  maxBalancePerPlayer: number | null;
  maxDailyEmissionPerPlayer: number | null;
  allowP2P: boolean;
  p2pFeePercent?: number;
}

export interface CoinsConfig {
  xp_per_coin: number;
}
