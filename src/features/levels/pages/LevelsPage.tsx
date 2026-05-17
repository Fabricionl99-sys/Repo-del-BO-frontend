import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StickyBottomBar } from '@/features/rules/components/RuleBlocks';
import { useCurve, usePublishCurve, useUpdateDraft } from '@/features/levelsApi';
import type { LevelEntry, LevelsCurve } from '@/types/levels';
import { AddLevelButton, LevelRow } from '../components/LevelRow';
import { apiClient } from '@/api/client';

function suggestNextXp(levels: LevelEntry[]): number {
  if (levels.length === 0) return 100;
  const last = levels[levels.length - 1];
  const prev = levels.length > 1 ? levels[levels.length - 2] : null;
  const diff = prev ? last.xpRequired - prev.xpRequired : last.xpRequired;
  const bump = Math.max(5000, Math.round(diff * 1.15));
  return last.xpRequired + bump;
}

function validateCurve(levels: LevelEntry[]): string | null {
  for (let i = 1; i < levels.length; i++) {
    if (levels[i].xpRequired <= levels[i - 1].xpRequired) {
      return `El nivel ${levels[i].level} debe requerir más XP que el nivel ${levels[i - 1].level}.`;
    }
  }
  return null;
}

export default function LevelsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const q = useCurve();
  const update = useUpdateDraft();
  const publish = usePublishCurve();
  const [draft, setDraft] = useState<LevelsCurve | null>(null);

  const current = draft ?? q.data ?? null;

  const invalidMsg = useMemo(() => (current ? validateCurve(current.levels) : null), [current]);

  const uploadBadge = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const { data } = await apiClient.post<{ url: string }>('/admin/levels/badge-upload', fd);
    return data.url;
  };

  const download = () => {
    if (!current) return;
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'levels-curve.json';
    a.click();
    URL.revokeObjectURL(url);
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
    if (!current) return;
    const nextN = current.levels.length + 1;
    const xp = suggestNextXp(current.levels);
    setLevels([
      ...current.levels,
      {
        level: nextN,
        xpRequired: xp,
        displayName: undefined,
        badgeImageUrl: undefined,
        milestoneEnabled: false,
        milestoneUnlock: null,
      },
    ]);
  };

  if (mock === 'empty') {
    return (
      <EmptyState
        title="No hay curva configurada"
        description="Guardá la configuración inicial desde el entorno de staging o contactá soporte."
      />
    );
  }
  if (mock === 'loading' || q.isLoading) return <Loading label="Cargando curva..." />;
  if (mock === 'error' || q.isError) return <ErrorState onRetry={() => q.refetch()} />;
  if (!current) {
    return (
      <EmptyState title="No hay curva configurada" description="No se pudo cargar la curva de niveles." />
    );
  }

  return (
    <>
      <PageHeader
        title="Curva de niveles"
        subtitle="Configurá los niveles que tendrán tus jugadores. Cada nivel requiere XP acumulado para desbloquearse."
        actions={
          <Button icon={<Download size={14} />} onClick={download}>
            Exportar JSON
          </Button>
        }
      />

      <p className="mb-4 max-w-3xl text-[15px] text-text-secondary">
        Configurá los niveles que tendrán tus jugadores. Cada nivel requiere XP acumulado para desbloquearse.
      </p>

      <div className="card overflow-x-auto p-5">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border-default text-[13px] font-semibold uppercase tracking-wide text-text-tertiary">
              <th className="pb-3 pr-2">Nivel</th>
              <th className="pb-3 pr-2">Nombre opc.</th>
              <th className="pb-3 pr-2">Insignia</th>
              <th className="pb-3 pr-2">XP necesario</th>
              <th className="pb-3">Milestone</th>
            </tr>
          </thead>
          <tbody>
            {current.levels.map((row, index) => (
              <LevelRow
                key={row.level}
                row={row}
                prevXp={index === 0 ? null : current.levels[index - 1].xpRequired}
                onPickBadge={uploadBadge}
                onChange={(next) => {
                  const copy = [...current.levels];
                  copy[index] = next;
                  setLevels(copy);
                }}
              />
            ))}
          </tbody>
        </table>
        <AddLevelButton nextLevel={current.levels.length + 1} onClick={addLevel} />
        {invalidMsg ? <p className="mt-3 text-[15px] text-danger">{invalidMsg}</p> : null}
      </div>

      <StickyBottomBar
        onCancel={() => setDraft(null)}
        onSaveDraft={async () => {
          if (!current || invalidMsg) return;
          await update.mutateAsync(current);
        }}
        onActivate={async () => {
          if (!current || invalidMsg) return;
          await publish.mutateAsync(current);
        }}
        loading={update.isPending || publish.isPending}
      />
    </>
  );
}
