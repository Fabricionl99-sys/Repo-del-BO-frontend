import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { Coin, CoinsConfig, CoinsGlobalRules } from '@/types/coins';

/**
 * Sprint #6 fix — backend usa `/admin/currencies` (no `/admin/coins`).
 * Plus: backend usa PUT para edit (no PATCH). No tiene endpoint
 * global-rules ni coins-config — stubs hardcoded.
 *
 * Adapter de payload BO ↔ backend:
 *   BO `symbol`              → backend `code`
 *   BO `imageUrl`            → backend `icon_url`
 *   BO `deliveryMode 'auto_xp'`→ backend `earning_mode 'auto'`
 *   BO `deliveryMode 'manual'`→ backend `earning_mode 'manual'`
 *   BO `xpPerUnit`           → backend `xp_per_unit` (int positive | null)
 *   BO `active`              → backend `is_active`
 *
 * Backend requiere `icon_url` (URL HTTPS) en create. Si BO no sube imagen
 * usamos un placeholder S3 hasta que el operador la edite.
 */
function adaptCoinForBackend(payload: Partial<Coin>): Record<string, unknown> {
  const earning_mode =
    payload.deliveryMode === 'auto_xp' || payload.deliveryMode === undefined ? 'auto' : 'manual';
  const xp_per_unit =
    earning_mode === 'auto' ? payload.xpPerUnit ?? 1 : null;
  // Backend exige icon_url URL válida. Si BO no la dio, usamos un placeholder
  // genérico (operador puede editarla después). Fallback a la URL del logo
  // brand default — coin amarilla minimalista.
  const icon_url =
    payload.imageUrl?.trim() ||
    'https://cdn.social2game.com/defaults/coin-placeholder.png';
  const body: Record<string, unknown> = {
    code: (payload.symbol || payload.name || 'COIN').trim().toUpperCase().slice(0, 50),
    name: (payload.name || payload.symbol || 'Coin').trim().slice(0, 100),
    earning_mode,
    xp_per_unit,
    icon_url,
  };
  if (payload.active !== undefined) body.is_active = payload.active;
  if (payload.caps?.expiryDays != null) body.expiration_days = payload.caps.expiryDays;
  return body;
}

/**
 * Normaliza una currency tal como la devuelve el backend al shape rico
 * que el BO espera (con `p2p`, `caps`, métricas, etc.). El backend MVP
 * NO persiste P2P ni caps — son features Sprint #7. Por ahora rellenamos
 * con defaults seguros para que el BO no crashee.
 */
function normalizeBackendCoin(raw: Record<string, unknown>): Coin {
  const deliveryMode: 'auto_xp' | 'manual' =
    raw.earning_mode === 'manual' ? 'manual' : 'auto_xp';
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? raw.code ?? 'Coin'),
    symbol: String(raw.code ?? ''),
    imageUrl: typeof raw.icon_url === 'string' ? raw.icon_url : undefined,
    emoji: typeof raw.emoji === 'string' ? raw.emoji : undefined,
    deliveryMode,
    xpPerUnit:
      typeof raw.xp_per_unit === 'number' ? (raw.xp_per_unit as number) : null,
    caps: {
      dailyPerPlayer: null,
      weeklyPerPlayer: null,
      monthlyPerPlayer: null,
      totalPerPlayer: null,
      expiryDays:
        typeof raw.expiration_days === 'number'
          ? (raw.expiration_days as number)
          : null,
    },
    p2p: {
      enabled: false,
      maxPerTransfer: null,
      maxDailyPerPlayer: null,
      maxMonthlyPerPlayer: null,
      cooldownMinutes: null,
      minAccountAgeDays: null,
      vipPlusOnly: false,
      commissionPercent: null,
    },
    isDefault: Boolean(raw.is_default),
    active: raw.is_active !== false,
    totalInCirculation: 0,
    emittedThisWeek: 0,
    redeemedThisWeek: 0,
  };
}

export function useCoins() {
  return useQuery({
    queryKey: ['coins'],
    queryFn: async () => {
      const r = await apiClient.get('/admin/currencies');
      const arr = unwrapData<unknown[]>(r.data) ?? [];
      return arr.map((raw) => normalizeBackendCoin(raw as Record<string, unknown>));
    },
  });
}

export function useCoinsGlobalRules() {
  // Backend MVP no tiene este endpoint. Stub con defaults.
  return useQuery({
    queryKey: ['coins', 'global-rules'],
    queryFn: async (): Promise<CoinsGlobalRules> => ({} as CoinsGlobalRules),
  });
}

export function useCoinsConfig() {
  // Backend MVP no tiene este endpoint. Stub con defaults.
  return useQuery({
    queryKey: ['coins-config'],
    queryFn: async (): Promise<CoinsConfig> => ({} as CoinsConfig),
  });
}

export function useSaveCoinsConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CoinsConfig) => {
      // Stub: backend MVP no persiste config global de coins.
      toast.success('Configuración global no soportada — Sprint #7');
      return payload;
    },
    onSuccess: (data) => {
      qc.setQueryData(['coins-config'], data);
    },
  });
}

export function useSaveCoin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Coin>): Promise<Coin> => {
      const body = adaptCoinForBackend(payload);
      const r = payload.id
        ? await apiClient.put(`/admin/currencies/${payload.id}`, body)
        : await apiClient.post('/admin/currencies', body);
      const raw = unwrapData<Record<string, unknown>>(r.data);
      return normalizeBackendCoin(raw);
    },
    onSuccess: () => {
      toast.success('moneda guardada');
      qc.invalidateQueries({ queryKey: ['coins'] });
    },
  });
}

export function useDeleteCoin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // Backend NO tiene DELETE de currencies (solo soft-delete via PUT
      // is_active=false). Hacemos eso.
      return apiClient.put(`/admin/currencies/${id}`, { is_active: false });
    },
    onSuccess: () => {
      toast.success('moneda desactivada');
      qc.invalidateQueries({ queryKey: ['coins'] });
    },
  });
}

export function useSaveGlobalRules() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CoinsGlobalRules) => {
      toast.warning('Reglas globales no soportadas — Sprint #7');
      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['coins', 'global-rules'] });
    },
  });
}

export function useUploadCoinImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      // Backend usa /admin/upload-image genérico (no /admin/coins/upload-image).
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await apiClient.post<{ url: string }>('/admin/upload-image', fd);
      return data.url;
    },
  });
}
