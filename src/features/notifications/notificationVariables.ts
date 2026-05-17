import type { TriggerEvent } from '@/types/notifications';

export const COMMON_TEMPLATE_VARIABLES = [
  'player_name',
  'player_username',
  'operator_name',
  'cta_url',
] as const;

export const TRIGGER_VARIABLES: Record<TriggerEvent, readonly string[]> = {
  welcome: ['player_name', 'player_username', 'operator_name'],
  level_up: ['player_name', 'player_username', 'level', 'xp_total', 'operator_name'],
  mission_completed: ['player_name', 'player_username', 'mission_name', 'operator_name'],
  streak_completed: ['player_name', 'player_username', 'streak_count', 'operator_name'],
  streak_in_danger: ['player_name', 'player_username', 'streak_count', 'operator_name'],
  chest_received: ['player_name', 'player_username', 'chest_name', 'operator_name'],
  shop_purchase: ['player_name', 'player_username', 'prize_name', 'coins_balance', 'operator_name'],
  ranking_won: ['player_name', 'player_username', 'ranking_name', 'position', 'prize_name', 'operator_name'],
  wallet_low_balance: ['player_name', 'player_username', 'coins_balance', 'operator_name'],
  reward_pending: ['player_name', 'player_username', 'prize_name', 'operator_name'],
  manual: ['player_name', 'player_username', 'operator_name', 'cta_url'],
};

export const TRIGGER_EVENT_LABELS: Record<TriggerEvent, string> = {
  welcome: 'Bienvenida (registro)',
  level_up: 'Subir de nivel',
  mission_completed: 'Misión completada',
  streak_completed: 'Racha completada',
  streak_in_danger: 'Racha en riesgo (24h)',
  chest_received: 'Cofre recibido',
  shop_purchase: 'Compra en tienda',
  ranking_won: 'Premio en ranking',
  wallet_low_balance: 'Saldo bajo',
  reward_pending: 'Premio por expirar',
  manual: 'Envío manual',
};

export const CHANNEL_LABELS: Record<string, string> = {
  in_app: 'In-app',
  email: 'Email',
  push: 'Push',
  sms: 'SMS',
};

export const MOCK_PREVIEW_VARIABLES: Record<string, string> = {
  player_name: 'Juan Pérez',
  player_username: 'juan_perez',
  level: '15',
  xp_total: '4820',
  coins_balance: '1200',
  mission_name: 'Apostá $500 esta semana',
  streak_count: '7',
  chest_name: 'Cofre Dorado',
  prize_name: '25 spins gratis',
  ranking_name: 'Top XP Diario',
  position: '3',
  operator_name: 'Casino Astral',
  cta_url: 'https://widget.niveles.io/missions',
};

export function variablesForTrigger(trigger: TriggerEvent): string[] {
  const set = new Set<string>([...COMMON_TEMPLATE_VARIABLES, ...TRIGGER_VARIABLES[trigger]]);
  return [...set];
}

export function extractPlaceholders(text: string): string[] {
  const matches = text.matchAll(/\{\{\s*([a-z_]+)\s*\}\}/gi);
  return [...new Set([...matches].map((m) => m[1].toLowerCase()))];
}
