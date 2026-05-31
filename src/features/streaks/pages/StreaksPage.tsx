import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Flame, Plus } from 'lucide-react';

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
import { StreaksDocModal } from '@/features/streaks/components/StreaksDocModal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';

type Tab = 'programs' | 'players';

export default function StreaksPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('programs');
  const [playerDetail, setPlayerDetail] = useState<string | null>(null);
  const [docOpen, setDocOpen] = useState(false);

  const programsQ = useStreakPrograms();
  const playersQ = usePlayerStreaks(0, 50);
  const activate = useActivateStreakProgram();
  const deactivate = useDeactivateStreakProgram();
  const migrate = useMigrateActiveStreakProgram();

  const programs = mock === 'empty' ? [] : (programsQ.data ?? []);

  const programColumns: Column<StreakProgram>[] = [
    {
      key: 'name',
      header: 'programa',
      render: (p) => (
        <button type="button" className="text-left font-semibold hover:text-accent" onClick={() => nav(`/rachas/${p.id}`)}>
          {p.name}
        </button>
      ),
    },
    { key: 'activity', header: 'actividad', render: (p) => <span className="font-mono text-[13px]">{p.activity_type}</span> },
    { key: 'tz', header: 'timezone', render: (p) => <span className="text-[13px] text-text-tertiary">{p.timezone}</span> },
    { key: 'policy', header: 'reset', render: (p) => <span className="text-[13px]">{p.reset_policy}</span> },
    {
      key: 'milestones',
      header: 'hitos',
      render: (p) => <span className="text-[14px] text-text-secondary">{p.milestones?.length ?? 0}</span>,
    },
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
          <Button size="sm" variant="secondary" onClick={() => nav(`/rachas/${p.id}`)}>
            editar
          </Button>
          {p.is_active ? (
            <Button size="sm" variant="secondary" loading={deactivate.isPending} onClick={() => deactivate.mutate(p.id)}>
              desactivar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="primary"
              loading={activate.isPending}
              title="Solo puede haber 1 racha activa por tipo de actividad (login/bet/deposit) en este workspace."
              onClick={() => activate.mutate(p.id)}
            >
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
    { key: 'h', header: 'jugador', render: (r) => <span className="font-mono text-[14px]">{r.external_player_id}</span> },
    { key: 'p', header: 'programa', render: (r) => <span className="text-[14px]">{r.streak_program_name}</span> },
    { key: 'd', header: 'día actual', render: (r) => <span>{r.current_day}</span> },
    {
      key: 'status',
      header: 'estado',
      render: (r) => (
        <span className={r.status === 'active' && r.grace_days_used > 0 ? 'text-warning' : 'text-text-tertiary'}>
          {r.status}
          {r.grace_days_used > 0 ? ` · gracia ${r.grace_days_used}` : ''}
        </span>
      ),
    },
    {
      key: 'x',
      header: '',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => setPlayerDetail(r.external_player_id)}>
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
        actions={
          tab === 'programs' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => nav('/rachas/nueva')}>
              nuevo programa
            </Button>
          ) : null
        }
      />
      <div className="mb-5 inline-flex rounded-lg border border-border-subtle bg-bg-secondary p-0.5">
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-[14px] font-semibold ${tab === 'programs' ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary'}`}
          onClick={() => setTab('programs')}
        >
          Programas
        </button>
        <button
          type="button"
          className={`rounded-md px-4 py-2 text-[14px] font-semibold ${tab === 'players' ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary'}`}
          onClick={() => setTab('players')}
        >
          Jugadores con racha
        </button>
      </div>
      {mock === 'empty' && programs.length === 0 && tab === 'programs' ? (
        <EmptyState
          icon={Flame}
          title="Aún no tenés programas de racha"
          description="Las rachas premian a los jugadores por mantener actividad consecutiva. Creá tu primer programa."
          action={
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button variant="primary" onClick={() => nav('/rachas/nueva')}>
                Crear primer programa
              </Button>
              <button type="button" className="inline-flex items-center gap-1.5 text-[15px] text-accent hover:underline" onClick={() => setDocOpen(true)}>
                <BookOpen size={14} />
                Ver documentación
              </button>
            </div>
          }
        />
      ) : null}
      {(mock === 'loading' || programsQ.isLoading) && tab === 'programs' ? (
        <Loading label="Cargando programas de racha..." />
      ) : null}
      {(mock === 'error' || programsQ.isError) && tab === 'programs' ? <ErrorState onRetry={() => programsQ.refetch()} /> : null}
      {tab === 'programs' && programsReady ? (
        programs.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="Aún no tenés programas de racha"
            description="Las rachas premian a los jugadores por mantener actividad consecutiva. Creá tu primer programa."
            action={
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <Button variant="primary" onClick={() => nav('/rachas/nueva')}>
                  Crear primer programa
                </Button>
                <button type="button" className="inline-flex items-center gap-1.5 text-[15px] text-accent hover:underline" onClick={() => setDocOpen(true)}>
                  <BookOpen size={14} />
                  Ver documentación
                </button>
              </div>
            }
          />
        ) : (
          <Table columns={programColumns} rows={programs} rowKey={(p) => p.id} />
        )
      ) : null}
      {tab === 'players' && (playersQ.isLoading ? <Loading label="Cargando jugadores..." /> : null)}
      {tab === 'players' && playersQ.isError ? <ErrorState onRetry={() => playersQ.refetch()} /> : null}
      {tab === 'players' && !playersQ.isLoading && !playersQ.isError ? (
        <Table
          columns={playerColumns}
          rows={playersQ.data?.items ?? []}
          rowKey={(r) => `${r.external_player_id}-${r.streak_program_id}`}
        />
      ) : null}
      <PlayerHistoryModal playerId={playerDetail} onClose={() => setPlayerDetail(null)} />
      <StreaksDocModal open={docOpen} onClose={() => setDocOpen(false)} />
    </>
  );
}

function PlayerHistoryModal({ playerId, onClose }: { playerId: string | null; onClose: () => void }) {
  const q = usePlayerStreakDetail(playerId);
  return (
    <Modal open={!!playerId} onClose={onClose} title="Historial de racha" size="md">
      {q.isLoading ? <Loading label="Cargando..." /> : null}
      {q.data ? (
        <ul className="space-y-2 text-[15px]">
          {q.data.completed_days.map((d) => (
            <li key={d.day_number} className="flex justify-between rounded-lg border border-border-subtle px-3 py-2">
              <span>Día {d.day_number}</span>
              <span className="text-text-tertiary">{d.completed_at}</span>
              <span className="text-[13px] text-text-secondary">
                {d.milestone_reward_id ? 'hito' : d.micro_reward_id ? 'micro' : '—'}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </Modal>
  );
}
