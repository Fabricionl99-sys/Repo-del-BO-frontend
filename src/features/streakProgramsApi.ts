import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData, unwrapPaginatedList } from '@/api/response';
import { adaptStreakForBackend, normalizeBackendStreak } from '@/features/streakAdapter';
import { toast } from '@/stores/toastStore';
import type {
  PlayerStreakDetail,
  PlayerStreakSummary,
  StreakMigrateActiveResult,
  StreakNameAvailability,
  StreakProgram,
} from '@/types/streakPrograms';

export function useStreakPrograms() {
  return useQuery({
    queryKey: ['streak-programs'],
    queryFn: async () => {
      const r = await apiClient.get('/admin/streak-programs');
      const raw = unwrapData<unknown>(r.data);
      const arr = Array.isArray(raw)
        ? (raw as Array<Record<string, unknown>>)
        : Array.isArray((raw as { items?: unknown[] })?.items)
          ? ((raw as { items: unknown[] }).items as Array<Record<string, unknown>>)
          : [];
      return arr.map(normalizeBackendStreak);
    },
  });
}

export function useStreakProgram(id: string | null) {
  return useQuery({
    queryKey: ['streak-programs', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const r = await apiClient.get(`/admin/streak-programs/${id}`);
      const raw = unwrapData<Record<string, unknown>>(r.data);
      return normalizeBackendStreak(raw);
    },
  });
}

export function useStreakProgramNameAvailable(debouncedName: string, excludeId?: string | null) {
  const trimmed = debouncedName.trim();
  return useQuery({
    queryKey: ['streak-programs', 'name-available', trimmed, excludeId ?? ''],
    enabled: trimmed.length >= 3,
    queryFn: () =>
      apiClient
        .get('/admin/streak-programs/name-available', {
          params: { name: trimmed, exclude_id: excludeId || undefined },
        })
        .then((r) => unwrapData<StreakNameAvailability>(r.data)),
    staleTime: 20_000,
  });
}

export function useSaveStreakProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<StreakProgram> & { id?: string }) => {
      const body = adaptStreakForBackend(payload);
      const r = payload.id
        ? await apiClient.put(`/admin/streak-programs/${payload.id}`, body)
        : await apiClient.post('/admin/streak-programs', body);
      const raw = unwrapData<Record<string, unknown>>(r.data);
      return normalizeBackendStreak(raw);
    },
    onSuccess: () => {
      toast.success('Programa de racha guardado');
      qc.invalidateQueries({ queryKey: ['streak-programs'] });
    },
  });
}

export function useActivateStreakProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/streak-programs/${id}/activate`).then((r) => unwrapData<StreakProgram>(r.data)),
    onSuccess: () => {
      toast.success('Programa activado');
      qc.invalidateQueries({ queryKey: ['streak-programs'] });
    },
  });
}

export function useDeactivateStreakProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.post(`/admin/streak-programs/${id}/deactivate`).then((r) => unwrapData<StreakProgram>(r.data)),
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
      apiClient
        .post(`/admin/streak-programs/${id}/migrate-active`, { reason: 'Actualización de configuración desde BO' })
        .then((r) => unwrapData<StreakMigrateActiveResult>(r.data)),
    onSuccess: (data) => {
      toast.success(data.message || `Migración · ${data.migrated_count} jugadores`);
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
        .then((r) => unwrapPaginatedList<PlayerStreakSummary>(r.data)),
  });
}

export function usePlayerStreakDetail(playerId: string | null) {
  return useQuery({
    queryKey: ['player-streaks', playerId, 'detail'],
    enabled: Boolean(playerId),
    queryFn: () =>
      apiClient.get(`/admin/player-streaks/${playerId}`).then((r) => unwrapData<PlayerStreakDetail>(r.data)),
  });
}
