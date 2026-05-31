import type { FieldPath, UseFormReturn } from 'react-hook-form';

import { formatOperatorAmount } from '@/lib/formatOperatorAmount';
import type {
  StreakActivityConfig,
  StreakActivityType,
  StreakDailyMicroReward,
  StreakGraceAfterAction,
  StreakMilestone,
  StreakProgram,
  StreakResetPolicy,
  StreakRewardConfig,
  StreakRewardType,
} from '@/types/streakPrograms';

export const ACTIVITY_OPTIONS: { value: StreakActivityType; label: string }[] = [
  { value: 'login', label: 'Login diario' },
  { value: 'deposit_individual', label: 'Depósito individual' },
  { value: 'deposit_cumulative', label: 'Depósitos acumulados' },
  { value: 'bet_individual', label: 'Apuesta individual' },
  { value: 'bet_cumulative', label: 'Apuestas acumuladas' },
];

/** Tipos de premio estructurado (micro + milestones; `manual` solo en hitos). */
export type StreakRewardKind = 'none' | StreakRewardType;

export type GraceAfterAction = StreakGraceAfterAction;

export const FIAT_CURRENCIES = ['USD', 'EUR', 'ARS', 'MXN', 'CLP', 'BRL'] as const;

const LEGACY_COIN_CODE: Record<string, string> = { coin_oro: 'main', coin_ruby: 'vip' };

export function coinCodeFromLegacy(value: string): string {
  return LEGACY_COIN_CODE[value] ?? value;
}

export function coinCodeForSelect(coinId: string): string {
  return coinCodeFromLegacy(coinId);
}

export interface StreakMilestoneFormRow {
  day_number: number;
  reward_kind: StreakRewardKind;
  xp_amount: number;
  coin_code: string;
  coin_amount: number;
  chest_id: string;
  bonus_id: string;
  freespin_quantity: number;
  freespin_game_id: string;
  freebet_amount: number;
  freebet_currency: string;
  cashback_percentage: number;
  cashback_max_amount: number;
  bonus_percentage: number;
  bonus_max_amount: number;
  manual_description: string;
}

export interface StreakEditorFormValues {
  name: string;
  activity_type: StreakActivityType;
  minimum_logins_per_day: number;
  minimum_amount_per_deposit: number;
  minimum_amount_total_per_day: number;
  minimum_amount_per_bet: number;
  minimum_amount_total_bet_per_day: number;
  /** Vacío = cualquier moneda (null en API). */
  activity_threshold_currency: string;
  timezone: string;
  reset_policy: StreakResetPolicy;
  grace_days_rolling: number;
  grace_after_action: GraceAfterAction;
  grace_days_lost: number;
  soft_days_lost_on_break: number;
  daily_reward_kind: Exclude<StreakRewardKind, 'manual'>;
  daily_xp_amount: number;
  daily_coin_code: string;
  daily_coin_amount: number;
  daily_chest_id: string;
  daily_bonus_id: string;
  daily_freespin_quantity: number;
  daily_freespin_game_id: string;
  daily_freebet_amount: number;
  daily_freebet_currency: string;
  daily_cashback_percentage: number;
  daily_cashback_max_amount: number;
  daily_bonus_percentage: number;
  daily_bonus_max_amount: number;
  milestones: StreakMilestoneFormRow[];
}

export const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (UTC-3)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México (UTC-6)' },
  { value: 'America/Santiago', label: 'Santiago de Chile (UTC-3 / UTC-4 inv.)' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+1 / UTC+2 verano)' },
  { value: 'UTC', label: 'UTC' },
];

export function timezoneFriendlyLabel(iana: string): string {
  const row = TIMEZONE_OPTIONS.find((t) => t.value === iana);
  return row ? `${iana} · ${row.label}` : `${iana} (IANA)`;
}

export function isValidIanaTimezone(tz: string): boolean {
  const t = tz.trim();
  if (!t) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: t });
    return true;
  } catch {
    return false;
  }
}

export function emptyMilestoneRow(defaultCoinCode: string): StreakMilestoneFormRow {
  return {
    day_number: 1,
    reward_kind: 'coins',
    xp_amount: 25,
    coin_code: defaultCoinCode,
    coin_amount: 100,
    chest_id: '',
    bonus_id: '',
    freespin_quantity: 10,
    freespin_game_id: '',
    freebet_amount: 10,
    freebet_currency: 'USD',
    cashback_percentage: 5,
    cashback_max_amount: 0,
    bonus_percentage: 50,
    bonus_max_amount: 0,
    manual_description: '',
  };
}

export function defaultStreakEditorForm(defaultTimezone: string, defaultCoinCode: string): StreakEditorFormValues {
  return {
    name: '',
    activity_type: 'login',
    minimum_logins_per_day: 1,
    minimum_amount_per_deposit: 20,
    minimum_amount_total_per_day: 50,
    minimum_amount_per_bet: 10,
    minimum_amount_total_bet_per_day: 50,
    activity_threshold_currency: '',
    timezone: defaultTimezone,
    reset_policy: 'strict',
    grace_days_rolling: 1,
    grace_after_action: 'reset_to_zero',
    grace_days_lost: 1,
    soft_days_lost_on_break: 3,
    daily_reward_kind: 'none',
    daily_xp_amount: 25,
    daily_coin_code: defaultCoinCode,
    daily_coin_amount: 10,
    daily_chest_id: '',
    daily_bonus_id: '',
    daily_freespin_quantity: 5,
    daily_freespin_game_id: '',
    daily_freebet_amount: 10,
    daily_freebet_currency: 'USD',
    daily_cashback_percentage: 5,
    daily_cashback_max_amount: 0,
    daily_bonus_percentage: 50,
    daily_bonus_max_amount: 0,
    milestones: [emptyMilestoneRow(defaultCoinCode)],
  };
}

function readGraceDaysFromConfig(c: Record<string, unknown>): number {
  const d =
    c.grace_days_per_rolling_window ??
    c.grace_days_rolling_window_30d ??
    c.grace_days_rolling ??
    c.grace_days_per_rolling;
  if (typeof d === 'number' && Number.isFinite(d)) return Math.min(10, Math.max(1, Math.round(d)));
  const h = c.grace_hours;
  if (typeof h === 'number' && Number.isFinite(h)) return Math.min(10, Math.max(1, Math.round(h / 24)));
  return 1;
}

function readGraceAfter(c: Record<string, unknown>): GraceAfterAction {
  const a = c.after_grace_action ?? c.grace_after_action;
  if (a === 'lose_days') return 'lose_days';
  return 'reset_to_zero';
}

function readGraceDaysLost(c: Record<string, unknown>): number {
  const n = c.days_lost_after_grace ?? c.lose_days ?? c.grace_lose_days;
  if (typeof n === 'number' && Number.isFinite(n)) return Math.max(1, Math.round(n));
  return 1;
}

function readSoftDaysLost(c: Record<string, unknown>): number {
  const n = c.days_lost_on_break ?? c.days_lost;
  if (typeof n === 'number' && Number.isFinite(n)) return Math.min(20, Math.max(1, Math.round(n)));
  return 3;
}

function readThresholdCurrency(cfg: Record<string, unknown>): string {
  const c = cfg.activity_threshold_currency;
  return c == null || c === '' ? '' : String(c);
}

function readActivityIntoForm(
  activityType: StreakActivityType,
  cfg: Record<string, unknown>,
  row: StreakEditorFormValues,
): void {
  if (activityType === 'login') {
    row.minimum_logins_per_day = Math.max(1, Math.round(Number(cfg.minimum_logins_per_day ?? 1)));
    return;
  }
  if (activityType === 'deposit_individual') {
    row.minimum_amount_per_deposit = Number(cfg.minimum_amount_per_deposit ?? 20);
    row.activity_threshold_currency = readThresholdCurrency(cfg);
    return;
  }
  if (activityType === 'deposit_cumulative') {
    row.minimum_amount_total_per_day = Number(cfg.minimum_amount_total_per_day ?? cfg.minimum_amount ?? 50);
    row.activity_threshold_currency = readThresholdCurrency(cfg);
    return;
  }
  if (activityType === 'bet_individual') {
    row.minimum_amount_per_bet = Number(cfg.minimum_amount_per_bet ?? cfg.minimum_amount ?? 10);
    row.activity_threshold_currency = readThresholdCurrency(cfg);
    return;
  }
  if (activityType === 'bet_cumulative') {
    row.minimum_amount_total_bet_per_day = Number(
      cfg.minimum_amount_total_per_day ?? cfg.minimum_amount ?? 50,
    );
    row.activity_threshold_currency = readThresholdCurrency(cfg);
  }
}

function rewardConfigFromRow(kind: StreakRewardKind, row: StreakMilestoneFormRow): StreakRewardConfig {
  if (kind === 'xp') return { amount: Math.max(1, Math.round(row.xp_amount)) };
  if (kind === 'coins') {
    return { coin_code: row.coin_code.trim() || 'main', amount: Math.max(1, Math.round(row.coin_amount)) };
  }
  if (kind === 'chest') return { chest_id: row.chest_id.trim() };
  if (kind === 'freespin' || kind === 'freebet' || kind === 'cashback' || kind === 'bonus_deposit') {
    return { bonus_id: row.bonus_id.trim() };
  }
  return { description: row.manual_description.trim().slice(0, 500) };
}

function milestoneRowFromApi(m: StreakMilestone, defaultCoinCode: string): StreakMilestoneFormRow {
  if (m.reward_type == null || m.reward_config == null) {
    const base = emptyMilestoneRow(defaultCoinCode);
    base.day_number = m.day_number;
    base.reward_kind = 'none';
    return base;
  }
  const rt = m.reward_type.toLowerCase() as StreakRewardType;
  const cfg = (m.reward_config ?? {}) as Record<string, unknown>;
  const base = emptyMilestoneRow(defaultCoinCode);
  base.day_number = m.day_number;
  if (rt === 'manual') {
    base.reward_kind = 'manual';
    base.manual_description = String(cfg.description ?? '');
    return base;
  }
  if (rt === 'xp') {
    base.reward_kind = 'xp';
    base.xp_amount = Number(cfg.amount ?? 0);
    return base;
  }
  if (rt === 'coins') {
    base.reward_kind = 'coins';
    base.coin_amount = Number(cfg.amount ?? 0);
    base.coin_code = coinCodeFromLegacy(String(cfg.coin_code ?? cfg.coin_id ?? defaultCoinCode));
    return base;
  }
  if (rt === 'chest') {
    base.reward_kind = 'chest';
    base.chest_id = String(cfg.chest_id ?? '');
    return base;
  }
  if (rt === 'freespin' || rt === 'freebet' || rt === 'cashback' || rt === 'bonus_deposit') {
    base.reward_kind = rt;
    base.bonus_id = String(cfg.bonus_id ?? '');
    return base;
  }
  base.reward_kind = 'coins';
  base.coin_amount = 100;
  return base;
}

function inferDailyKind(dr: StreakDailyMicroReward | Record<string, unknown> | null | undefined): Exclude<StreakRewardKind, 'manual'> {
  if (!dr || typeof dr !== 'object') return 'none';
  const t = (dr as StreakDailyMicroReward).type ?? (dr as Record<string, unknown>).type;
  if (t === 'xp' || t === 'coins' || t === 'chest' || t === 'freespin' || t === 'freebet' || t === 'cashback' || t === 'bonus_deposit') {
    return t;
  }
  if (Object.keys(dr).length === 0) return 'none';
  return 'none';
}

function dailyConfigRecord(dr: StreakDailyMicroReward | Record<string, unknown>): Record<string, unknown> {
  if ('config' in dr && dr.config && typeof dr.config === 'object') return dr.config as Record<string, unknown>;
  return dr as Record<string, unknown>;
}

function readDailyFields(dr: StreakDailyMicroReward | Record<string, unknown> | null | undefined, row: StreakEditorFormValues, defaultCoinCode: string): void {
  const kind = inferDailyKind(dr);
  row.daily_reward_kind = kind;
  if (kind === 'none' || !dr) return;
  const cfg = dailyConfigRecord(dr);
  if (kind === 'xp') row.daily_xp_amount = Number(cfg.amount ?? 25);
  if (kind === 'coins') {
    row.daily_coin_amount = Number(cfg.amount ?? 10);
    row.daily_coin_code = coinCodeFromLegacy(String(cfg.coin_code ?? cfg.coin_id ?? defaultCoinCode));
  }
  if (kind === 'chest') row.daily_chest_id = String(cfg.chest_id ?? '');
  if (['freespin', 'freebet', 'cashback', 'bonus_deposit'].includes(kind)) {
    row.daily_bonus_id = String(cfg.bonus_id ?? '');
  }
}

export function programToEditorForm(p: StreakProgram, defaultCoinCode: string): StreakEditorFormValues {
  const cfg = (p.reset_policy_config ?? {}) as Record<string, unknown>;
  const activityCfg = (p.activity_config ?? {}) as Record<string, unknown>;
  const row: StreakEditorFormValues = {
    ...defaultStreakEditorForm(p.timezone, defaultCoinCode),
    name: p.name,
    activity_type: p.activity_type,
    timezone: p.timezone,
    reset_policy: p.reset_policy,
    grace_days_rolling: p.reset_policy === 'grace' ? readGraceDaysFromConfig(cfg) : 1,
    grace_after_action: p.reset_policy === 'grace' ? readGraceAfter(cfg) : 'reset_to_zero',
    grace_days_lost: p.reset_policy === 'grace' ? readGraceDaysLost(cfg) : 1,
    soft_days_lost_on_break: p.reset_policy === 'soft_reset' ? readSoftDaysLost(cfg) : 3,
    milestones: (p.milestones ?? []).map((m) => milestoneRowFromApi(m, defaultCoinCode)),
  };
  readActivityIntoForm(p.activity_type, activityCfg, row);
  readDailyFields(p.daily_micro_reward, row, defaultCoinCode);
  if (!row.milestones.length) row.milestones = [emptyMilestoneRow(defaultCoinCode)];
  return row;
}

function buildResetPolicyConfig(f: StreakEditorFormValues): StreakProgram['reset_policy_config'] {
  if (f.reset_policy === 'strict') return {};
  if (f.reset_policy === 'grace') {
    const base: Extract<StreakProgram['reset_policy_config'], { grace_days_per_rolling_window: number }> = {
      grace_days_per_rolling_window: Math.min(10, Math.max(1, Math.round(f.grace_days_rolling))),
      after_grace_action: f.grace_after_action,
    };
    if (f.grace_after_action === 'lose_days') {
      base.days_lost_after_grace = Math.max(1, Math.round(f.grace_days_lost));
    }
    return base;
  }
  return { days_lost_on_break: Math.min(20, Math.max(1, Math.round(f.soft_days_lost_on_break))) };
}

function buildActivityThresholdCurrency(f: StreakEditorFormValues): string | null {
  const code = f.activity_threshold_currency.trim().toUpperCase();
  return code ? code : null;
}

function buildActivityConfig(f: StreakEditorFormValues): StreakActivityConfig {
  const currency = buildActivityThresholdCurrency(f);
  switch (f.activity_type) {
    case 'login':
      return { minimum_logins_per_day: Math.max(1, Math.round(f.minimum_logins_per_day)) };
    case 'deposit_individual':
      return {
        minimum_amount_per_deposit: Math.max(0.01, f.minimum_amount_per_deposit),
        activity_threshold_currency: currency,
      };
    case 'deposit_cumulative':
      return {
        minimum_amount_total_per_day: Math.max(0.01, f.minimum_amount_total_per_day),
        activity_threshold_currency: currency,
      };
    case 'bet_individual':
      return {
        minimum_amount_per_bet: Math.max(0.01, f.minimum_amount_per_bet),
        activity_threshold_currency: currency,
      };
    case 'bet_cumulative':
      return {
        minimum_amount_total_per_day: Math.max(0.01, f.minimum_amount_total_bet_per_day),
        activity_threshold_currency: currency,
      };
    default:
      return { minimum_logins_per_day: 1 };
  }
}

function buildDailyMicroReward(f: StreakEditorFormValues): StreakDailyMicroReward | null {
  const k = f.daily_reward_kind;
  if (k === 'none') return null;
  const type = k as StreakRewardType;
  const row = {
    reward_kind: k,
    xp_amount: f.daily_xp_amount,
    coin_code: f.daily_coin_code,
    coin_amount: f.daily_coin_amount,
    chest_id: f.daily_chest_id,
    bonus_id: f.daily_bonus_id,
    freespin_quantity: f.daily_freespin_quantity,
    freespin_game_id: f.daily_freespin_game_id,
    freebet_amount: f.daily_freebet_amount,
    freebet_currency: f.daily_freebet_currency,
    cashback_percentage: f.daily_cashback_percentage,
    cashback_max_amount: f.daily_cashback_max_amount,
    bonus_percentage: f.daily_bonus_percentage,
    bonus_max_amount: f.daily_bonus_max_amount,
    manual_description: '',
    day_number: 1,
  } as StreakMilestoneFormRow;
  return { type, config: rewardConfigFromRow(k, row) };
}

function buildMilestoneReward(row: StreakMilestoneFormRow): StreakMilestone {
  if (row.reward_kind === 'none') {
    return {
      day_number: row.day_number,
      reward_type: null,
      reward_config: null,
    };
  }
  const kind = row.reward_kind;
  return {
    day_number: row.day_number,
    reward_type: kind as StreakRewardType,
    reward_config: rewardConfigFromRow(kind, row),
  };
}

export function buildProgramPayload(f: StreakEditorFormValues, id?: string): Partial<StreakProgram> & { id?: string } {
  const milestones = [...f.milestones]
    .sort((a, b) => a.day_number - b.day_number)
    .map((row) =>
      buildMilestoneReward({
        ...row,
        day_number: Math.min(365, Math.max(1, Math.round(row.day_number))),
      }),
    );
  const base: Partial<StreakProgram> & { id?: string } = {
    name: f.name.trim(),
    activity_type: f.activity_type,
    activity_config: buildActivityConfig(f),
    timezone: f.timezone.trim(),
    reset_policy: f.reset_policy,
    reset_policy_config: buildResetPolicyConfig(f),
    daily_micro_reward: buildDailyMicroReward(f),
    milestones,
  };
  if (id) base.id = id;
  return base;
}

function validateActivityConfig(f: StreakEditorFormValues): Record<string, string> {
  const e: Record<string, string> = {};
  if (f.activity_type === 'login') {
    if (!Number.isFinite(f.minimum_logins_per_day) || f.minimum_logins_per_day < 1) {
      e.minimum_logins_per_day = 'Mínimo 1 login por día';
    }
  }
  if (f.activity_type === 'deposit_individual') {
    if (!Number.isFinite(f.minimum_amount_per_deposit) || f.minimum_amount_per_deposit < 0.01) {
      e.minimum_amount_per_deposit = 'El monto mínimo debe ser ≥ 0.01';
    }
  }
  if (f.activity_type === 'deposit_cumulative') {
    if (!Number.isFinite(f.minimum_amount_total_per_day) || f.minimum_amount_total_per_day < 0.01) {
      e.minimum_amount_total_per_day = 'El monto acumulado debe ser ≥ 0.01';
    }
  }
  if (f.activity_type === 'bet_individual') {
    if (!Number.isFinite(f.minimum_amount_per_bet) || f.minimum_amount_per_bet < 0.01) {
      e.minimum_amount_per_bet = 'El monto mínimo por apuesta debe ser ≥ 0.01';
    }
  }
  if (f.activity_type === 'bet_cumulative') {
    if (!Number.isFinite(f.minimum_amount_total_bet_per_day) || f.minimum_amount_total_bet_per_day < 0.01) {
      e.minimum_amount_total_bet_per_day = 'El monto acumulado debe ser ≥ 0.01';
    }
  }
  return e;
}

function validateDailyMicroFields(f: StreakEditorFormValues): Record<string, string> {
  const e: Record<string, string> = {};
  const k = f.daily_reward_kind;
  if (k === 'none') return e;
  if (k === 'xp' && (!Number.isFinite(f.daily_xp_amount) || f.daily_xp_amount < 1)) e.daily_xp_amount = 'La cantidad de XP debe ser ≥ 1';
  if (k === 'coins') {
    if (!f.daily_coin_code.trim()) e.daily_coin_code = 'Elegí una moneda';
    if (!Number.isFinite(f.daily_coin_amount) || f.daily_coin_amount < 1) e.daily_coin_amount = 'La cantidad debe ser ≥ 1';
  }
  if (k === 'chest' && !f.daily_chest_id.trim()) e.daily_chest_id = 'Elegí un cofre';
  if (['freespin', 'freebet', 'cashback', 'bonus_deposit'].includes(k) && !f.daily_bonus_id.trim()) {
    e.daily_bonus_id = 'Seleccioná un bono del catálogo';
  }
  return e;
}

function validateMilestoneRowFields(i: number, row: StreakMilestoneFormRow): Record<string, string> {
  const e: Record<string, string> = {};
  const k = row.reward_kind;
  const b = `milestones.${i}` as const;
  if (k === 'none') return e;
  if (k === 'xp' && (!Number.isFinite(row.xp_amount) || row.xp_amount < 1)) e[`${b}.xp_amount`] = 'La cantidad de XP debe ser ≥ 1';
  if (k === 'coins') {
    if (!row.coin_code.trim()) e[`${b}.coin_code`] = 'Elegí una moneda';
    if (!Number.isFinite(row.coin_amount) || row.coin_amount < 1) e[`${b}.coin_amount`] = 'La cantidad debe ser ≥ 1';
  }
  if (k === 'chest' && !row.chest_id.trim()) e[`${b}.chest_id`] = 'Elegí un cofre';
  if (['freespin', 'freebet', 'cashback', 'bonus_deposit'].includes(k) && !row.bonus_id.trim()) {
    e[`${b}.bonus_id`] = 'Seleccioná un bono del catálogo';
  }
  if (k === 'manual') {
    const d = row.manual_description.trim();
    if (d.length < 3) e[`${b}.manual_description`] = 'Describe el premio (mín. 3 caracteres)';
    if (d.length > 500) e[`${b}.manual_description`] = 'Máximo 500 caracteres';
  }
  return e;
}

export function maxDayFromMilestones(milestones: StreakMilestoneFormRow[]): number {
  const ds = milestones.map((m) => Math.max(1, Math.round(m.day_number))).filter(Boolean);
  return ds.length ? Math.max(...ds, 1) : 1;
}

export type NameAvailability = boolean | null;

export function validateStreakEditorForm(f: StreakEditorFormValues, nameAvailable: NameAvailability): Record<string, string> {
  const err: Record<string, string> = {};
  const name = f.name.trim();
  if (name.length < 3 || name.length > 100) err.name = 'El nombre debe tener entre 3 y 100 caracteres';
  if (!f.activity_type) err.activity_type = 'Elegí un tipo de actividad';
  Object.assign(err, validateActivityConfig(f));
  if (!f.timezone.trim()) err.timezone = 'El timezone es obligatorio';
  else if (!isValidIanaTimezone(f.timezone)) err.timezone = 'Timezone IANA inválido';
  if (!f.reset_policy) err.reset_policy = 'Elegí una política de reset';

  if (f.reset_policy === 'grace') {
    const gd = Math.round(f.grace_days_rolling);
    if (gd < 1 || gd > 10) err.grace_days_rolling = 'Entre 1 y 10 días de gracia (ventana 30 días)';
    if (f.grace_after_action === 'lose_days') {
      const maxLose = Math.min(365, maxDayFromMilestones(f.milestones));
      const ld = Math.round(f.grace_days_lost);
      if (ld < 1 || ld > maxLose) err.grace_days_lost = `Entre 1 y ${maxLose} días (según tus hitos)`;
    }
  }
  if (f.reset_policy === 'soft_reset') {
    const d = Math.round(f.soft_days_lost_on_break);
    if (d < 1 || d > 20) err.soft_days_lost_on_break = 'Entre 1 y 20 días perdidos al romper la racha';
  }

  Object.assign(err, validateDailyMicroFields(f));

  const seen = new Map<number, number>();
  f.milestones.forEach((m, i) => {
    const d = Math.round(m.day_number);
    if (!Number.isFinite(d) || d < 1 || d > 365) err[`milestones.${i}.day_number`] = 'Día entre 1 y 365';
    else if (seen.has(d)) err[`milestones.${i}.day_number`] = 'Cada día debe ser único';
    else seen.set(d, i);
    Object.assign(err, validateMilestoneRowFields(i, m));
  });

  if (name.length >= 3 && nameAvailable === false) err.name = 'Ya existe un programa con este nombre';

  return err;
}

export function validateStreakEditorFormWithListLimits(f: StreakEditorFormValues, nameAvailable: NameAvailability): {
  fieldErrors: Record<string, string>;
  milestonesListError?: string;
} {
  if (f.milestones.length > 20) {
    return { fieldErrors: validateStreakEditorForm(f, nameAvailable), milestonesListError: 'Máximo 20 milestones por programa' };
  }
  return { fieldErrors: validateStreakEditorForm(f, nameAvailable) };
}

export function applyValidationErrors<T extends StreakEditorFormValues>(
  form: UseFormReturn<T>,
  errors: Record<string, string>,
): void {
  form.clearErrors();
  for (const [path, message] of Object.entries(errors)) {
    form.setError(path as FieldPath<T>, { type: 'manual', message });
  }
}

export function rewardPreviewLabel(
  kind: StreakRewardKind,
  row: StreakMilestoneFormRow | StreakEditorFormValues,
  isDaily: boolean,
  fiatCurrency?: { code: string; symbol?: string } | null,
): string {
  if (kind === 'none') return isDaily ? 'sin micro-recompensa' : 'Sin premio (hito visual)';
  if (kind === 'manual' && 'manual_description' in row) {
    const t = row.manual_description.trim().slice(0, 40);
    return t ? `Manual: ${t}${row.manual_description.length > 40 ? '…' : ''}` : 'Manual';
  }
  if (kind === 'xp') {
    const n = isDaily ? (row as StreakEditorFormValues).daily_xp_amount : (row as StreakMilestoneFormRow).xp_amount;
    return `+${n} XP`;
  }
  if (kind === 'coins') {
    const n = isDaily ? (row as StreakEditorFormValues).daily_coin_amount : (row as StreakMilestoneFormRow).coin_amount;
    return `${n} monedas`;
  }
  if (kind === 'chest') {
    const id = isDaily ? (row as StreakEditorFormValues).daily_chest_id : (row as StreakMilestoneFormRow).chest_id;
    return id ? `Cofre ${id}` : 'Cofre';
  }
  if (kind === 'freespin') {
    const n = isDaily ? (row as StreakEditorFormValues).daily_freespin_quantity : (row as StreakMilestoneFormRow).freespin_quantity;
    return `${n} freespins`;
  }
  if (kind === 'freebet') {
    const a = isDaily ? (row as StreakEditorFormValues).daily_freebet_amount : (row as StreakMilestoneFormRow).freebet_amount;
    const c = isDaily ? (row as StreakEditorFormValues).daily_freebet_currency : (row as StreakMilestoneFormRow).freebet_currency;
    const cur =
      fiatCurrency?.code && c === fiatCurrency.code
        ? fiatCurrency
        : { code: c ?? 'USD', symbol: c === fiatCurrency?.code ? fiatCurrency?.symbol : undefined };
    return `${formatOperatorAmount(Number(a) || 0, cur)} freebet`;
  }
  if (kind === 'cashback') {
    const p = isDaily ? (row as StreakEditorFormValues).daily_cashback_percentage : (row as StreakMilestoneFormRow).cashback_percentage;
    return `${p}% cashback`;
  }
  if (kind === 'bonus_deposit') {
    const p = isDaily ? (row as StreakEditorFormValues).daily_bonus_percentage : (row as StreakMilestoneFormRow).bonus_percentage;
    return `${p}% bonus depósito`;
  }
  return kind;
}
