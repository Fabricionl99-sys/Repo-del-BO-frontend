import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { toast } from '@/stores/toastStore';
import type { PlayerStreakDetail, PlayerStreakSummary, StreakProgram } from '@/types/streakPrograms';

export function useStreakPrograms() {
  return useQuery({
    queryKey: ['streak-programs'],
    queryFn: () => apiClient.get('/admin/streak-programs').then((r) => r.data as StreakProgram[]),
  });
}

export function useStreakProgram(id: string | null) {
  return useQuery({
    queryKey: ['streak-programs', id],
    enabled: Boolean(id),
    queryFn: () => apiClient.get(`/admin/streak-programs/${id}`).then((r) => r.data as StreakProgram),
  });
}

export function useSaveStreakProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<StreakProgram> & { id?: string }) =>
      payload.id
        ? apiClient.patch(`/admin/streak-programs/${payload.id}`, payload).then((r) => r.data as StreakProgram)
        : apiClient.post('/admin/streak-programs', payload).then((r) => r.data as StreakProgram),
    onSuccess: () => {
      toast.success('Programa de racha guardado');
      qc.invalidateQueries({ queryKey: ['streak-programs'] });
    },
  });
}

export function useActivateStreakProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/streak-programs/${id}/activate`).then((r) => r.data as StreakProgram),
    onSuccess: () => {
      toast.success('Programa activado');
      qc.invalidateQueries({ queryKey: ['streak-programs'] });
    },
  });
}

export function useDeactivateStreakProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/streak-programs/${id}/deactivate`).then((r) => r.data as StreakProgram),
    onSuccess: () => {
      toast.success('Programa desactivado');
      qc.invalidateQueries({ queryKey: ['streak-programs'] });
    },
  });
}

export function useMigrateActiveStreakProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/streak-programs/${id}/migrate-active`).then((r) => r.data as { migrated_players: number }),
    onSuccess: (data) => {
      toast.success(`Migración enviada · ${data.migrated_players} jugadores`);
      qc.invalidateQueries({ queryKey: ['streak-programs'] });
      qc.invalidateQueries({ queryKey: ['player-streaks'] });
    },
  });
}

export function usePlayerStreaks(offset = 0, limit = 50) {
  return useQuery({
    queryKey: ['player-streaks', offset, limit],
    queryFn: () =>
      apiClient
        .get('/admin/player-streaks', { params: { offset, limit } })
        .then(
          (r) =>
            r.data as {
              items: PlayerStreakSummary[];
              total: number;
              limit: number;
              offset: number;
            },
        ),
  });
}

export function usePlayerStreakDetail(playerId: string | null) {
  return useQuery({
    queryKey: ['player-streaks', playerId, 'detail'],
    enabled: Boolean(playerId),
    queryFn: () => apiClient.get(`/admin/player-streaks/${playerId}`).then((r) => r.data as PlayerStreakDetail),
  });
}
