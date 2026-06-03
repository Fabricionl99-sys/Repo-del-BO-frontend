export const MISSION_ACTION_TYPES = [
  'login',
  'deposit_amount',
  'bet_amount',
  'bet_category',
  'verify_email',
  'verify_kyc',
  'verify_phone',
  'first_deposit',
  'cumulative_bets',
] as const;

export type MissionActionType = (typeof MISSION_ACTION_TYPES)[number];

export const MISSION_ACTION_LABELS: Record<MissionActionType, string> = {
  login: 'Login',
  deposit_amount: 'Depositar monto',
  bet_amount: 'Apostar monto',
  bet_category: 'Apostar en categoría',
  verify_email: 'Email verificado',
  verify_kyc: 'KYC completado',
  verify_phone: 'Teléfono verificado',
  first_deposit: 'Primer depósito',
  cumulative_bets: 'Cantidad de apuestas',
};

export function actionTypeLabel(type: string): string {
  return MISSION_ACTION_LABELS[type as MissionActionType] ?? type;
}

export function actionNeedsNumericField(type: MissionActionType): boolean {
  return type === 'bet_amount' || type === 'deposit_amount';
}

export function actionNeedsCountField(type: MissionActionType): boolean {
  return type === 'cumulative_bets';
}

export function actionNeedsCategory(type: MissionActionType): boolean {
  return type === 'bet_category';
}

export function actionIsBinaryFlag(type: MissionActionType): boolean {
  return ['login', 'verify_email', 'verify_kyc', 'verify_phone'].includes(type);
}

export function actionValueLabel(type: MissionActionType): string | null {
  switch (type) {
    case 'bet_amount':
      return 'Monto a apostar';
    case 'deposit_amount':
      return 'Monto a depositar';
    case 'bet_category':
      return 'Categoría de juego';
    case 'cumulative_bets':
      return 'Cantidad de apuestas';
    case 'first_deposit':
      return 'Monto mínimo del primer depósito (opcional)';
    default:
      return null;
  }
}

export interface MissionActionFormValues {
  type: MissionActionType;
  amount?: number;
  currency_code?: string;
  aggregation_mode?: 'individual' | 'cumulative';
  category_slug?: string;
  min_amount?: number;
  count?: number;
}

export function newMissionAction(type: MissionActionType = 'bet_amount'): MissionActionFormValues {
  return {
    type,
    amount: type === 'bet_amount' || type === 'deposit_amount' ? 100 : undefined,
    currency_code: type === 'bet_amount' || type === 'deposit_amount' ? 'USD' : undefined,
    aggregation_mode: type === 'bet_amount' ? 'cumulative' : undefined,
    category_slug: type === 'bet_category' ? 'casino' : undefined,
    count: type === 'cumulative_bets' ? 10 : undefined,
  };
}

function omitUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

/** Strict discriminated union for backend MissionActionConfigSchema. */
export function buildActionConfig(action: MissionActionFormValues): Record<string, unknown> {
  switch (action.type) {
    case 'bet_amount':
      return omitUndefined({
        type: 'bet_amount',
        amount: Math.max(0.01, Number(action.amount ?? 1)),
        currency_code: action.currency_code?.trim() || undefined,
        aggregation_mode: action.aggregation_mode ?? 'cumulative',
      });
    case 'deposit_amount':
      return omitUndefined({
        type: 'deposit_amount',
        amount: Math.max(0.01, Number(action.amount ?? 1)),
        currency_code: action.currency_code?.trim() || undefined,
      });
    case 'bet_category':
      return omitUndefined({
        type: 'bet_category',
        category_slug: action.category_slug ?? 'casino',
        amount: action.amount && action.amount > 0 ? action.amount : undefined,
        currency_code: action.currency_code?.trim() || undefined,
      });
    case 'cumulative_bets':
      return {
        type: 'cumulative_bets',
        count: Math.max(1, Math.floor(Number(action.count ?? 1))),
      };
    case 'first_deposit':
      return omitUndefined({
        type: 'first_deposit',
        min_amount: action.min_amount && action.min_amount > 0 ? action.min_amount : undefined,
      });
    case 'login':
    case 'verify_email':
    case 'verify_kyc':
    case 'verify_phone':
      return { type: action.type };
    default:
      return { type: action.type };
  }
}

export function actionToBackendStep(
  action: MissionActionFormValues,
  displayOrder: number,
): { config: Record<string, unknown>; display_order: number } {
  return {
    config: buildActionConfig(action),
    display_order: displayOrder,
  };
}

/** @deprecated Use buildActionConfig + actionToBackendStep */
export function actionToBackendPayload(action: MissionActionFormValues): Record<string, unknown> {
  return buildActionConfig(action);
}

export function actionFromBackend(raw: Record<string, unknown>): MissionActionFormValues {
  const nested = (raw.config as Record<string, unknown> | undefined) ?? raw;
  const type = String(nested.type ?? 'login') as MissionActionType;
  return {
    type: MISSION_ACTION_TYPES.includes(type) ? type : 'login',
    amount: typeof nested.amount === 'number' ? nested.amount : undefined,
    currency_code: typeof nested.currency_code === 'string' ? nested.currency_code : 'USD',
    aggregation_mode:
      nested.aggregation_mode === 'individual' || nested.aggregation_mode === 'cumulative'
        ? nested.aggregation_mode
        : undefined,
    category_slug: typeof nested.category_slug === 'string' ? nested.category_slug : undefined,
    min_amount: typeof nested.min_amount === 'number' ? nested.min_amount : undefined,
    count: typeof nested.count === 'number' ? nested.count : undefined,
  };
}

export function summarizeActions(actions: MissionActionFormValues[], categoryNames?: Record<string, string>): string {
  if (!actions.length) return '—';
  return actions
    .map((a) => {
      const label = actionTypeLabel(a.type);
      if (a.type === 'bet_amount' || a.type === 'deposit_amount') {
        const code = a.currency_code?.trim() || 'USD';
        return `${label} ${a.amount ?? '?'} ${code}`;
      }
      if (a.type === 'bet_category') {
        const cat = categoryNames?.[a.category_slug ?? ''] ?? a.category_slug ?? '?';
        return `${label}: ${cat}`;
      }
      if (a.type === 'cumulative_bets') return `${label}: ${a.count ?? '?'}`;
      if (a.type === 'first_deposit' && a.min_amount) return `${label} ≥ ${a.min_amount} USD`;
      return label;
    })
    .join(' · ');
}
