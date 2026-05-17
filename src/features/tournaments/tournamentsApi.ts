import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type {
  Tournament,
  TournamentFiltersQuery,
  TournamentLeaderboardEntry,
  TournamentPayload,
  TournamentRegistrationRecord,
  TournamentRegistrationsQuery,
} from '@/types/tournaments';

function buildTournamentQuery(filters: TournamentFiltersQuery): string {
  const sp = new URLSearchParams();
  if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
  if (filters.competition_type && filters.competition_type !== 'all') {
    sp.set('competition_type', filters.competition_type);
  }
  if (filters.audience_type && filters.audience_type !== 'all') {
    sp.set('audience_type', filters.audience_type);
  }
  if (filters.search) sp.set('search', filters.search);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

function buildRegistrationsQuery(filters: TournamentRegistrationsQuery): string {
  const sp = new URLSearchParams();
  if (filters.tournament_id && filters.tournament_id !== 'all') {
    sp.set('tournament_id', filters.tournament_id);
  }
  if (filters.status && filters.status !== 'all') sp.set('status', filters.status);
  if (filters.player_search) sp.set('player_search', filters.player_search);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export function useTournamentsList(filters: TournamentFiltersQuery = {}) {
  return useQuery({
    queryKey: ['tournaments', filters],
    queryFn: async () => {
      const res = await apiClient.get(`/admin/tournaments${buildTournamentQuery(filters)}`);
      return unwrapData<Tournament[]>(res.data);
    },
  });
}

export function useTournamentItem(id: string | null) {
  return useQuery({
    queryKey: ['tournaments', id],
    enabled: Boolean(id),
    queryFn: () => apiClient.get(`/admin/tournaments/${id}`).then((r) => unwrapData<Tournament>(r.data)),
  });
}

export function useTournamentLeaderboard(tournamentId: string | null) {
  return useQuery({
    queryKey: ['tournament-leaderboard', tournamentId],
    enabled: Boolean(tournamentId),
    queryFn: () =>
      apiClient
        .get(`/admin/tournaments/${tournamentId}/leaderboard`)
        .then((r) => unwrapData<TournamentLeaderboardEntry[]>(r.data)),
  });
}

export function useTournamentRegistrations(filters: TournamentRegistrationsQuery = {}) {
  return useQuery({
    queryKey: ['tournament-registrations', filters],
    queryFn: () =>
      apiClient
        .get(`/admin/tournaments/registrations${buildRegistrationsQuery(filters)}`)
        .then((r) => unwrapData<TournamentRegistrationRecord[]>(r.data)),
  });
}

export function useOperatorGames() {
  return useQuery({
    queryKey: ['operator-games'],
    queryFn: () =>
      apiClient.get('/admin/tournaments/games').then((r) => unwrapData<{ id: string; name: string }[]>(r.data)),
  });
}

export function useSaveTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: TournamentPayload & { id?: string }) =>
      id
        ? apiClient.patch(`/admin/tournaments/${id}`, payload).then((r) => unwrapData<Tournament>(r.data))
        : apiClient.post('/admin/tournaments', payload).then((r) => unwrapData<Tournament>(r.data)),
    onSuccess: () => {
      toast.success('Torneo guardado');
      qc.invalidateQueries({ queryKey: ['tournaments'] });
      qc.invalidateQueries({ queryKey: ['tournament-registrations'] });
    },
  });
}

export function useArchiveTournament() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/tournaments/${id}`),
    onSuccess: () => {
      toast.success('Torneo archivado');
      qc.invalidateQueries({ queryKey: ['tournaments'] });
    },
  });
}

export function useInvalidateRegistration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post(`/admin/tournaments/registrations/${id}/invalidate`)
        .then((r) => unwrapData<TournamentRegistrationRecord>(r.data)),
    onSuccess: () => {
      toast.success('Inscripción invalidada');
      qc.invalidateQueries({ queryKey: ['tournament-registrations'] });
    },
  });
}

export function useUploadTournamentBanner() {
  return useMutation({
    mutationFn: () =>
      apiClient.post('/admin/tournaments/upload-banner').then(
        (r) => r.data as { uploadUrl: string; finalUrl: string },
      ),
  });
}
