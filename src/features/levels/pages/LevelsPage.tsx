import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import { validateLevelBadgeFile, normalizeBadgeUrl } from '@/features/levels/levelBadgeUpload';
import {
  useCurve,
  useSaveCurve,
  XpEngineModuleRequiredError,
} from '@/features/levels/levelsCurveApi';
import { normalizeXpRequired, validateLevelsMonotonicity } from '@/features/levels/levelsCurveUtils';
import { toast } from '@/stores/toastStore';
import type { LevelEntry, LevelsCurve } from '@/types/levels';
import { AddLevelButton, LevelRow } from '../components/LevelRow';

function suggestNextXp(levels: LevelEntry[]): number {
  if (levels.length === 0) return 100;
  const last = normalizeXpRequired(levels[levels.length - 1].xpRequired);
  const prev = levels.length > 1 ? normalizeXpRequired(levels[levels.length - 2].xpRequired) : null;
  const diff = prev !== null ? last - prev : last;
  const bump = Math.max(5000, Math.round(diff * 1.15));
  return last + bump;
}

function validateCurve(levels: LevelEntry[]): string | null {
  return validateLevelsMonotonicity(levels);
}

function XpEngineGate() {
  return (
    <EmptyState
      title="Activá Motor de XP"
      description="Activá el módulo XP Engine ($1,000/mes) en Módulos para configurar la curva de niveles."
      action={
        <Link to="/modulos">
          <Button variant="primary">Ir a Módulos</Button>
        </Link>
      }
    />
  );
}

export default function LevelsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const q = useCurve();
  const save = useSaveCurve();
  const [draft, setDraft] = useState<LevelsCurve | null>(null);

  const current = draft ?? q.data ?? null;
  const invalidMsg = useMemo(() => (current ? validateCurve(current.levels) : null), [current]);

  const uploadBadge = async (file: File): Promise<string | null> => {
    try {
      const validation = await validateLevelBadgeFile(file);
      if (!validation.ok) {
        toast.error(validation.error ?? 'Imagen inválida');
        return null;
      }
      if (validation.warning) {
        toast.warning(validation.warning);
      }
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiClient.post('/admin/storage/upload', fd);
      const raw = unwrapData<{ url?: string; public_url?: string }>(res.data);
      const url = normalizeBadgeUrl(raw.url ?? raw.public_url);
      if (!url) {
        toast.error('La URL de la insignia debe ser HTTPS');
        return null;
      }
      return url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al subir');
      return null;
    }
  };

  const setLevels = (levels: LevelEntry[]) => {
    if (!current) return;
    setDraft({
      ...current,
      levels,
      totalLevels: levels.length,
    });
  };

  const addLevel = () => {
    if (!current) {
      setDraft({
        version: 1,
        totalLevels: 1,
        levels: [
          {
            level: 1,
            xpRequired: 0,
            milestoneEnabled: false,
            milestoneUnlock: null,
          },
        ],
        updatedAt: new Date().toISOString(),
        publishedAt: null,
      });
      return;
    }
    const xp = suggestNextXp(current.levels);
    setLevels([
      ...current.levels,
      {
        level: current.levels.length + 1,
        xpRequired: xp,
        displayName: undefined,
        badgeImageUrl: undefined,
        milestoneEnabled: false,
        milestoneUnlock: null,
      },
    ]);
  };

  const removeLevel = (index: number) => {
    if (!current || current.levels.length <= 1) return;
    const next = current.levels.filter((_, i) => i !== index).map((row, i) => ({ ...row, level: i + 1 }));
    setLevels(next);
  };

  if (mock === 'empty') {
    return (
      <>
        <PageHeader title="Curva de niveles" subtitle="Configurá niveles y XP requerido por nivel." />
        <EmptyState
          title="No hay curva configurada"
          description="Creá tu primera curva de niveles para el operador."
          action={<Button variant="primary" onClick={addLevel}>Crear primera curva</Button>}
        />
      </>
    );
  }

  if (mock === 'loading' || q.isLoading) return <Loading label="Cargando curva..." />;

  if (q.error instanceof XpEngineModuleRequiredError) {
    return (
      <>
        <PageHeader title="Curva de niveles" subtitle="Configurá niveles y XP requerido por nivel." />
        <XpEngineGate />
      </>
    );
  }

  if (mock === 'error' || q.isError) {
    return <ErrorState onRetry={() => q.refetch()} />;
  }

  if (!current) {
    return (
      <>
        <PageHeader title="Curva de niveles" subtitle="Configurá niveles y XP requerido por nivel." />
        <EmptyState
          title="Sin curva configurada"
          description="Todavía no hay niveles definidos para este operador."
          action={<Button variant="primary" onClick={addLevel}>Crear primera curva</Button>}
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Curva de niveles"
        subtitle="Configurá los niveles que tendrán tus jugadores. Cada nivel requiere XP acumulado para desbloquearse."
      />

      <div className="card overflow-x-auto p-5">
        <p className="mb-4 text-[14px] text-text-secondary">
          Nivel inicial — el jugador arranca con 0 XP. Cada fila es un nivel; el número se asigna automáticamente según el
          orden.
        </p>
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border-default text-[13px] font-semibold uppercase tracking-wide text-text-tertiary">
              <th className="pb-3 pr-2">Nivel</th>
              <th className="pb-3 pr-2">Nombre opc.</th>
              <th className="pb-3 pr-2">Insignia</th>
              <th
                className="pb-3 pr-2"
                title="XP acumulado total para alcanzar este nivel. Nivel 1 = punto de partida (XP=0). Nivel 2 = 100 XP acumulados, etc."
              >
                XP necesario
              </th>
              <th className="pb-3">Milestone</th>
            </tr>
          </thead>
          <tbody>
            {current.levels.map((row, index) => (
              <LevelRow
                key={`level-row-${index}`}
                displayLevel={index + 1}
                row={row}
                prevXp={index === 0 ? null : current.levels[index - 1].xpRequired}
                canDelete={current.levels.length > 1}
                onPickBadge={uploadBadge}
                onDelete={() => removeLevel(index)}
                onChange={(next) => {
                  const copy = [...current.levels];
                  copy[index] = { ...next, xpRequired: normalizeXpRequired(next.xpRequired) };
                  setLevels(copy);
                }}
              />
            ))}
          </tbody>
        </table>
        <AddLevelButton nextLevel={current.levels.length + 1} onClick={addLevel} />
        {invalidMsg ? <p className="mt-3 text-[15px] text-danger">{invalidMsg}</p> : null}
      </div>

      <div className="sticky bottom-0 z-20 -mx-7 mt-8 flex items-center justify-between border-t border-border-default bg-bg-primary px-7 py-4">
        <button
          type="button"
          onClick={() => setDraft(null)}
          className="text-[15px] text-text-secondary hover:text-text-primary"
        >
          Descartar cambios
        </button>
        <Button
          variant="primary"
          loading={save.isPending}
          disabled={Boolean(invalidMsg)}
          onClick={() => {
            if (!current || invalidMsg) return;
            const normalized = {
              ...current,
              levels: current.levels.map((row, i) => ({ ...row, level: i + 1 })),
              totalLevels: current.levels.length,
            };
            save.mutate(normalized, { onSuccess: () => setDraft(null) });
          }}
        >
          Guardar curva
        </Button>
      </div>
    </>
  );
}
