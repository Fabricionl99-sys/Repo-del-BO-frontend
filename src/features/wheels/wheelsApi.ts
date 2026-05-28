import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData, unwrapPaginatedList } from '@/api/response';
import { toast } from '@/stores/toastStore';
import { buildBackendBonusRewardConfig } from '@/lib/bonusRewardConfig';
import { extractWheelPrizes } from '@/features/wheels/wheelDetailShape';
import type {
  SpinHistoryEntry,
  SpinHistoryQuery,
  WheelArchivePayload,
  WheelCatalogResponse,
  WheelGrantManualPayload,
  WheelManualGrantHistoryItem,
  WheelPrize,
  WheelPrizePayload,
  WheelType,
  WheelTypeCreatePayload,
} from '@/types/wheels';

/**
 * Sprint #6 fix: el BO tiene field names legacy distintos al backend.
 *   BO `pity_enabled`                  → backend `has_pity_system`
 *   BO `show_probabilities_to_players` → backend `show_probabilities`
 *   BO `archive_mode_default: 'normal'` → backend `'preserve'` (no existe 'normal')
 *   BO `pity_guaranteed_prize_id` (UUID) → backend `pity_guaranteed_prize_index` (int)
 *
 * El backend espera el INDEX (0-based) del array prizes — el service
 * resuelve al UUID post-INSERT. El BO conoce el prize_id directo, así
 * que buscamos el índice en el array `prizes` por name (no hay id
 * todavía si el prize es nuevo) o lo dejamos en 0 como fallback.
 *
 * Los prizes también van mapeados: BO usa `reward_type` (slug), backend
 * `reward_type_id` (int). + currency_mode defaults (sub-etapa 16).
 */
const REWARD_TYPE_TO_ID: Record<string, number> = {
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

function adaptPrizeForBackend(p: WheelPrizePayload, index = 0): Record<string, unknown> {
  // Backend `reward_config` es un discriminated union por `.kind`. Solo
  // acepta: freespin, freebet, cashback, bonus_deposit, manual, chest,
  // coins, avatar_pack, wheel_spin. El BO permite 'xp' (que no existe
  // backend) — lo mapeamos a 'manual' con descripción del XP amount.
  const VALID_KINDS = new Set([
    'freespin',
    'freebet',
    'cashback',
    'bonus_deposit',
    'manual',
    'chest',
    'coins',
    'avatar_pack',
    'wheel_spin',
  ]);
  // Backend exige name >= 1 char. Si el BO no validó (form skipped),
  // usamos fallback "Premio N" para que no crashee.
  const safeName = (p.name && p.name.trim()) || `Premio ${index + 1}`;
  const rawType = String(p.reward_type ?? 'manual');
  let kind: string;
  let cfg: Record<string, unknown>;
  if (rawType === 'xp') {
    const xpAmount = Number(
      (p.reward_config as unknown as Record<string, unknown>)?.amount ?? 0,
    );
    kind = 'manual';
    cfg = { kind: 'manual', description: `${xpAmount} XP bonus`, value_usd: 0 };
  } else if (VALID_KINDS.has(rawType)) {
    kind = rawType;
    if (['freespin', 'freebet', 'cashback', 'bonus_deposit'].includes(kind)) {
      cfg = buildBackendBonusRewardConfig(
        kind as 'freespin' | 'freebet' | 'cashback' | 'bonus_deposit',
        (p.reward_config as unknown as Record<string, unknown>) ?? {},
      );
    } else {
      cfg = {
        ...(p.reward_config as unknown as Record<string, unknown>),
        kind: rawType,
      };
    }
    if (kind === 'manual') {
      const desc = cfg.description;
      if (typeof desc !== 'string' || !desc.trim()) cfg.description = safeName;
      if (typeof cfg.value_usd !== 'number') cfg.value_usd = 0;
    }
    if (kind === 'coins') {
      if (typeof cfg.amount !== 'number' || (cfg.amount as number) <= 0) cfg.amount = 1;
      if (!cfg.currency_code) cfg.currency_code = 'main';
    }
    if (kind === 'chest' && !cfg.chest_type_code) cfg.chest_type_code = 'default_chest';
    if (kind === 'wheel_spin' && !cfg.wheel_type_code) cfg.wheel_type_code = 'default_wheel';
  } else {
    kind = 'manual';
    cfg = { kind: 'manual', description: safeName, value_usd: 0 };
  }
  return {
    name: safeName,
    image_url: p.image_url || null,
    reward_type_id: REWARD_TYPE_TO_ID[kind] ?? 5,
    reward_config: cfg,
    probability_percent: p.probability_percent,
    color_theme: p.color_theme,
    is_rare: p.is_rare,
    display_order: p.display_order ?? index,
    // Sub-etapa 16 — currency mode defaults (BO no las pide aún).
    currency_mode: 'auto_usd',
    base_amount_usd: null,
    values_per_currency: {},
  };
}

/**
 * Sprint #6 normalize: backend devuelve shape distinto al que el BO espera.
 *   backend `has_pity_system`           → BO `pity_enabled`
 *   backend `show_probabilities`        → BO `show_probabilities_to_players`
 *   backend `archive_mode_default: 'preserve'|'emergency'` → BO `'normal'|'emergency'`
 *   backend `pity_guaranteed_prize_id`  → idem (UUID, ya viene en detail)
 *   backend NO devuelve: `color_theme` (wheel-level), `is_active` mismo nombre,
 *     `occasions`, `prizes` (en list response — solo en detail).
 *   backend `is_active=false + archived_at=null` → BO `status='active'` (draft)
 *   backend `archived_at != null` → BO `status='archived'`
 *   backend `spin_expiration_hours: int|null` → BO `spins_expire: bool`
 */
const REWARD_ID_TO_TYPE: Record<number, string> = {
  1: 'freespin',
  2: 'freebet',
  3: 'cashback',
  4: 'bonus_deposit',
  5: 'manual',
  6: 'chest',
  7: 'coins',
  8: 'avatar_pack',
  9: 'wheel_spin',
};

function normalizeBackendPrize(raw: Record<string, unknown>): WheelPrize {
  const rewardTypeId = Number(raw.reward_type_id ?? 5);
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    image_url: typeof raw.image_url === 'string' ? raw.image_url : '',
    reward_type: (REWARD_ID_TO_TYPE[rewardTypeId] ?? 'manual') as WheelPrize['reward_type'],
    reward_config:
      typeof raw.reward_config === 'object' && raw.reward_config !== null
        ? (raw.reward_config as Record<string, unknown>)
        : {},
    probability_percent: Number(raw.probability_percent ?? 0),
    color_theme: typeof raw.color_theme === 'string' ? raw.color_theme : '#FFD700',
    is_rare: Boolean(raw.is_rare),
    display_order: Number(raw.display_order ?? 0),
  };
}

function normalizeBackendWheel(raw: Record<string, unknown>): WheelType {
  const archivedAt = raw.archived_at;
  const status: 'active' | 'archived' = archivedAt ? 'archived' : 'active';
  const archive = raw.archive_mode_default;
  const archiveModeDefault: 'normal' | 'emergency' =
    archive === 'emergency' ? 'emergency' : 'normal';
  const spinExpirationHours =
    typeof raw.spin_expiration_hours === 'number' ? (raw.spin_expiration_hours as number) : null;
  const prizesRaw = extractWheelPrizes(raw);
  return {
    code: String(raw.code ?? ''),
    name: String(raw.name ?? ''),
    description: typeof raw.description === 'string' ? raw.description : '',
    image_url: typeof raw.image_url === 'string' ? raw.image_url : '',
    center_logo_url:
      typeof raw.center_logo_url === 'string'
        ? raw.center_logo_url
        : typeof raw.center_logo === 'string'
          ? raw.center_logo
          : '',
    color_theme: typeof raw.color_theme === 'string' ? raw.color_theme : '#FFD700',
    is_active: Boolean(raw.is_active),
    pity_enabled: Boolean(raw.has_pity_system),
    pity_threshold:
      typeof raw.pity_threshold === 'number' ? (raw.pity_threshold as number) : null,
    pity_guaranteed_prize_id:
      typeof raw.pity_guaranteed_prize_id === 'string'
        ? (raw.pity_guaranteed_prize_id as string)
        : null,
    show_probabilities_to_players: Boolean(raw.show_probabilities),
    daily_cooldown_mode:
      raw.daily_cooldown_mode === 'hours_exact' ? 'hours_exact' : 'utc_reset',
    daily_cooldown_hours:
      typeof raw.daily_cooldown_hours === 'number' ? (raw.daily_cooldown_hours as number) : 24,
    spins_expire: spinExpirationHours != null,
    spin_expiration_hours: spinExpirationHours,
    archive_mode_default: archiveModeDefault,
    prizes: prizesRaw.map(normalizeBackendPrize),
    occasions: [],
    status,
    created_at: String(raw.created_at ?? ''),
    updated_at: String(raw.updated_at ?? ''),
  };
}

function normalizeBackendCatalog(arr: Array<Record<string, unknown>>): WheelCatalogResponse {
  const items = arr.map(normalizeBackendWheel);
  return {
    items,
    stats: {
      total_active: items.filter((w) => w.status === 'active').length,
      total_spins_granted: 0,
      top_wheel_code: items[0]?.code ?? null,
      top_wheel_name: items[0]?.name ?? null,
    },
  };
}

function adaptWheelForBackend(payload: WheelTypeCreatePayload): Record<string, unknown> {
  // Backend quiere INDEX (0-based) del prize garantizado por pity.
  // BO tiene UUID — buscamos por id en el array prizes. Si no se encuentra
  // (prize nuevo), fallback al primer prize raro, o 0.
  let pityIndex: number | null = null;
  if (payload.pity_enabled && payload.pity_guaranteed_prize_id) {
    const idx = payload.prizes.findIndex(
      (p) => (p as unknown as { id?: string }).id === payload.pity_guaranteed_prize_id,
    );
    if (idx >= 0) pityIndex = idx;
    else {
      // Fallback: primer prize is_rare
      const rareIdx = payload.prizes.findIndex((p) => p.is_rare);
      pityIndex = rareIdx >= 0 ? rareIdx : 0;
    }
  }
  return {
    code: payload.code,
    name: payload.name,
    description: payload.description || null,
    image_url: payload.image_url || null,
    center_logo_url: payload.center_logo_url || null,
    show_probabilities: payload.show_probabilities_to_players,
    has_pity_system: payload.pity_enabled,
    pity_threshold: payload.pity_enabled ? payload.pity_threshold : null,
    pity_guaranteed_prize_index: pityIndex,
    spin_expiration_hours: payload.spin_expiration_hours,
    daily_cooldown_mode: payload.daily_cooldown_mode,
    daily_cooldown_hours: payload.daily_cooldown_hours,
    archive_mode_default:
      payload.archive_mode_default === 'normal' ? 'preserve' : payload.archive_mode_default,
    prizes: payload.prizes.map((p, i) => adaptPrizeForBackend(p, i)),
  };
}

export interface WheelsFilters {
  status?: 'active' | 'archived' | 'all';
  search?: string;
}

export function useWheelsCatalog(filters: WheelsFilters = {}) {
  return useQuery({
    queryKey: ['wheels', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
      if (filters.search) sp.set('search', filters.search);
      const qs = sp.toString();
      const res = await apiClient.get(`/admin/wheels/types${qs ? `?${qs}` : ''}`);
      // Backend devuelve array directo; normalizamos a { items, stats }.
      const raw = unwrapData<unknown>(res.data);
      const arr = Array.isArray(raw)
        ? (raw as Array<Record<string, unknown>>)
        : Array.isArray((raw as { items?: unknown[] })?.items)
          ? ((raw as { items: unknown[] }).items as Array<Record<string, unknown>>)
          : [];
      return normalizeBackendCatalog(arr);
    },
  });
}

export function useWheel(code: string | null) {
  return useQuery({
    queryKey: ['wheels', code],
    enabled: Boolean(code),
    queryFn: async () => {
      const r = await apiClient.get(`/admin/wheels/types/${code}`);
      const raw = unwrapData<Record<string, unknown>>(r.data);
      return normalizeBackendWheel(raw);
    },
  });
}

export function useWheelOptions() {
  return useQuery({
    queryKey: ['wheels', 'options'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/wheels/types?status=active');
      const raw = unwrapData<unknown>(res.data);
      const arr = Array.isArray(raw)
        ? (raw as Array<Record<string, unknown>>)
        : Array.isArray((raw as { items?: unknown[] })?.items)
          ? ((raw as { items: unknown[] }).items as Array<Record<string, unknown>>)
          : [];
      return arr.map((w) => ({
        code: String(w.code ?? ''),
        name: String(w.name ?? ''),
      }));
    },
  });
}

export function useCreateWheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: WheelTypeCreatePayload) => {
      const r = await apiClient.post('/admin/wheels/types', adaptWheelForBackend(payload));
      const raw = unwrapData<Record<string, unknown>>(r.data);
      return normalizeBackendWheel(raw);
    },
    onSuccess: () => {
      toast.success('Rueda creada');
      qc.invalidateQueries({ queryKey: ['wheels'] });
    },
  });
}

export function useUpdateWheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, ...payload }: Partial<WheelTypeCreatePayload> & { code: string }) => {
      const adapted = (payload as WheelTypeCreatePayload).prizes
        ? adaptWheelForBackend(payload as WheelTypeCreatePayload)
        : (payload as Record<string, unknown>);
      const r = await apiClient.patch(`/admin/wheels/types/${code}`, adapted);
      const raw = unwrapData<Record<string, unknown>>(r.data);
      return normalizeBackendWheel(raw);
    },
    onSuccess: (_data, vars) => {
      toast.success('Rueda actualizada');
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheels', vars.code] });
    },
  });
}

export function useArchiveWheel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }: WheelArchivePayload & { code: string }) =>
      apiClient.delete(`/admin/wheels/types/${code}`, { data: payload }),
    onSuccess: () => {
      toast.success('Rueda archivada');
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheels', 'spin-history'] });
    },
  });
}

export function useAddWheelPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...payload }: WheelPrizePayload & { code: string }) =>
      apiClient
        .post(`/admin/wheels/types/${code}/prizes`, payload)
        .then((r) => unwrapData<WheelPrize>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Premio agregado');
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheels', vars.code] });
    },
  });
}

export function useUpdateWheelPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      code,
      prizeId,
      ...payload
    }: WheelPrizePayload & { code: string; prizeId: string }) =>
      apiClient
        .patch(`/admin/wheels/types/${code}/prizes/${prizeId}`, payload)
        .then((r) => unwrapData<WheelPrize>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Premio actualizado');
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheels', vars.code] });
    },
  });
}

export function useDeleteWheelPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, prizeId }: { code: string; prizeId: string }) =>
      apiClient.delete(`/admin/wheels/types/${code}/prizes/${prizeId}`),
    onSuccess: (_data, vars) => {
      toast.success('Premio eliminado');
      qc.invalidateQueries({ queryKey: ['wheels'] });
      qc.invalidateQueries({ queryKey: ['wheels', vars.code] });
    },
  });
}

export function useSpinHistory(filters: SpinHistoryQuery = {}) {
  return useQuery({
    queryKey: ['wheels', 'spin-history', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.wheel_code) sp.set('wheel_code', filters.wheel_code);
      if (filters.delivery_status) sp.set('delivery_status', filters.delivery_status);
      if (filters.player_search) sp.set('player_search', filters.player_search);
      if (filters.from) sp.set('from', filters.from);
      if (filters.to) sp.set('to', filters.to);
      if (filters.limit != null) sp.set('limit', String(filters.limit));
      if (filters.offset != null) sp.set('offset', String(filters.offset));
      const res = await apiClient.get(`/admin/wheels/spin-history?${sp.toString()}`);
      return unwrapPaginatedList<SpinHistoryEntry>(res.data);
    },
  });
}

export function useManualGrantHistory(_limit = 20) {
  // Sprint #6 stub — backend MVP no expone /admin/wheels/inventory.
  // El widget jugador SÍ tiene /v1/player/wheels/inventory. Para el panel
  // admin, este endpoint queda para Sprint #7 (history view de grants
  // manuales).
  return useQuery({
    queryKey: ['wheels', 'manual-grants', _limit],
    queryFn: async (): Promise<WheelManualGrantHistoryItem[]> => [],
  });
}

export function useGrantWheelManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WheelGrantManualPayload) =>
      apiClient
        .post('/admin/wheels/grant-manual', payload)
        .then((r) => unwrapData<WheelManualGrantHistoryItem>(r.data)),
    onSuccess: () => {
      toast.success('Spins asignados');
      qc.invalidateQueries({ queryKey: ['wheels', 'manual-grants'] });
      qc.invalidateQueries({ queryKey: ['wheels'] });
    },
  });
}

export function useRetrySpinDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (spinId: string) =>
      apiClient
        .post(`/admin/wheels/spin-history/${spinId}/retry-delivery`)
        .then((r) => unwrapData<SpinHistoryEntry>(r.data)),
    onSuccess: () => {
      toast.success('Reintento de entrega iniciado');
      qc.invalidateQueries({ queryKey: ['wheels', 'spin-history'] });
    },
  });
}

export function usePlayerSearch(q: string) {
  return useQuery({
    queryKey: ['players', 'search', q],
    enabled: q.length >= 2,
    queryFn: () =>
      apiClient
        .get(`/admin/players/search?q=${encodeURIComponent(q)}`)
        .then((r) => unwrapData<{ player_id: string; player_handle: string }[]>(r.data)),
  });
}
