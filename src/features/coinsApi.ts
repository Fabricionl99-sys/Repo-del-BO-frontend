import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { getApiErrorMessage } from '@/api/errors';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { Coin, CoinsGlobalRules } from '@/types/coins';

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
  if (payload.caps?.expiryDays != null) body.expiration_days = payload.caps.expiryDays;
  return body;
}

function normalizeBackendCoin(raw: Record<string, unknown>): Coin {
  const deliveryMode: 'auto_xp' | 'manual' =
    raw.earning_mode === 'manual' ? 'manual' : 'auto_xp';
  return {
    id: String(raw.id ?? raw.code ?? ''),
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
  return useQuery({
    queryKey: ['coins', 'global-rules'],
    queryFn: async (): Promise<CoinsGlobalRules> => ({} as CoinsGlobalRules),
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
      toast.success('Moneda guardada');
      qc.invalidateQueries({ queryKey: ['coins'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar la moneda'));
    },
  });
}

/** Activa/desactiva por código de moneda (prod: POST activate / DELETE active/:code). */
export function useSetCoinActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ code, active }: { code: string; active: boolean }) => {
      if (active) {
        await apiClient.post('/admin/currencies/activate', { code });
      } else {
        await apiClient.delete(`/admin/currencies/active/${encodeURIComponent(code)}`);
      }
    },
    onSuccess: (_data, { active }) => {
      toast.success(active ? 'Moneda activada' : 'Moneda desactivada');
      qc.invalidateQueries({ queryKey: ['coins'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar el estado de la moneda'));
    },
  });
}

export function useDeleteCoin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      return apiClient.delete(`/admin/currencies/active/${encodeURIComponent(code)}`);
    },
    onSuccess: () => {
      toast.success('Moneda desactivada');
      qc.invalidateQueries({ queryKey: ['coins'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo desactivar la moneda'));
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
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post('/admin/upload-image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const raw = unwrapData<{ url?: string }>(res.data);
      const url = raw.url ?? (typeof res.data === 'object' && res.data && 'url' in res.data
        ? String((res.data as { url?: string }).url)
        : undefined);
      if (!url) throw new Error('El servidor no devolvió la URL de la imagen');
      return url;
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo subir la imagen'));
    },
  });
}
