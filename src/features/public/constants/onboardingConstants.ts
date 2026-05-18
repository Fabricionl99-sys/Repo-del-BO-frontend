import type { MauBand, PricingTierId } from '@/types/onboarding';

export const IGAMING_PLATFORMS = [
  'Stake',
  'BetSoft',
  'Microgaming',
  'Pragmatic',
  'SoftSwiss',
  'EveryMatrix',
  'White Hat Gaming',
  'Custom',
  'Otra',
] as const;

export const PRODUCT_OPTIONS = [
  'Casino',
  'Sportsbook',
  'Live Casino',
  'Poker',
  'Bingo',
  'eSports',
  'Crash Games',
  'Slots',
  'Lotería',
  'Deportes Virtuales',
] as const;

export const BONUS_TYPE_OPTIONS = [
  'Freespin',
  'Freebet',
  'Cashback',
  'Bonus Depósito',
] as const;

export const MAU_OPTIONS: { value: MauBand; label: string }[] = [
  { value: '0-1k', label: '0 – 1K MAU' },
  { value: '1k-10k', label: '1K – 10K MAU' },
  { value: '10k-50k', label: '10K – 50K MAU' },
  { value: '50k+', label: '50K+ MAU' },
];

export const QUICKSTART_MODULES: {
  code: string;
  label: string;
  description: string;
  recommended?: boolean;
}[] = [
  { code: 'missions', label: 'Misiones', description: 'Recomendado para retención diaria', recommended: true },
  { code: 'chests', label: 'Cofres', description: 'Recompensas aleatorias configurables' },
  { code: 'rankings', label: 'Rankings', description: 'Leaderboards por período' },
  { code: 'shop', label: 'Tienda', description: 'Canje con monedas virtuales' },
];

export const WIZARD_STEPS = [
  'Datos legales',
  'Tu plataforma',
  'Capacidades',
  'Plan y pago',
  'Quickstart',
] as const;

export function tierForMau(mau: MauBand): PricingTierId {
  if (mau === '0-1k') return 'starter';
  if (mau === '1k-10k') return 'growth';
  if (mau === '10k-50k') return 'pro';
  return 'pro';
}
