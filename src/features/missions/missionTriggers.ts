export type MissionTriggerCode =
  | 'bet_placed'
  | 'deposit_first'
  | 'deposit_recurring'
  | 'deposit_crypto'
  | 'withdraw_made'
  | 'kyc_completed'
  | 'email_verified'
  | 'phone_verified'
  | 'login_consecutive'
  | 'session_duration'
  | 'bet_amount_total'
  | 'bet_count_total'
  | 'win_streak'
  | 'play_sports'
  | 'play_casino'
  | 'play_live_casino'
  | 'play_slots'
  | 'play_poker'
  | 'play_bingo'
  | 'referral_signup'
  | 'referral_deposit'
  | 'birthday'
  | 'profile_completed'
  | 'avatar_changed'
  | 'chat_message';

export type TriggerConfigField =
  | 'amount_threshold'
  | 'count_threshold'
  | 'time_window_hours'
  | 'consecutive_days'
  | 'session_minutes'
  | 'win_streak_count';

export interface MissionTriggerDef {
  code: MissionTriggerCode;
  label: string;
  group: string;
  configFields: TriggerConfigField[];
}

export const MISSION_TRIGGER_GROUPS: { label: string; triggers: MissionTriggerDef[] }[] = [
  {
    label: 'APUESTAS',
    triggers: [
      { code: 'bet_placed', label: 'Apuesta realizada', group: 'APUESTAS', configFields: [] },
      { code: 'bet_amount_total', label: 'Apostar X monto total', group: 'APUESTAS', configFields: ['amount_threshold', 'time_window_hours'] },
      { code: 'bet_count_total', label: 'Hacer X cantidad de apuestas', group: 'APUESTAS', configFields: ['count_threshold', 'time_window_hours'] },
      { code: 'win_streak', label: 'Ganar N apuestas seguidas', group: 'APUESTAS', configFields: ['win_streak_count'] },
    ],
  },
  {
    label: 'PAGOS',
    triggers: [
      { code: 'deposit_first', label: 'Primer depósito', group: 'PAGOS', configFields: [] },
      { code: 'deposit_recurring', label: 'Depósito recurrente', group: 'PAGOS', configFields: ['count_threshold', 'time_window_hours'] },
      { code: 'deposit_crypto', label: 'Depósito en cripto', group: 'PAGOS', configFields: [] },
      { code: 'withdraw_made', label: 'Retiro realizado', group: 'PAGOS', configFields: [] },
    ],
  },
  {
    label: 'VERIFICACIÓN',
    triggers: [
      { code: 'kyc_completed', label: 'KYC completado', group: 'VERIFICACIÓN', configFields: [] },
      { code: 'email_verified', label: 'Email verificado', group: 'VERIFICACIÓN', configFields: [] },
      { code: 'phone_verified', label: 'Teléfono verificado', group: 'VERIFICACIÓN', configFields: [] },
    ],
  },
  {
    label: 'JUEGO POR TIPO',
    triggers: [
      { code: 'play_sports', label: 'Jugar en deportes', group: 'JUEGO POR TIPO', configFields: [] },
      { code: 'play_casino', label: 'Jugar casino', group: 'JUEGO POR TIPO', configFields: [] },
      { code: 'play_live_casino', label: 'Jugar casino en vivo', group: 'JUEGO POR TIPO', configFields: [] },
      { code: 'play_slots', label: 'Jugar slots', group: 'JUEGO POR TIPO', configFields: [] },
      { code: 'play_poker', label: 'Jugar poker', group: 'JUEGO POR TIPO', configFields: [] },
      { code: 'play_bingo', label: 'Jugar bingo', group: 'JUEGO POR TIPO', configFields: [] },
    ],
  },
  {
    label: 'COMPROMISO',
    triggers: [
      { code: 'login_consecutive', label: 'Login consecutivo (N días)', group: 'COMPROMISO', configFields: ['consecutive_days'] },
      { code: 'session_duration', label: 'Sesión de X minutos', group: 'COMPROMISO', configFields: ['session_minutes'] },
    ],
  },
  {
    label: 'SOCIAL',
    triggers: [
      { code: 'referral_signup', label: 'Referir amigo que se registra', group: 'SOCIAL', configFields: [] },
      { code: 'referral_deposit', label: 'Referido hace depósito', group: 'SOCIAL', configFields: [] },
      { code: 'chat_message', label: 'Mensaje en chat de la comunidad', group: 'SOCIAL', configFields: [] },
    ],
  },
  {
    label: 'PERFIL',
    triggers: [
      { code: 'birthday', label: 'Cumpleaños del jugador', group: 'PERFIL', configFields: [] },
      { code: 'profile_completed', label: 'Completar perfil', group: 'PERFIL', configFields: [] },
      { code: 'avatar_changed', label: 'Cambiar avatar', group: 'PERFIL', configFields: [] },
    ],
  },
];

export const ALL_MISSION_TRIGGERS: MissionTriggerDef[] = MISSION_TRIGGER_GROUPS.flatMap((g) => g.triggers);

export function getTriggerDef(code: string | undefined): MissionTriggerDef | undefined {
  return ALL_MISSION_TRIGGERS.find((t) => t.code === code);
}

export function getTriggerLabel(code: string | undefined): string {
  return getTriggerDef(code)?.label ?? code ?? '—';
}

export const TRIGGER_CONFIG_LABELS: Record<TriggerConfigField, string> = {
  amount_threshold: 'Monto mínimo (USD)',
  count_threshold: 'Cantidad',
  time_window_hours: 'Ventana temporal (horas)',
  consecutive_days: 'Días consecutivos',
  session_minutes: 'Minutos de sesión',
  win_streak_count: 'Apuestas ganadas seguidas',
};
