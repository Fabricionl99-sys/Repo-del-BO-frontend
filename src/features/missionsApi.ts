import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { Mission } from '@/types/tier3';

/**
 * Sprint #6 fix — adapter pesado BO ↔ backend.
 *
 * BO model (legacy/MVP1, flat):
 *   { name, description, iconKey, category, type: daily|weekly|monthly|one_time|event,
 *     objective: { event, targetValue, trigger_config }, rewards: [{type, ...}],
 *     availability, targeting, status }
 *
 * Backend model (nested, Sub-etapa 9):
 *   { code, name, type: daily|escalonada, steps: [{ actions: [{config}], rewards: [{reward_type_id, reward_config{kind}}] }],
 *     restrictions, daily_validity_hours, timezone }
 *
 * Strategy MVP (Sprint #7 = redesign):
 *   - SIEMPRE generamos 1 step (mission de tipo daily backend) — el modelo escalonada
 *     requiere ≥2 steps que el BO no expone todavía.
 *   - daily_validity_hours derivado del BO type: daily=24, weekly/monthly/event/one_time=168 (cap backend).
 *   - code autogenerado a partir del slug del name + timestamp.
 *   - Trigger BO → action_type backend según mapping abajo.
 *   - rewards BO (xp/coins/chest/bonus) → reward_config{kind} backend.
 */

const REWARD_KIND_TO_ID: Record<string, number> = {
  freespin: 1,
  freebet: 2,
  cashback: 3,
  bonus_deposit: 4,
  manual: 5,
  chest: 6,
  coins: 7,
  avatar_pack: 8,
  wheel_spin: 9,
};

const TRIGGER_TO_ACTION_TYPE: Record<string, string> = {
  bet_placed: 'cumulative_bets',
  bet_count_total: 'cumulative_bets',
  bet_amount_total: 'bet_amount',
  deposit_first: 'first_deposit',
  deposit_recurring: 'deposit_amount',
  deposit_crypto: 'deposit_amount',
  login_consecutive: 'login',
  kyc_completed: 'verify_kyc',
  email_verified: 'verify_email',
  phone_verified: 'verify_phone',
  play_sports: 'bet_category',
  play_casino: 'bet_category',
  play_live_casino: 'bet_category',
  play_slots: 'bet_category',
  play_poker: 'bet_category',
  play_bingo: 'bet_category',
};

const PLAY_TO_CATEGORY_SLUG: Record<string, string> = {
  play_sports: 'deportes',
  play_casino: 'casino',
  play_live_casino: 'casino_vivo',
  play_slots: 'casino',
  play_poker: 'poker',
  play_bingo: 'casino',
};

const TYPE_TO_VALIDITY_HOURS: Record<string, number> = {
  daily: 24,
  weekly: 168,
  monthly: 168,
  one_time: 168,
  event: 168,
};

function slugify(s: string): string {
  return (
    (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 50) || 'mission'
  );
}

function buildActionConfig(trigger: string, targetValue: number): Record<string, unknown> {
  const actionType = TRIGGER_TO_ACTION_TYPE[trigger] || 'login';
  const cfg: Record<string, unknown> = { type: actionType };
  switch (actionType) {
    case 'bet_amount':
      cfg.amount = Math.max(0.01, targetValue);
      cfg.aggregation_mode = 'cumulative';
      break;
    case 'deposit_amount':
      cfg.amount = Math.max(0.01, targetValue);
      break;
    case 'cumulative_bets':
      cfg.count = Math.max(1, Math.floor(targetValue));
      break;
    case 'bet_category':
      cfg.category_slug = PLAY_TO_CATEGORY_SLUG[trigger] ?? 'casino';
      if (targetValue > 1) cfg.amount = targetValue;
      break;
    case 'first_deposit':
      if (targetValue > 1) cfg.min_amount = targetValue;
      break;
    // login, verify_email, verify_kyc, verify_phone → solo {type}
  }
  return cfg;
}

function buildRewards(
  rewardsBo: Array<Record<string, unknown>> | undefined,
): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  let i = 0;
  for (const r of rewardsBo ?? []) {
    const type = String(r.type ?? '');
    let kind = 'manual';
    let cfg: Record<string, unknown> = {};
    if (type === 'xp') {
      // backend NO tiene reward_type='xp' — el XP se otorga vía rules.
      // Lo mapeamos a manual para que el operador sepa que es un grant XP.
      const amount = Number(r.xpAmount ?? 0);
      kind = 'manual';
      cfg = { kind: 'manual', description: `${amount} XP bonus`, value_usd: 0 };
    } else if (type === 'coins') {
      const amount = Math.max(1, Math.floor(Number(r.coinsAmount ?? 1)));
      const code = String(r.coinId ?? 'main');
      kind = 'coins';
      cfg = { kind: 'coins', amount, currency_code: code };
    } else if (type === 'chest') {
      const chestCode = String(r.chestId ?? '');
      kind = 'chest';
      cfg = { kind: 'chest', chest_type_code: chestCode || 'default_chest' };
    } else if (type === 'bonus') {
      const bonusConfig = (r.bonusConfig as Record<string, unknown>) ?? {};
      if (typeof bonusConfig.bonus_id === 'string') {
        const bt = String(r.bonusType ?? '');
        if (bt === 'free_spins') {
          kind = 'freespin';
          cfg = { kind: 'freespin', bonus_id: String(bonusConfig.bonus_id) };
        } else if (bt === 'free_bet') {
          kind = 'freebet';
          cfg = { kind: 'freebet', bonus_id: String(bonusConfig.bonus_id) };
        } else {
          kind = 'bonus_deposit';
          cfg = { kind: 'bonus_deposit', bonus_id: String(bonusConfig.bonus_id) };
        }
      } else {
        kind = 'manual';
        cfg = {
          kind: 'manual',
          description: String(bonusConfig.description ?? 'Premio bonus'),
          value_usd: 0,
        };
      }
    } else {
      kind = 'manual';
      cfg = { kind: 'manual', description: 'Premio', value_usd: 0 };
    }
    out.push({
      reward_type_id: REWARD_KIND_TO_ID[kind] ?? 5,
      reward_config: cfg,
      display_order: i++,
    });
  }
  if (out.length === 0) {
    out.push({
      reward_type_id: 5,
      reward_config: { kind: 'manual', description: 'Premio por completar misión', value_usd: 0 },
      display_order: 0,
    });
  }
  return out;
}

export function adaptMissionForBackend(
  payload: Partial<Mission>,
): Record<string, unknown> {
  const name = (payload.name ?? '').trim() || 'Misión';
  const objective = (payload.objective ?? {}) as Record<string, unknown>;
  const trigger = String(objective.event ?? 'bet_placed');
  const targetValue = Number(objective.targetValue ?? 1);
  const triggerConfig = (objective.trigger_config as Record<string, unknown>) ?? {};
  // Si el trigger viene con amount_threshold/count_threshold, lo usamos como targetValue.
  const effectiveTarget =
    Number(triggerConfig.amount_threshold ?? triggerConfig.count_threshold ?? targetValue) ||
    targetValue;
  const actionConfig = buildActionConfig(trigger, effectiveTarget);
  const rewards = buildRewards(payload.rewards as Array<Record<string, unknown>> | undefined);

  // code: si la mission ya existe (update), usamos el id como fallback prefix.
  const codeBase = payload.id
    ? `m_${String(payload.id).slice(0, 8)}`
    : `${slugify(name)}_${Date.now().toString(36)}`;
  const code = codeBase.slice(0, 64);

  const boType = String(payload.type ?? 'daily');
  const validityHours = TYPE_TO_VALIDITY_HOURS[boType] ?? 24;

  return {
    type: 'daily', // Backend solo soporta daily (1 step) o escalonada (≥2 steps). MVP: siempre daily.
    code,
    name: name.slice(0, 255),
    description: (payload.description ?? '').trim() || null,
    icon_url: null,
    restrictions: {
      min_level: null,
      vip_only: false,
      new_players_only: false,
    },
    daily_validity_hours: validityHours,
    timezone: 'UTC',
    max_active_simultaneous_override: null,
    steps: [
      {
        name: null,
        description: null,
        actions: [{ config: actionConfig, display_order: 0 }],
        rewards,
      },
    ],
  };
}

/**
 * Normaliza la response del backend al shape rico de `Mission` que el BO espera.
 * Backend devuelve nested steps; el BO renderiza objective + rewards plano.
 * Hacemos un "best-effort" inverse mapping para que la lista/detail no crashee.
 */
function normalizeBackendMission(raw: Record<string, unknown>): Mission {
  const steps = Array.isArray(raw.steps) ? (raw.steps as Array<Record<string, unknown>>) : [];
  const firstStep = steps[0] ?? {};
  const firstAction = Array.isArray((firstStep as { actions?: unknown[] }).actions)
    ? (((firstStep as { actions: Array<Record<string, unknown>> }).actions[0] ?? {}) as Record<string, unknown>)
    : {};
  const actionConfig = (firstAction.config as Record<string, unknown>) ?? {};
  const rewardsRaw = Array.isArray((firstStep as { rewards?: unknown[] }).rewards)
    ? ((firstStep as { rewards: Array<Record<string, unknown>> }).rewards)
    : [];

  const targetValue =
    Number(actionConfig.amount ?? actionConfig.count ?? actionConfig.min_amount ?? 1) || 1;

  const rewards = rewardsRaw.map((r) => {
    const cfg = (r.reward_config as Record<string, unknown>) ?? {};
    const kind = String(cfg.kind ?? 'manual');
    if (kind === 'coins') {
      return {
        type: 'coins' as const,
        coinsAmount: Number(cfg.amount ?? 0),
        coinId: String(cfg.currency_code ?? 'main'),
      };
    }
    if (kind === 'chest') {
      return {
        type: 'chest' as const,
        chestId: String(cfg.chest_type_code ?? ''),
      };
    }
    if (kind === 'freespin' || kind === 'freebet' || kind === 'cashback' || kind === 'bonus_deposit') {
      const bt =
        kind === 'freespin'
          ? 'free_spins'
          : kind === 'freebet'
            ? 'free_bet'
            : 'deposit_match';
      return {
        type: 'bonus' as const,
        bonusType: bt as 'free_spins' | 'free_bet' | 'deposit_match',
        bonusConfig: cfg.bonus_id ? { bonus_id: String(cfg.bonus_id) } : {},
      };
    }
    // manual / fallback
    const desc = String(cfg.description ?? '');
    const xpMatch = desc.match(/^(\d+)\s*XP/i);
    if (xpMatch) {
      return { type: 'xp' as const, xpAmount: Number(xpMatch[1]) };
    }
    return {
      type: 'bonus' as const,
      bonusType: 'deposit_match' as const,
      bonusConfig: { description: desc },
    };
  });

  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: typeof raw.description === 'string' ? raw.description : '',
    iconKey: '🎯',
    category: 'Apuestas',
    type: 'daily',
    objective: {
      type: 'counter',
      event: String(actionConfig.type ?? 'bet_placed'),
      targetValue,
      filters: [],
      trigger_config: {},
    },
    rewards: rewards as Mission['rewards'],
    availability: { alwaysAvailable: false, daysOfWeek: [] } as unknown as Mission['availability'],
    targeting: { allPlayers: true } as unknown as Mission['targeting'],
    status: raw.is_active ? 'active' : 'draft',
    progress: { started: 0, completed: 0 },
    updatedAt: String(raw.updated_at ?? ''),
  };
}

export function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const r = await apiClient.get('/admin/missions');
      const raw = unwrapData<unknown>(r.data);
      const arr = Array.isArray(raw)
        ? (raw as Array<Record<string, unknown>>)
        : Array.isArray((raw as { items?: unknown[] })?.items)
          ? ((raw as { items: unknown[] }).items as Array<Record<string, unknown>>)
          : [];
      return arr.map(normalizeBackendMission);
    },
  });
}

export function useMission(id: string | null) {
  return useQuery({
    queryKey: ['missions', id],
    enabled: !!id,
    queryFn: async () => {
      const r = await apiClient.get(`/admin/missions/${id}`);
      const raw = unwrapData<Record<string, unknown>>(r.data);
      return normalizeBackendMission(raw);
    },
  });
}

export function useSaveMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Mission>): Promise<Mission> => {
      const body = adaptMissionForBackend(payload);
      const r = payload.id
        ? await apiClient.put(`/admin/missions/${payload.id}`, body)
        : await apiClient.post('/admin/missions', body);
      const raw = unwrapData<Record<string, unknown>>(r.data);
      return normalizeBackendMission(raw);
    },
    onSuccess: () => {
      toast.success('misión guardada');
      qc.invalidateQueries({ queryKey: ['missions'] });
    },
  });
}
