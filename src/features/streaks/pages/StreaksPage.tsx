import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  useActivateStreakProgram,
  useDeactivateStreakProgram,
  useMigrateActiveStreakProgram,
  usePlayerStreakDetail,
  usePlayerStreaks,
  useStreakPrograms,
} from '@/features/streakProgramsApi';
import type { PlayerStreakSummary, StreakProgram } from '@/types/streakPrograms';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';

type Tab = 'programs' | 'players';

export default function StreaksPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const [tab, setTab] = useState<Tab>('programs');
  const [playerDetail, setPlayerDetail] = useState<string | null>(null);

  const programsQ = useStreakPrograms();
  const playersQ = usePlayerStreaks(0, 50);
  const activate = useActivateStreakProgram();
  const deactivate = useDeactivateStreakProgram();
  const migrate = useMigrateActiveStreakProgram();

  const programs = mock === 'empty' ? [] : (programsQ.data ?? []);

  const programColumns: Column<StreakProgram>[] = [
    { key: 'name', header: 'programa', render: (p) => <b>{p.name}</b> },
    { key: 'activity', header: 'actividad', render: (p) => <span className="font-mono text-[11px]">{p.activity_type}</span> },
    { key: 'tz', header: 'timezone', render: (p) => <span className="text-[11px] text-text-tertiary">{p.timezone}</span> },
    { key: 'policy', header: 'reset', render: (p) => <span className="text-[11px]">{p.reset_policy}</span> },
    {
      key: 'active',
      header: 'activo',
      render: (p) => (
        <span className={p.is_active ? 'text-success' : 'text-text-tertiary'}>{p.is_active ? 'sí' : 'no'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.is_active ? (
            <Button size="sm" variant="secondary" loading={deactivate.isPending} onClick={() => deactivate.mutate(p.id)}>
              desactivar
            </Button>
          ) : (
            <Button size="sm" variant="primary" loading={activate.isPending} onClick={() => activate.mutate(p.id)}>
              activar
            </Button>
          )}
          <Button size="sm" variant="secondary" loading={migrate.isPending} onClick={() => migrate.mutate(p.id)}>
            migrar jugadores activos
          </Button>
        </div>
      ),
    },
  ];

  const playerColumns: Column<PlayerStreakSummary>[] = [
    { key: 'h', header: 'jugador', render: (r) => <span>{r.player_handle}</span> },
    { key: 'p', header: 'programa', render: (r) => <span className="text-[12px]">{r.program_name}</span> },
    { key: 'd', header: 'día actual', render: (r) => <span>{r.current_day}</span> },
    {
      key: 'risk',
      header: 'riesgo',
      render: (r) => (r.streak_at_risk ? <span className="text-warning">en riesgo</span> : <span className="text-text-tertiary">ok</span>),
    },
    {
      key: 'x',
      header: '',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => setPlayerDetail(r.player_id)}>
          historial
        </Button>
      ),
    },
  ];

  const programsReady = mock !== 'empty' && mock !== 'loading' && mock !== 'error' && !programsQ.isLoading && !programsQ.isError;

  return (
    <>
      <PageHeader
        title="Programas de racha"
        subtitle="Streak programs (Sub-etapa 8) · actividad, timezone, política de reset y milestones"
        actions={null}
      />
      <div className="mb-5 inline-flex rounded-lg border border-border-subtle bg-bg-secondary p-0.5">
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-[12px] font-medium ${tab === 'programs' ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary'}`}
          onClick={() => setTab('programs')}
        >
          Programas
        </button>
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-[12px] font-medium ${tab === 'players' ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary'}`}
          onClick={() => setTab('players')}
        >
          Jugadores con racha
        </button>
      </div>
      {mock === 'empty' && programs.length === 0 && tab === 'programs' ? (
        <EmptyState title="Sin programas" description="Creá un programa de racha alineado al backend." />
      ) : null}
      {(mock === 'loading' || programsQ.isLoading) && tab === 'programs' ? (
        <Loading label="Cargando programas de racha..." />
      ) : null}
      {(mock === 'error' || programsQ.isError) && tab === 'programs' ? <ErrorState onRetry={() => programsQ.refetch()} /> : null}
      {tab === 'programs' && programsReady ? (
        programs.length === 0 ? (
          <EmptyState title="Sin programas" description="Creá un programa de racha alineado al backend." />
        ) : (
          <div className="space-y-6">
            <Table columns={programColumns} rows={programs} rowKey={(p) => p.id} />
            {programs.map((p) => (
              <div key={p.id} className="card p-4">
                <h3 className="label-section mb-2">Milestones · {p.name}</h3>
                <pre className="max-h-40 overflow-auto rounded-lg bg-bg-tertiary p-3 font-mono text-[11px] text-text-secondary">
                  {JSON.stringify(p.milestones, null, 2)}
                </pre>
                <p className="mt-2 text-[11px] text-text-tertiary">Micro recompensa diaria: {JSON.stringify(p.daily_micro_reward)}</p>
              </div>
            ))}
          </div>
        )
      ) : null}
      {tab === 'players' && (playersQ.isLoading ? <Loading label="Cargando jugadores..." /> : null)}
      {tab === 'players' && playersQ.isError ? <ErrorState onRetry={() => playersQ.refetch()} /> : null}
      {tab === 'players' && !playersQ.isLoading && !playersQ.isError ? (
        <Table columns={playerColumns} rows={playersQ.data?.items ?? []} rowKey={(r) => `${r.player_id}-${r.program_id}`} />
      ) : null}
      <PlayerHistoryModal playerId={playerDetail} onClose={() => setPlayerDetail(null)} />
    </>
  );
}

function PlayerHistoryModal({ playerId, onClose }: { playerId: string | null; onClose: () => void }) {
  const q = usePlayerStreakDetail(playerId);
  return (
    <Modal open={!!playerId} onClose={onClose} title="Historial de racha" size="md">
      {q.isLoading ? <Loading label="Cargando..." /> : null}
      {q.data ? (
        <ul className="space-y-2 text-[13px]">
          {q.data.days.map((d) => (
            <li key={d.day_number} className="flex justify-between rounded-lg border border-border-subtle px-3 py-2">
              <span>Día {d.day_number}</span>
              <span className="text-text-tertiary">{d.completed_at}</span>
              <span>{d.reward_claimed ? 'reclamado' : 'pendiente'}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Modal>
  );
}
