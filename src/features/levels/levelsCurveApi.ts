import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { apiClient } from '@/api/client';
import { isXpEngineModuleForbidden } from '@/api/errors';
import { unwrapData } from '@/api/response';
import { toast } from '@/stores/toastStore';
import type { LevelEntry, LevelsCurve } from '@/types/levels';

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

type BackendCurveRow = { level: number; xp_required: number };

function backendToLevelsCurve(rows: BackendCurveRow[]): LevelsCurve {
  const levels: LevelEntry[] = rows.map((row) => ({
    level: row.level,
    xpRequired: row.xp_required,
    displayName: undefined,
    badgeImageUrl: undefined,
    milestoneEnabled: false,
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

function levelsCurveToBackend(curve: LevelsCurve): BackendCurveRow[] {
  return curve.levels.map((row) => ({
    level: row.level,
    xp_required: row.xpRequired,
  }));
}

function parseCurveBody(body: unknown): BackendCurveRow[] {
  const unwrapped = unwrapData<unknown>(body);
  if (Array.isArray(unwrapped)) {
    return unwrapped as BackendCurveRow[];
  }
  if (unwrapped && typeof unwrapped === 'object') {
    const levels = (unwrapped as { levels?: unknown }).levels;
    if (Array.isArray(levels)) return levels as BackendCurveRow[];
  }
  return [];
}

export function useCurve() {
  return useQuery({
    queryKey: ['levels', 'curve'],
    queryFn: async () => {
      try {
        const r = await apiClient.get('/admin/curve');
        const rows = parseCurveBody(r.data);
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
      const body = { levels: levelsCurveToBackend(curve) };
      const r = await apiClient.put('/admin/curve', body);
      const rows = parseCurveBody(r.data);
      return backendToLevelsCurve(rows.length ? rows : levelsCurveToBackend(curve));
    },
    onSuccess: () => {
      toast.success('Curva de niveles guardada');
      qc.invalidateQueries({ queryKey: ['levels'] });
    },
    onError: (error) => {
      if (isXpEngineModuleForbidden(error)) return;
      if (isAxiosError(error)) {
        const msg =
          typeof error.response?.data === 'object' &&
          error.response.data &&
          'detail' in error.response.data
            ? String((error.response.data as { detail: string }).detail)
            : 'No se pudo guardar la curva';
        toast.error(msg);
      }
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
