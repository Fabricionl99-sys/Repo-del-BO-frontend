import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { getApiErrorMessage } from '@/api/errors';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { TeamMember } from '@/mocks/data/team';

export type TeamInviteRole = 'admin' | 'member' | 'viewer';

export interface TeamInvitationPayload {
  email: string;
  role: TeamInviteRole;
}

export interface TeamInvitationResult {
  invitation_id: string;
  invitation_url: string;
  email: string;
  role: TeamInviteRole;
  expires_at: string;
}

function getTeamInviteErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) return getApiErrorMessage(error, 'No se pudo enviar la invitación');
  const data = error.response?.data;
  const code =
    data && typeof data === 'object' && 'code' in data
      ? String((data as { code?: unknown }).code)
      : undefined;

  switch (code) {
    case 'role_cannot_invite':
      return 'Solo owner/admin pueden invitar';
    case 'email_already_registered':
      return 'Ese email ya tiene cuenta';
    case 'invitation_already_pending':
      return 'Ya hay invitación activa para ese email. Revocala primero para reenviar.';
    default:
      break;
  }

  return getApiErrorMessage(error, 'No se pudo enviar la invitación');
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ['team', 'members'],
    queryFn: () =>
      apiClient.get('/admin/team/members').then((r) => unwrapData<TeamMember[]>(r.data)),
  });
}

export function useInviteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TeamInvitationPayload) =>
      apiClient
        .post('/admin/team/invitations', payload)
        .then((r) => unwrapData<TeamInvitationResult>(r.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team', 'members'] });
    },
    onError: (error) => {
      toast.error(getTeamInviteErrorMessage(error));
    },
  });
}

/** @deprecated Usar useInviteTeamMember */
export const useInviteMember = useInviteTeamMember;

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/admin/team/invitations/${id}/resend`),
    onSuccess: () => toast.success('Invitación reenviada'),
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiClient.patch(`/admin/team/members/${id}`, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team', 'members'] });
      toast.success('Rol actualizado');
    },
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/team/members/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['team', 'members'] });
      toast.success('Miembro eliminado');
    },
  });
}
