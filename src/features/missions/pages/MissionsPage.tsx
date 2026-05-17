import { Plus, MoreVertical } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { IconButton } from '@/components/ui/IconButton';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusPill } from '@/components/ui/StatusPill';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { getTriggerLabel, MISSION_TRIGGER_GROUPS } from '@/features/missions/missionTriggers';
import { useMissions } from '@/features/tier3Api';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeDate } from '@/lib/format';
import type { Mission } from '@/types/tier3';

export default function MissionsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const q = useMissions();
  const nav = useNavigate();

  const [triggerFilter, setTriggerFilter] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const allRows = mock === 'empty' ? [] : (q.data ?? []);

  const rows = useMemo(() => {
    return allRows.filter((m) => {
      if (triggerFilter !== 'all' && m.objective.event !== triggerFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !getTriggerLabel(m.objective.event).toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [allRows, triggerFilter, debouncedSearch]);

  const cols: Column<Mission>[] = [
    {
      key: 'name',
      header: 'misión',
      render: (m) => (
        <button type="button" onClick={() => nav(`/misiones/${m.id}`)} className="text-left hover:text-accent">
          <b>
            {m.iconKey} {m.name}
          </b>
          <div className="text-[13px] text-text-tertiary">{m.description}</div>
        </button>
      ),
    },
    {
      key: 'type',
      header: 'tipo',
      render: (m) => <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[13px] font-medium">{m.type}</span>,
    },
    {
      key: 'objective',
      header: 'trigger',
      render: (m) => (
        <span className="text-[14px] font-medium">
          {getTriggerLabel(m.objective.event)} · {m.objective.targetValue}
        </span>
      ),
    },
    {
      key: 'reward',
      header: 'recompensa',
      render: (m) => (
        <span>
          {m.rewards
            .map((r) =>
              r.xpAmount ? `+${r.xpAmount} XP` : r.coinsAmount ? `+${r.coinsAmount} ${r.coinId}` : r.type,
            )
            .join(' · ')}
        </span>
      ),
    },
    {
      key: 'progress',
      header: 'progreso',
      render: (m) => (
        <span>
          {m.progress.completed}/{m.progress.started}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'estado',
      render: (m) => (
        <StatusPill
          status={m.status === 'active' ? 'active' : m.status === 'paused' ? 'paused' : m.status === 'draft' ? 'draft' : 'finished'}
          label={m.status}
        />
      ),
    },
    {
      key: 'updated',
      header: 'actualizada',
      render: (m) => <span className="text-[14px] text-text-secondary">{formatRelativeDate(m.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: () => <IconButton icon={MoreVertical} title="acciones" />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Misiones"
        subtitle="Objetivos con recompensas para tus jugadores"
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => nav('/misiones/nueva')}>
            Nueva misión
          </Button>
        }
      />

      <Toolbar
        search={
          <SearchInput
            placeholder="Buscar por nombre o trigger..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
        filters={
          <>
            <FilterPill label="todos triggers" active={triggerFilter === 'all'} onClick={() => setTriggerFilter('all')} />
            {MISSION_TRIGGER_GROUPS.map((group) =>
              group.triggers.slice(0, 2).map((t) => (
                <FilterPill
                  key={t.code}
                  label={t.label}
                  active={triggerFilter === t.code}
                  onClick={() => setTriggerFilter(triggerFilter === t.code ? 'all' : t.code)}
                />
              )),
            )}
          </>
        }
      />

      {mock === 'empty' && rows.length === 0 && (
        <EmptyState
          title="No hay misiones"
          description="Creá una misión semanal, diaria o por evento."
          action={
            <Button variant="primary" onClick={() => nav('/misiones/nueva')}>
              Crear misión
            </Button>
          }
        />
      )}
      {(mock === 'loading' || q.isLoading) && <Loading label="Cargando misiones..." />}
      {(mock === 'error' || q.isError) && <ErrorState onRetry={() => q.refetch()} />}
      {mock !== 'empty' && mock !== 'loading' && mock !== 'error' && !q.isLoading && !q.isError && (
        <Table
          columns={cols}
          rows={rows}
          rowKey={(m) => m.id}
          emptyState={
            <EmptyState
              title="No hay misiones"
              description="Creá una misión semanal, diaria o por evento."
              action={
                <Button variant="primary" onClick={() => nav('/misiones/nueva')}>
                  Crear misión
                </Button>
              }
            />
          }
        />
      )}
    </>
  );
}
