import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { trackEvent } from '@/lib/analytics';
import { unwrapData } from '@/api/response';
import { normalizeChestType, normalizeChestTypes } from '@/features/chests/chestTypeShape';
import { toast } from '@/stores/toastStore';
import type {
  ChestGrantManualPayload,
  ChestInventoryQuery,
  ChestPrize,
  ChestPrizePayload,
  ChestType,
  ChestTypeCreatePayload,
  ChestTypeMetadataPayload,
  PlayerChestInventoryItem,
  PlayerSearchResult,
} from '@/types/chests';

/**
 * Sprint #6 fix — adaptador BO → backend para chest type create.
 *   BO `reward_type` (slug)         → backend `reward_type_id` (int)
 *   BO `pity_guaranteed_prize_id`   → backend `pity_guaranteed_prize_index`
 *   + currency_mode/base_amount_usd/values_per_currency defaults (S16)
 *
 * El backend schema (chest.schema.ts) ahora es .passthrough() así que
 * los campos extra del BO no rompen — solo los críticos (reward_type_id,
 * pity_guaranteed_prize_index) deben matchear.
 */
const CHEST_REWARD_TYPE_TO_ID: Record<string, number> = {
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

function adaptChestPrizeForBackend(p: ChestPrizePayload, index = 0): Record<string, unknown> {
  // Backend `reward_config` discriminated union por `.kind`. Solo acepta:
  // freespin, freebet, cashback, bonus_deposit, manual, chest, coins,
  // avatar_pack, wheel_spin. El BO permite 'xp' (que no existe backend) —
  // lo mapeamos a 'manual' con descripción del XP amount.
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
  const safeName = (p.name && p.name.trim()) || `Premio ${index + 1}`;
  const rawType = String(p.reward_type ?? 'manual');
  let kind: string;
  let cfg: Record<string, unknown>;
  if (rawType === 'xp') {
    // BO XP → backend manual con descripción.
    const xpAmount = Number(
      (p.reward_config as unknown as Record<string, unknown>)?.amount ?? 0,
    );
    kind = 'manual';
    cfg = {
      kind: 'manual',
      description: `${xpAmount} XP bonus`,
      value_usd: 0,
    };
  } else if (VALID_KINDS.has(rawType)) {
    kind = rawType;
    cfg = {
      ...(p.reward_config as unknown as Record<string, unknown>),
      kind: rawType,
    };
    if (kind === 'manual') {
      const desc = cfg.description;
      if (typeof desc !== 'string' || !desc.trim()) cfg.description = safeName;
      if (typeof cfg.value_usd !== 'number') cfg.value_usd = 0;
    }
    if (kind === 'coins') {
      if (typeof cfg.amount !== 'number' || (cfg.amount as number) <= 0) cfg.amount = 1;
      if (!cfg.currency_code) cfg.currency_code = 'main';
    }
    if (kind === 'chest' && !cfg.chest_type_code) {
      cfg.chest_type_code = 'default_chest';
    }
    if (kind === 'wheel_spin' && !cfg.wheel_type_code) {
      cfg.wheel_type_code = 'default_wheel';
    }
  } else {
    // Unknown reward_type → fallback manual.
    kind = 'manual';
    cfg = { kind: 'manual', description: safeName, value_usd: 0 };
  }
  return {
    name: safeName,
    image_url: p.image_url || null,
    reward_type_id: CHEST_REWARD_TYPE_TO_ID[kind] ?? 5,
    reward_config: cfg,
    probability_percent: p.probability_percent,
    is_rare: p.is_rare,
    display_order: index,
    // Sub-etapa 16 — currency defaults (BO no las pide aún).
    currency_mode: 'auto_usd',
    base_amount_usd: null,
    values_per_currency: {},
  };
}

function adaptChestForBackend(payload: ChestTypeCreatePayload): Record<string, unknown> {
  // Backend espera INDEX (0-based). BO tiene UUID del prize → buscamos.
  let pityIndex: number | null = null;
  if (payload.has_pity_system && payload.pity_guaranteed_prize_id) {
    const idx = payload.prizes.findIndex(
      (p) => (p as unknown as { id?: string }).id === payload.pity_guaranteed_prize_id,
    );
    if (idx >= 0) pityIndex = idx;
    else {
      const rareIdx = payload.prizes.findIndex((p) => p.is_rare);
      pityIndex = rareIdx >= 0 ? rareIdx : 0;
    }
  }
  return {
    code: payload.code,
    name: payload.name,
    description: payload.description || null,
    image_url: payload.image_url || null,
    color_theme: payload.color_theme || null,
    default_expiration_hours: payload.default_expiration_hours,
    has_pity_system: payload.has_pity_system,
    pity_threshold: payload.has_pity_system ? payload.pity_threshold : null,
    pity_guaranteed_prize_index: pityIndex,
    prizes: payload.prizes.map((p, i) => adaptChestPrizeForBackend(p, i)),
  };
}

export interface ChestTypesFilters {
  status?: 'active' | 'archived' | 'all';
  search?: string;
}

export function useChestTypes(filters: ChestTypesFilters = {}) {
  return useQuery({
    queryKey: ['chest-types', filters],
    queryFn: async () => {
      const sp = new URLSearchParams();
      if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
      if (filters.search) sp.set('search', filters.search);
      const qs = sp.toString();
      const res = await apiClient.get(`/admin/chests/types${qs ? `?${qs}` : ''}`);
      return normalizeChestTypes(unwrapData<ChestType[]>(res.data));
    },
  });
}

export function useChestType(code: string | null) {
  return useQuery({
    queryKey: ['chest-types', code],
    enabled: Boolean(code),
    queryFn: () =>
      apiClient
        .get(`/admin/chests/types/${code}`)
        .then((r) => normalizeChestType(unwrapData<ChestType>(r.data))),
  });
}

export function useCreateChestType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChestTypeCreatePayload) =>
      apiClient
        .post('/admin/chests/types', adaptChestForBackend(payload))
        .then((r) => normalizeChestType(unwrapData<ChestType>(r.data))),
    onSuccess: () => {
      trackEvent('chest_created');
      toast.success('Tipo de cofre creado');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

/**
 * Sprint #6 fix — backend NO tiene PATCH para chest types. Solo CREATE.
 * Para "actualizar" en MVP: recreamos el chest_type con mismo code (backend
 * acepta upsert por code via POST si el viejo está archivado). Stub que NO
 * rompe la UI pero el cambio no persiste — Sprint #7 implementa PATCH real.
 */
export function useUpdateChestType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, ...payload }: ChestTypeMetadataPayload & { code: string }) => {
      // MVP: noop suave para no romper UI. Sprint #7 → PATCH backend real.
      // Reintentamos el create con el mismo code que devuelve 409 → simplemente
      // refrescamos el detail actual.
      void payload;
      const res = await apiClient.get(`/admin/chests/types/${code}`);
      return normalizeChestType(unwrapData<ChestType>(res.data));
    },
    onSuccess: (_data, vars) => {
      toast.warning('Edición pendiente — Sprint #7');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
      qc.invalidateQueries({ queryKey: ['chest-types', vars.code] });
    },
  });
}

/**
 * Sprint #6 fix — backend usa POST /admin/chests/types/:code/archive
 * en vez de DELETE. Pero el routing del backend usa :id (UUID), NO :code,
 * para el archive action. Stub temporal: no llamamos, mostramos warning.
 */
export function useArchiveChestType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_code: string) => {
      // MVP: backend archive expects :id UUID, no :code. Stub.
      void _code;
      return undefined;
    },
    onSuccess: () => {
      toast.warning('Archivar tipo de cofre en desarrollo — Sprint #7');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

/**
 * Sprint #6 stubs — backend MVP NO tiene CRUD individual de prizes (los
 * prizes se setean al crear el chest_type entero). Stubs para no romper UI;
 * Sprint #7 agrega endpoints PATCH/DELETE prize individual.
 */
export function useAddChestPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_p: ChestPrizePayload & { code: string }): Promise<ChestPrize> => {
      void _p;
      return {} as ChestPrize;
    },
    onSuccess: () => {
      toast.warning('Agregar premio individual — Sprint #7');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

export function useUpdateChestPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_p: ChestPrizePayload & { code: string; prizeId: string }): Promise<ChestPrize> => {
      void _p;
      return {} as ChestPrize;
    },
    onSuccess: () => {
      toast.warning('Editar premio individual — Sprint #7');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

export function useDeleteChestPrize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (_p: { code: string; prizeId: string }) => {
      void _p;
      return undefined;
    },
    onSuccess: () => {
      toast.warning('Eliminar premio individual — Sprint #7');
      qc.invalidateQueries({ queryKey: ['chest-types'] });
    },
  });
}

/**
 * Sprint #6 stub — backend MVP NO tiene /admin/chests/inventory. Sprint #7
 * implementa GET con filtros. La tab Inventory muestra vacío sin error.
 */
export function useChestInventory(_params: ChestInventoryQuery = {}) {
  return useQuery({
    queryKey: ['chest-inventory', _params],
    queryFn: async () => ({
      items: [] as PlayerChestInventoryItem[],
      total: 0,
      limit: 50,
      offset: 0,
    }),
  });
}

export function useGrantChestManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChestGrantManualPayload) =>
      apiClient.post('/admin/chests/grant-manual', payload).then((r) => unwrapData<PlayerChestInventoryItem>(r.data)),
    onSuccess: () => {
      toast.success('Cofre entregado correctamente');
      qc.invalidateQueries({ queryKey: ['chest-inventory'] });
    },
  });
}

export function usePlayerSearch(query: string) {
  return useQuery({
    queryKey: ['player-search', query],
    enabled: query.trim().length >= 2,
    queryFn: () =>
      apiClient
        .get(`/admin/players/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => {
          const data = unwrapData<PlayerSearchResult[]>(r.data);
          trackEvent('player_searched');
          return data;
        }),
  });
}

/** Compat dropdown para streak editor y referencias cruzadas. */
export function useChestTypeOptions() {
  return useQuery({
    queryKey: ['chest-types', { status: 'active' }],
    queryFn: async () => {
      const res = await apiClient.get('/admin/chests/types?status=active');
      const types = unwrapData<ChestType[]>(res.data);
      return types.map((t) => ({ code: t.code, name: t.name }));
    },
  });
}
