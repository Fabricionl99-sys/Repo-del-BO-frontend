import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { getApiErrorMessage } from '@/api/errors';
import { unwrapData } from '@/api/response';
import { normalizeAdminPlayer } from '@/features/players/normalizePlayer';
import { toast } from '@/stores/toastStore';
import type {
  AdminPlayerDetail,
  AdminPlayerSummary,
  GrantAvatarsManualPayload,
  GrantAvatarsManualResult,
  GrantChestsManualPayload,
  GrantChestsManualResult,
  SetPlayerCurrencyPayload,
} from '@/types/players';

export const playersListKey = ['players', 'list'] as const;
export const playerDetailKey = (id: string | null) => ['players', 'detail', id] as const;

function normalizeList(raw: unknown[]): AdminPlayerSummary[] {
  return raw.map((row) => normalizeAdminPlayer(row as Record<string, unknown>));
}

function normalizeDetail(raw: Record<string, unknown>): AdminPlayerDetail {
  const player = normalizeAdminPlayer((raw.player as Record<string, unknown>) ?? raw);
  return {
    player,
    missions: raw.missions as AdminPlayerDetail['missions'],
    inventory: raw.inventory as AdminPlayerDetail['inventory'],
    shop_products: raw.shop_products as AdminPlayerDetail['shop_products'],
    rankings: raw.rankings as AdminPlayerDetail['rankings'],
    news: raw.news as AdminPlayerDetail['news'],
  };
}

export function usePlayersList() {
  return useQuery({
    queryKey: playersListKey,
    queryFn: () =>
      apiClient
        .get('/admin/preview-widget/players')
        .then((r) => normalizeList(unwrapData<unknown[]>(r.data) ?? [])),
  });
}

export function usePlayerDetail(playerId: string | null) {
  return useQuery({
    queryKey: playerDetailKey(playerId),
    enabled: Boolean(playerId),
    queryFn: () =>
      apiClient
        .get(`/admin/preview-widget/player?player_id=${playerId}`)
        .then((r) => normalizeDetail(unwrapData<Record<string, unknown>>(r.data))),
  });
}

export function useGrantAvatarsManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GrantAvatarsManualPayload) =>
      apiClient
        .post('/admin/avatars/grant-manual', payload)
        .then((r) => unwrapData<GrantAvatarsManualResult>(r.data)),
    onSuccess: (result, vars) => {
      toast.success(`Avatares entregados: ${result.granted} · ya tenía: ${result.alreadyOwned}`);
      qc.invalidateQueries({ queryKey: playersListKey });
      qc.invalidateQueries({ queryKey: playerDetailKey(vars.player_state_id) });
      qc.invalidateQueries({ queryKey: ['preview-widget-players'] });
      qc.invalidateQueries({ queryKey: ['player-widget', vars.player_state_id] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudieron entregar avatares'));
    },
  });
}

export function useGrantChestsManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: GrantChestsManualPayload) => {
      let granted = 0;
      let failed = 0;
      for (const chest_type_code of payload.chest_type_codes) {
        try {
          await apiClient.post('/admin/chests/grant-manual', {
            player_id: payload.player_state_id,
            chest_type_code,
            notes: payload.notes,
          });
          granted += 1;
        } catch {
          failed += 1;
        }
      }
      return { granted, failed } satisfies GrantChestsManualResult;
    },
    onSuccess: (result, vars) => {
      if (result.granted > 0) {
        toast.success(`Cofres entregados: ${result.granted}`);
      }
      if (result.failed > 0) {
        toast.warning(`${result.failed} cofre(s) no se pudieron entregar`);
      }
      qc.invalidateQueries({ queryKey: playersListKey });
      qc.invalidateQueries({ queryKey: playerDetailKey(vars.player_state_id) });
      qc.invalidateQueries({ queryKey: ['preview-widget-players'] });
      qc.invalidateQueries({ queryKey: ['player-widget', vars.player_state_id] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudieron entregar cofres'));
    },
  });
}

export function useSetPlayerCurrency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ playerId, ...payload }: SetPlayerCurrencyPayload & { playerId: string }) =>
      apiClient
        .post(`/admin/players/${playerId}/currency`, payload)
        .then((r) => unwrapData<AdminPlayerSummary>(r.data)),
    onSuccess: (_data, vars) => {
      toast.success('Moneda del jugador actualizada');
      qc.invalidateQueries({ queryKey: playersListKey });
      qc.invalidateQueries({ queryKey: playerDetailKey(vars.playerId) });
      qc.invalidateQueries({ queryKey: ['preview-widget-players'] });
      qc.invalidateQueries({ queryKey: ['player-widget', vars.playerId] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar la moneda'));
    },
  });
}
