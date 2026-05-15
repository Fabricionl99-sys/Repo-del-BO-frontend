import type { FieldPath, UseFormReturn } from 'react-hook-form';

import type { StreakActivityType, StreakMilestone, StreakProgram, StreakResetPolicy } from '@/types/streakPrograms';

export const ACTIVITY_OPTIONS: { value: StreakActivityType; label: string }[] = [
  { value: 'login', label: 'Login diario' },
  { value: 'deposit_individual', label: 'Depósito individual' },
  { value: 'deposit_cumulative', label: 'Depósitos acumulados' },
  { value: 'bet_individual', label: 'Apuesta individual' },
  { value: 'bet_cumulative', label: 'Apuestas acumuladas' },
];

/** Tipos de premio estructurado (micro + milestones; `manual` solo en hitos). */
export type StreakRewardKind = 'none' | 'xp' | 'coins' | 'chest' | 'freespin' | 'freebet' | 'cashback' | 'bonus_deposit' | 'manual';

export type GraceAfterAction = 'reset_zero' | 'lose_days';

export const FIAT_CURRENCIES = ['USD', 'EUR', 'ARS', 'MXN', 'CLP', 'BRL'] as const;

export interface StreakMilestoneFormRow {
  day_number: number;
  reward_kind: StreakRewardKind;
  xp_amount: number;
  coin_id: string;
  coin_amount: number;
  chest_id: string;
  freespin_count: number;
  freespin_game_id: string;
  freebet_amount: number;
  freebet_currency: string;
  cashback_percent: number;
  cashback_cap: number;
  bonus_percent: number;
  bonus_cap: number;
  manual_description: string;
}

export interface StreakEditorFormValues {
  name: string;
  activity_type: StreakActivityType;
  timezone: string;
  reset_policy: StreakResetPolicy;
  grace_days_rolling: number;
  grace_after_action: GraceAfterAction;
  grace_lose_days: number;
  soft_days_lost_on_break: number;
  daily_reward_kind: Exclude<StreakRewardKind, 'manual'>;
  daily_xp_amount: number;
  daily_coin_id: string;
  daily_coin_amount: number;
  daily_chest_id: string;
  daily_freespin_count: number;
  daily_freespin_game_id: string;
  daily_freebet_amount: number;
  daily_freebet_currency: string;
  daily_cashback_percent: number;
  daily_cashback_cap: number;
  daily_bonus_percent: number;
  daily_bonus_cap: number;
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

export function emptyMilestoneRow(defaultCoinId: string): StreakMilestoneFormRow {
  return {
    day_number: 1,
    reward_kind: 'coins',
    xp_amount: 25,
    coin_id: defaultCoinId,
    coin_amount: 100,
    chest_id: '',
    freespin_count: 10,
    freespin_game_id: '',
    freebet_amount: 10,
    freebet_currency: 'USD',
    cashback_percent: 5,
    cashback_cap: 0,
    bonus_percent: 50,
    bonus_cap: 0,
    manual_description: '',
  };
}

export function defaultStreakEditorForm(defaultTimezone: string, defaultCoinId: string): StreakEditorFormValues {
  return {
    name: '',
    activity_type: 'login',
    timezone: defaultTimezone,
    reset_policy: 'strict',
    grace_days_rolling: 1,
    grace_after_action: 'reset_zero',
    grace_lose_days: 1,
    soft_days_lost_on_break: 3,
    daily_reward_kind: 'none',
    daily_xp_amount: 25,
    daily_coin_id: defaultCoinId,
    daily_coin_amount: 10,
    daily_chest_id: '',
    daily_freespin_count: 5,
    daily_freespin_game_id: '',
    daily_freebet_amount: 10,
    daily_freebet_currency: 'USD',
    daily_cashback_percent: 5,
    daily_cashback_cap: 0,
    daily_bonus_percent: 50,
    daily_bonus_cap: 0,
    milestones: [emptyMilestoneRow(defaultCoinId)],
  };
}

function readGraceDaysFromConfig(c: Record<string, unknown>): number {
  const d = c.grace_days_rolling_window_30d ?? c.grace_days_rolling;
  if (typeof d === 'number' && Number.isFinite(d)) return Math.min(10, Math.max(1, Math.round(d)));
  const h = c.grace_hours;
  if (typeof h === 'number' && Number.isFinite(h)) return Math.min(10, Math.max(1, Math.round(h / 24)));
  return 1;
}

function readGraceAfter(c: Record<string, unknown>): GraceAfterAction {
  const a = c.after_grace_action ?? c.grace_after_action;
  if (a === 'lose_days') return 'lose_days';
  if (a === 'reset_to_zero' || a === 'reset_zero') return 'reset_zero';
  return 'reset_zero';
}

function readGraceLoseDays(c: Record<string, unknown>): number {
  const n = c.lose_days ?? c.grace_lose_days;
  if (typeof n === 'number' && Number.isFinite(n)) return Math.max(1, Math.round(n));
  return 1;
}

function readSoftDaysLost(c: Record<string, unknown>): number {
  const n = c.days_lost_on_break ?? c.days_lost;
  if (typeof n === 'number' && Number.isFinite(n)) return Math.min(20, Math.max(1, Math.round(n)));
  return 3;
}

function inferDailyKind(dr: Record<string, unknown>): Exclude<StreakRewardKind, 'manual'> {
  const t = dr.type;
  if (t === 'xp') return 'xp';
  if (t === 'coins') return 'coins';
  if (t === 'chest') return 'chest';
  if (t === 'freespin' || t === 'free_spins') return 'freespin';
  if (t === 'freebet' || t === 'free_bet') return 'freebet';
  if (t === 'cashback') return 'cashback';
  if (t === 'bonus_deposit' || t === 'bonus') return 'bonus_deposit';
  if (t === 'none' || t === null) return 'none';
  if (Object.keys(dr).length === 0) return 'none';
  return 'none';
}

function milestoneRowFromApi(m: StreakMilestone, defaultCoinId: string): StreakMilestoneFormRow {
  const rt = (m.reward_type ?? 'coins').toLowerCase();
  const cfg = (m.reward_config ?? {}) as Record<string, unknown>;
  const base = emptyMilestoneRow(defaultCoinId);
  base.day_number = m.day_number;
  if (rt === 'manual') {
    base.reward_kind = 'manual';
    base.manual_description = String(cfg.description ?? cfg.label ?? '');
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
    base.coin_id = String(cfg.coin_id ?? defaultCoinId);
    return base;
  }
  if (rt === 'chest') {
    base.reward_kind = 'chest';
    base.chest_id = String(cfg.chest_id ?? '');
    return base;
  }
  if (rt === 'freespin' || rt === 'free_spins') {
    base.reward_kind = 'freespin';
    base.freespin_count = Number(cfg.count ?? cfg.amount ?? 0);
    base.freespin_game_id = String(cfg.game_id ?? '');
    return base;
  }
  if (rt === 'freebet' || rt === 'free_bet') {
    base.reward_kind = 'freebet';
    base.freebet_amount = Number(cfg.amount ?? 0);
    base.freebet_currency = String(cfg.currency ?? 'USD');
    return base;
  }
  if (rt === 'cashback') {
    base.reward_kind = 'cashback';
    base.cashback_percent = Number(cfg.percent ?? 0);
    base.cashback_cap = Number(cfg.max_amount ?? cfg.cap ?? 0);
    return base;
  }
  if (rt === 'bonus_deposit') {
    base.reward_kind = 'bonus_deposit';
    base.bonus_percent = Number(cfg.percent ?? 0);
    base.bonus_cap = Number(cfg.cap_usd ?? cfg.cap ?? 0);
    return base;
  }
  base.reward_kind = 'coins';
  base.coin_amount = 100;
  return base;
}

export function programToEditorForm(p: StreakProgram, defaultCoinId: string): StreakEditorFormValues {
  const cfg = (p.reset_policy_config ?? {}) as Record<string, unknown>;
  const dr = (p.daily_micro_reward ?? {}) as Record<string, unknown>;
  const dk = inferDailyKind(dr);

  const row: StreakEditorFormValues = {
    ...defaultStreakEditorForm(p.timezone, defaultCoinId),
    name: p.name,
    activity_type: p.activity_type,
    timezone: p.timezone,
    reset_policy: p.reset_policy,
    grace_days_rolling: p.reset_policy === 'grace' ? readGraceDaysFromConfig(cfg) : 1,
    grace_after_action: p.reset_policy === 'grace' ? readGraceAfter(cfg) : 'reset_zero',
    grace_lose_days: p.reset_policy === 'grace' ? readGraceLoseDays(cfg) : 1,
    soft_days_lost_on_break: p.reset_policy === 'soft_reset' ? readSoftDaysLost(cfg) : 3,
    daily_reward_kind: dk,
    daily_xp_amount: Number(dr.amount ?? 25),
    daily_coin_id: String(dr.coin_id ?? defaultCoinId),
    daily_coin_amount: Number(dr.amount ?? 10),
    daily_chest_id: String(dr.chest_id ?? ''),
    daily_freespin_count: Number(dr.count ?? dr.spins ?? 5),
    daily_freespin_game_id: String(dr.game_id ?? ''),
    daily_freebet_amount: Number(dr.amount ?? 10),
    daily_freebet_currency: String(dr.currency ?? 'USD'),
    daily_cashback_percent: Number(dr.percent ?? 5),
    daily_cashback_cap: Number(dr.max_amount ?? dr.cap ?? 0),
    daily_bonus_percent: Number(dr.percent ?? 50),
    daily_bonus_cap: Number(dr.cap_usd ?? dr.cap ?? 0),
    milestones: (p.milestones ?? []).map((m) => milestoneRowFromApi(m, defaultCoinId)),
  };
  if (!row.milestones.length) row.milestones = [emptyMilestoneRow(defaultCoinId)];
  return row;
}

function buildResetPolicyConfig(f: StreakEditorFormValues): Record<string, unknown> {
  if (f.reset_policy === 'strict') return {};
  if (f.reset_policy === 'grace') {
    const base: Record<string, unknown> = {
      grace_days_rolling_window_30d: Math.min(10, Math.max(1, Math.round(f.grace_days_rolling))),
      after_grace_action: f.grace_after_action === 'lose_days' ? 'lose_days' : 'reset_to_zero',
    };
    if (f.grace_after_action === 'lose_days') {
      base.lose_days = Math.max(1, Math.round(f.grace_lose_days));
    }
    return base;
  }
  return { days_lost_on_break: Math.min(20, Math.max(1, Math.round(f.soft_days_lost_on_break))) };
}

function buildDailyMicroReward(f: StreakEditorFormValues): Record<string, unknown> {
  switch (f.daily_reward_kind) {
    case 'none':
      return {};
    case 'xp':
      return { type: 'xp', amount: Math.max(1, Math.round(f.daily_xp_amount)) };
    case 'coins':
      return {
        type: 'coins',
        amount: Math.max(1, Math.round(f.daily_coin_amount)),
        coin_id: f.daily_coin_id.trim() || undefined,
      };
    case 'chest':
      return { type: 'chest', chest_id: f.daily_chest_id.trim() };
    case 'freespin':
      return {
        type: 'freespin',
        count: Math.max(1, Math.round(f.daily_freespin_count)),
        game_id: f.daily_freespin_game_id.trim() || undefined,
      };
    case 'freebet':
      return {
        type: 'freebet',
        amount: Math.max(0.01, f.daily_freebet_amount),
        currency: f.daily_freebet_currency,
      };
    case 'cashback':
      return {
        type: 'cashback',
        percent: Math.min(100, Math.max(0.01, f.daily_cashback_percent)),
        max_amount: f.daily_cashback_cap > 0 ? f.daily_cashback_cap : undefined,
      };
    case 'bonus_deposit':
      return {
        type: 'bonus_deposit',
        percent: Math.min(500, Math.max(0.01, f.daily_bonus_percent)),
        cap: f.daily_bonus_cap > 0 ? f.daily_bonus_cap : undefined,
      };
    default:
      return {};
  }
}

function buildMilestoneReward(row: StreakMilestoneFormRow): StreakMilestone {
  if (row.reward_kind === 'manual') {
    return {
      day_number: row.day_number,
      reward_type: 'manual',
      reward_config: { description: row.manual_description.trim().slice(0, 500) },
    };
  }
  if (row.reward_kind === 'xp') {
    return { day_number: row.day_number, reward_type: 'xp', reward_config: { amount: Math.max(1, Math.round(row.xp_amount)) } };
  }
  if (row.reward_kind === 'coins') {
    return {
      day_number: row.day_number,
      reward_type: 'coins',
      reward_config: {
        amount: Math.max(1, Math.round(row.coin_amount)),
        coin_id: row.coin_id.trim() || undefined,
      },
    };
  }
  if (row.reward_kind === 'chest') {
    return { day_number: row.day_number, reward_type: 'chest', reward_config: { chest_id: row.chest_id.trim() } };
  }
  if (row.reward_kind === 'freespin') {
    return {
      day_number: row.day_number,
      reward_type: 'freespin',
      reward_config: {
        count: Math.max(1, Math.round(row.freespin_count)),
        game_id: row.freespin_game_id.trim() || undefined,
      },
    };
  }
  if (row.reward_kind === 'freebet') {
    return {
      day_number: row.day_number,
      reward_type: 'freebet',
      reward_config: {
        amount: Math.max(0.01, row.freebet_amount),
        currency: row.freebet_currency,
      },
    };
  }
  if (row.reward_kind === 'cashback') {
    return {
      day_number: row.day_number,
      reward_type: 'cashback',
      reward_config: {
        percent: Math.min(100, Math.max(0.01, row.cashback_percent)),
        max_amount: row.cashback_cap > 0 ? row.cashback_cap : undefined,
      },
    };
  }
  if (row.reward_kind === 'bonus_deposit') {
    return {
      day_number: row.day_number,
      reward_type: 'bonus_deposit',
      reward_config: {
        percent: Math.min(500, Math.max(0.01, row.bonus_percent)),
        cap_usd: row.bonus_cap > 0 ? row.bonus_cap : undefined,
      },
    };
  }
  return { day_number: row.day_number, reward_type: 'coins', reward_config: { amount: 1, coin_id: 'coin_oro' } };
}

export function buildProgramPayload(f: StreakEditorFormValues, id?: string): Partial<StreakProgram> & { id?: string } {
  const milestones = [...f.milestones].sort((a, b) => a.day_number - b.day_number).map((row) => buildMilestoneReward({ ...row, day_number: Math.min(365, Math.max(1, Math.round(row.day_number))) }));
  const base: Partial<StreakProgram> & { id?: string } = {
    name: f.name.trim(),
    activity_type: f.activity_type,
    timezone: f.timezone.trim(),
    reset_policy: f.reset_policy,
    reset_policy_config: buildResetPolicyConfig(f),
    daily_micro_reward: buildDailyMicroReward(f),
    milestones,
  };
  if (id) base.id = id;
  return base;
}

function validateDailyMicroFields(f: StreakEditorFormValues): Record<string, string> {
  const e: Record<string, string> = {};
  const k = f.daily_reward_kind;
  if (k === 'none') return e;
  if (k === 'xp' && (!Number.isFinite(f.daily_xp_amount) || f.daily_xp_amount < 1)) e.daily_xp_amount = 'La cantidad de XP debe ser ≥ 1';
  if (k === 'coins') {
    if (!f.daily_coin_id.trim()) e.daily_coin_id = 'Elegí una moneda';
    if (!Number.isFinite(f.daily_coin_amount) || f.daily_coin_amount < 1) e.daily_coin_amount = 'La cantidad debe ser ≥ 1';
  }
  if (k === 'chest' && !f.daily_chest_id.trim()) e.daily_chest_id = 'Elegí un cofre';
  if (k === 'freespin' && (!Number.isFinite(f.daily_freespin_count) || f.daily_freespin_count < 1)) {
    e.daily_freespin_count = 'La cantidad de spins debe ser ≥ 1';
  }
  if (k === 'freebet' && (!Number.isFinite(f.daily_freebet_amount) || f.daily_freebet_amount < 0.01)) {
    e.daily_freebet_amount = 'El monto debe ser ≥ 0.01';
  }
  if (k === 'cashback') {
    const p = f.daily_cashback_percent;
    if (!Number.isFinite(p) || p < 0.01 || p > 100) e.daily_cashback_percent = 'El porcentaje debe estar entre 0.01 y 100';
  }
  if (k === 'bonus_deposit') {
    const p = f.daily_bonus_percent;
    if (!Number.isFinite(p) || p < 0.01 || p > 500) e.daily_bonus_percent = 'El match debe estar entre 0.01 y 500';
  }
  return e;
}

function validateMilestoneRowFields(i: number, row: StreakMilestoneFormRow): Record<string, string> {
  const e: Record<string, string> = {};
  const k = row.reward_kind;
  const b = `milestones.${i}` as const;
  if (k === 'none') e[`${b}.reward_kind`] = 'Elegí un tipo de premio o manual';
  if (k === 'xp' && (!Number.isFinite(row.xp_amount) || row.xp_amount < 1)) e[`${b}.xp_amount`] = 'La cantidad de XP debe ser ≥ 1';
  if (k === 'coins') {
    if (!row.coin_id.trim()) e[`${b}.coin_id`] = 'Elegí una moneda';
    if (!Number.isFinite(row.coin_amount) || row.coin_amount < 1) e[`${b}.coin_amount`] = 'La cantidad debe ser ≥ 1';
  }
  if (k === 'chest' && !row.chest_id.trim()) e[`${b}.chest_id`] = 'Elegí un cofre';
  if (k === 'freespin' && (!Number.isFinite(row.freespin_count) || row.freespin_count < 1)) {
    e[`${b}.freespin_count`] = 'La cantidad de spins debe ser ≥ 1';
  }
  if (k === 'freebet' && (!Number.isFinite(row.freebet_amount) || row.freebet_amount < 0.01)) {
    e[`${b}.freebet_amount`] = 'El monto debe ser ≥ 0.01';
  }
  if (k === 'cashback') {
    const p = row.cashback_percent;
    if (!Number.isFinite(p) || p < 0.01 || p > 100) e[`${b}.cashback_percent`] = 'El porcentaje debe estar entre 0.01 y 100';
  }
  if (k === 'bonus_deposit') {
    const p = row.bonus_percent;
    if (!Number.isFinite(p) || p < 0.01 || p > 500) e[`${b}.bonus_percent`] = 'El match debe estar entre 0.01 y 500';
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

/** `nameAvailable`: null = aún no comprobado, no bloquea; false = nombre ocupado */
export function validateStreakEditorForm(f: StreakEditorFormValues, nameAvailable: NameAvailability): Record<string, string> {
  const err: Record<string, string> = {};
  const name = f.name.trim();
  if (name.length < 3 || name.length > 100) err.name = 'El nombre debe tener entre 3 y 100 caracteres';
  if (!f.activity_type) err.activity_type = 'Elegí un tipo de actividad';
  if (!f.timezone.trim()) err.timezone = 'El timezone es obligatorio';
  else if (!isValidIanaTimezone(f.timezone)) err.timezone = 'Timezone IANA inválido';
  if (!f.reset_policy) err.reset_policy = 'Elegí una política de reset';

  if (f.reset_policy === 'grace') {
    const gd = Math.round(f.grace_days_rolling);
    if (gd < 1 || gd > 10) err.grace_days_rolling = 'Entre 1 y 10 días de gracia (ventana 30 días)';
    if (f.grace_after_action === 'lose_days') {
      const maxLose = Math.min(365, maxDayFromMilestones(f.milestones));
      const ld = Math.round(f.grace_lose_days);
      if (ld < 1 || ld > maxLose) err.grace_lose_days = `Entre 1 y ${maxLose} días (según tus hitos)`;
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

/** Texto corto para preview / tablero */
export function rewardPreviewLabel(kind: StreakRewardKind, row: StreakMilestoneFormRow | StreakEditorFormValues, isDaily: boolean): string {
  if (kind === 'none' && isDaily) return 'sin micro-recompensa';
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
    const n = isDaily ? (row as StreakEditorFormValues).daily_freespin_count : (row as StreakMilestoneFormRow).freespin_count;
    return `${n} freespins`;
  }
  if (kind === 'freebet') {
    const a = isDaily ? (row as StreakEditorFormValues).daily_freebet_amount : (row as StreakMilestoneFormRow).freebet_amount;
    const c = isDaily ? (row as StreakEditorFormValues).daily_freebet_currency : (row as StreakMilestoneFormRow).freebet_currency;
    return `${c} ${a} freebet`;
  }
  if (kind === 'cashback') {
    const p = isDaily ? (row as StreakEditorFormValues).daily_cashback_percent : (row as StreakMilestoneFormRow).cashback_percent;
    return `${p}% cashback`;
  }
  if (kind === 'bonus_deposit') {
    const p = isDaily ? (row as StreakEditorFormValues).daily_bonus_percent : (row as StreakMilestoneFormRow).bonus_percent;
    return `${p}% bonus depósito`;
  }
  return kind;
}
