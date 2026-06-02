import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { getApiErrorMessage, getHttpStatus } from '@/api/errors';
import { unwrapData } from '@/api/response';
import {
  actionFromBackend,
  summarizeActions,
  type MissionActionFormValues,
} from '@/features/missions/missionActions';
import {
  backendToForm,
  formToBackendPayload,
  type MissionFormValues,
} from '@/features/missions/missionForm';
import { toast } from '@/stores/toastStore';

export interface AdminMissionListItem {
  id: string;
  name: string;
  description: string;
  code: string;
  type: 'daily' | 'escalonada';
  isActive: boolean;
  status: 'active' | 'archived';
  daily_validity_hours: number;
  actions: MissionActionFormValues[];
  requirementsSummary: string;
  rewardSummary: string;
  updatedAt: string;
  progress: { started: number; completed: number };
}

export interface MissionDetail extends MissionFormValues {
  id: string;
  isActive: boolean;
}

function extractActions(raw: Record<string, unknown>): MissionActionFormValues[] {
  const steps = Array.isArray(raw.steps) ? (raw.steps as Array<Record<string, unknown>>) : [];
  const firstStep = steps[0] ?? {};
  const actionsRaw = Array.isArray(firstStep.actions) ? (firstStep.actions as Array<Record<string, unknown>>) : [];
  return actionsRaw.map((a) => actionFromBackend(a));
}

function buildRewardSummary(raw: Record<string, unknown>): string {
  const steps = Array.isArray(raw.steps) ? (raw.steps as Array<Record<string, unknown>>) : [];
  const firstStep = steps[0] ?? {};
  const rewardsRaw = Array.isArray(firstStep.rewards) ? (firstStep.rewards as Array<Record<string, unknown>>) : [];
  const firstReward = rewardsRaw[0];
  if (!firstReward) return '—';
  const cfg = (firstReward.reward_config as Record<string, unknown>) ?? {};
  const kind = String(cfg.kind ?? 'manual');
  if (kind === 'coins') return `+${cfg.amount ?? 0} ${cfg.currency_code ?? 'coins'}`;
  if (kind === 'chest') return `Cofre ${cfg.chest_type_code ?? ''}`;
  if (['freespin', 'freebet', 'cashback', 'bonus_deposit'].includes(kind)) return `Bonus ${kind}`;
  const desc = String(cfg.description ?? '');
  const xpMatch = desc.match(/^(\d+)\s*XP/i);
  if (xpMatch) return `+${xpMatch[1]} XP`;
  return desc || 'Premio';
}

function missionStatus(raw: Record<string, unknown>): 'active' | 'archived' {
  if (raw.status === 'archived' || raw.archived_at) return 'archived';
  return 'active';
}

function normalizeListItem(raw: Record<string, unknown>): AdminMissionListItem {
  const actions = extractActions(raw);
  const status = missionStatus(raw);
  return {
    id: String(raw.id ?? ''),
    name: String(raw.name ?? ''),
    description: typeof raw.description === 'string' ? raw.description : '',
    code: String(raw.code ?? ''),
    type: raw.type === 'escalonada' ? 'escalonada' : 'daily',
    isActive: status === 'archived' ? false : Boolean(raw.is_active),
    status,
    daily_validity_hours: typeof raw.daily_validity_hours === 'number' ? raw.daily_validity_hours : 24,
    actions,
    requirementsSummary: summarizeActions(actions),
    rewardSummary: buildRewardSummary(raw),
    updatedAt: String(raw.updated_at ?? raw.updatedAt ?? ''),
    progress: {
      started: Number((raw.progress as { started?: number } | undefined)?.started ?? 0),
      completed: Number((raw.progress as { completed?: number } | undefined)?.completed ?? 0),
    },
  };
}

function normalizeDetail(raw: Record<string, unknown>): MissionDetail {
  const form = backendToForm(raw);
  return {
    ...form,
    id: String(raw.id ?? ''),
    isActive: Boolean(raw.is_active),
  };
}

function unwrapMissionList(body: unknown): Array<Record<string, unknown>> {
  const raw = unwrapData<unknown>(body);
  if (Array.isArray(raw)) return raw as Array<Record<string, unknown>>;
  if (raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown[] }).items)) {
    return (raw as { items: Array<Record<string, unknown>> }).items;
  }
  return [];
}

export function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const r = await apiClient.get('/admin/missions');
      return unwrapMissionList(r.data).map(normalizeListItem);
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
      return normalizeDetail(raw);
    },
  });
}

export function useSaveMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
      activate,
    }: {
      id?: string;
      values: MissionFormValues;
      activate?: boolean;
    }): Promise<MissionDetail> => {
      const body = formToBackendPayload(values, { existingCode: values.code || undefined });
      const r = id
        ? await apiClient.put(`/admin/missions/${id}`, body)
        : await apiClient.post('/admin/missions', body);
      let raw = unwrapData<Record<string, unknown>>(r.data);
      const missionId = String(raw.id ?? id ?? '');
      if (activate && missionId) {
        const activeR = await apiClient.post(`/admin/missions/${missionId}/activate`);
        raw = unwrapData<Record<string, unknown>>(activeR.data);
      }
      return normalizeDetail(raw);
    },
    onSuccess: () => {
      toast.success('Misión guardada');
      qc.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar la misión'));
    },
  });
}

export function useSetMissionActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const r = active
        ? await apiClient.post(`/admin/missions/${id}/activate`)
        : await apiClient.post(`/admin/missions/${id}/deactivate`);
      return unwrapData<Record<string, unknown>>(r.data);
    },
    onSuccess: (_data, { active }) => {
      toast.success(active ? 'Misión activada' : 'Misión desactivada');
      qc.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar el estado de la misión'));
    },
  });
}

export function useArchiveMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post(`/admin/missions/${id}/archive`, reason ? { reason } : undefined),
    onSuccess: () => {
      toast.success('Misión archivada');
      qc.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'No se pudo archivar la misión'));
    },
  });
}

export function useDeleteMissionPermanent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/admin/missions/${id}/permanent`),
    onSuccess: () => {
      toast.success('Misión eliminada definitivamente');
      qc.invalidateQueries({ queryKey: ['missions'] });
    },
    onError: (error) => {
      if (getHttpStatus(error) === 409) return;
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar la misión'));
    },
  });
}
