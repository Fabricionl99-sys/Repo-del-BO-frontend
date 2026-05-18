import type { CapabilityDimension } from '@/types/capabilities';

export const PRODUCT_LABELS: Record<string, string> = {
  casino: 'Casino',
  live_casino: 'Casino en Vivo',
  sportsbook: 'Sportsbook',
  poker: 'Poker',
  bingo: 'Bingo',
  esports: 'eSports',
  crash_games: 'Crash Games',
  slots: 'Slots',
  lottery: 'Lotería',
  virtual_sports: 'Deportes Virtuales',
};

export const BONUS_TYPE_LABELS: Record<string, string> = {
  freespin: 'Free Spins',
  freebet: 'Free Bets',
  cashback: 'Cashback',
  bonus_deposit: 'Bonus de Depósito',
};

export const DIMENSION_TAB_LABELS: Record<CapabilityDimension, string> = {
  products: 'Productos',
  bonus_types: 'Tipos de bono',
  events: 'Eventos',
};

export const ALL_PRODUCT_CODES = Object.keys(PRODUCT_LABELS);
export const ALL_BONUS_TYPE_CODES = Object.keys(BONUS_TYPE_LABELS);
