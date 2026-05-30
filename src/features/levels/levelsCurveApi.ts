import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { getApiErrorMessage, isXpEngineModuleForbidden } from '@/api/errors';
import { coerceToList, unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { LevelEntry, LevelsCurve } from '@/types/levels';
import { normalizeXpRequired } from '@/features/levels/levelsCurveUtils';
import {
  normalizeBadgeUrl,
  normalizeLevelName,
} from '@/features/levels/levelBadgeUpload';

export class XpEngineModuleRequiredError extends Error {
  constructor() {
    super('xp_engine_required');
    this.name = 'XpEngineModuleRequiredError';
  }
}

export interface LevelConfig {
  max_level?: number;
  [key: string]: unknown;
}

/** Shape GET/PUT /admin/curve — array directo en el body del PUT. */
export type BackendCurveRow = {
  level_number: number;
  xp_required: number;
  rewards: unknown[];
  name?: string | null;
  badge_url?: string | null;
  is_milestone?: boolean;
};

type BackendCurveRowRaw = {
  level_number?: number;
  level?: number;
  xp_required?: number;
  rewards?: unknown[];
  name?: string | null;
  badge_url?: string | null;
  is_milestone?: boolean;
};

function parseCurveRows(body: unknown): BackendCurveRowRaw[] {
  const unwrapped = unwrapData<unknown>(body);
  if (Array.isArray(unwrapped)) return unwrapped as BackendCurveRowRaw[];
  return coerceToList<BackendCurveRowRaw>(unwrapped, ['levels']);
}

export function backendToLevelsCurve(rows: BackendCurveRowRaw[]): LevelsCurve {
  const levels: LevelEntry[] = rows.map((row, index) => ({
    level: row.level_number ?? row.level ?? index + 1,
    xpRequired: normalizeXpRequired(row.xp_required),
    displayName: normalizeLevelName(row.name),
    badgeImageUrl: normalizeBadgeUrl(row.badge_url),
    milestoneEnabled: row.is_milestone ?? false,
    milestoneUnlock: null,
  }));
  return {
    version: 1,
    totalLevels: levels.length,
    levels,
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };
}

/** level_number auto-derivado del índice (1-based); rewards siempre array. */
export function levelsCurveToBackend(curve: LevelsCurve): BackendCurveRow[] {
  return curve.levels.map((row, index) => ({
    level_number: index + 1,
    xp_required: Math.max(0, Math.round(Number(row.xpRequired) || 0)),
    rewards: [],
    name: normalizeLevelName(row.displayName) ?? null,
    badge_url: normalizeBadgeUrl(row.badgeImageUrl) ?? null,
    is_milestone: row.milestoneEnabled ?? false,
  }));
}

export function useCurve() {
  return useQuery({
    queryKey: ['levels', 'curve'],
    queryFn: async () => {
      try {
        const r = await apiClient.get('/admin/curve');
        const rows = parseCurveRows(r.data);
        if (rows.length === 0) return null;
        return backendToLevelsCurve(rows);
      } catch (error) {
        if (isXpEngineModuleForbidden(error)) throw new XpEngineModuleRequiredError();
        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof XpEngineModuleRequiredError) return false;
      return failureCount < 1;
    },
  });
}

export function useSaveCurve() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (curve: LevelsCurve) => {
      const body = levelsCurveToBackend(curve);
      const r = await apiClient.put('/admin/curve', body);
      const rows = parseCurveRows(r.data);
      return backendToLevelsCurve(rows.length ? rows : body);
    },
    onSuccess: () => {
      toast.success('Curva de niveles guardada');
      qc.invalidateQueries({ queryKey: ['levels'] });
    },
    onError: (error) => {
      if (isXpEngineModuleForbidden(error)) return;
      toast.error(getApiErrorMessage(error, 'No se pudo guardar la curva'));
    },
  });
}

export function useLevelConfig() {
  return useQuery({
    queryKey: ['levels', 'level-config'],
    queryFn: async () => {
      try {
        const r = await apiClient.get('/admin/level-config');
        return unwrapData<LevelConfig>(r.data);
      } catch (error) {
        if (isXpEngineModuleForbidden(error)) throw new XpEngineModuleRequiredError();
        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof XpEngineModuleRequiredError) return false;
      return failureCount < 1;
    },
  });
}

export function useSaveLevelConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (config: LevelConfig) => {
      const r = await apiClient.put('/admin/level-config', config);
      return unwrapData<LevelConfig>(r.data);
    },
    onSuccess: () => {
      toast.success('Configuración de niveles guardada');
      qc.invalidateQueries({ queryKey: ['levels', 'level-config'] });
    },
    onError: () => toast.error('No se pudo guardar la configuración de niveles'),
  });
}
