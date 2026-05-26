import { useEffect, useMemo, useState } from 'react';
import { Copy, MoreVertical, Pencil, Plus, Upload } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { NewRuleModal } from '@/features/rules/components/NewRuleModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { IconButton } from '@/components/ui/IconButton';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusPill } from '@/components/ui/StatusPill';
import { Switch } from '@/components/ui/Switch';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { useDebounce } from '@/hooks/useDebounce';
import { formatRelativeDate } from '@/lib/format';
import { useDuplicateRule, useRulesList, useToggleRule } from '@/features/rulesApi';
import { CATEGORIES } from '@/types/expandedTier5';
import type { RuleCategory, RuleListItem, RuleStatus } from '@/types/rules';

const category = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, { label: c.label, color: 'bg-info/15 text-info' }]),
) as Record<RuleCategory, { label: string; color: string }>;

const boostLabel = (value: number) =>
  Number.isInteger(value) ? String(value) : String(value).replace('.', ',');

const isBoostActive = (rule: RuleListItem) => {
  if (!rule.boost?.enabled) return false;
  const now = Date.now();
  return (
    new Date(rule.boost.starts_at).getTime() <= now && new Date(rule.boost.ends_at).getTime() >= now
  );
};

export default function RulesListPage() {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as RuleStatus | 'all') ?? 'all';
  const mock = params.get('mockState');
  const [newRuleOpen, setNewRuleOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (params.get('create') !== '1') return;
    setNewRuleOpen(true);
    const next = new URLSearchParams(params);
    next.delete('create');
    setParams(next, { replace: true });
  }, [params, setParams]);
  const q = useRulesList({ status: status === 'all' ? undefined : status });
  const nav = useNavigate();
  const debounced = useDebounce(search);
  const toggle = useToggleRule();
  const dup = useDuplicateRule();
  const rules = mock === 'empty' ? [] : (q.data ?? []);
  const filtered = useMemo(
    () => rules.filter((r) => !debounced || `${r.name} ${r.description}`.toLowerCase().includes(debounced.toLowerCase())),
    [rules, debounced],
  );
  const counts = {
    all: rules.length,
    active: rules.filter((r) => r.status === 'active').length,
    paused: rules.filter((r) => r.status === 'paused').length,
    draft: rules.filter((r) => r.status === 'draft').length,
  };

  const columns: Column<RuleListItem>[] = [
    {
      key: 'switch',
      header: '',
      width: '50px',
      render: (r) => (
        <Switch
          checked={r.active}
          onChange={(active) => toggle.mutate({ id: r.id, active })}
          aria-label={`activar ${r.name}`}
        />
      ),
    },
    {
      key: 'name',
      header: 'regla',
      render: (r) => (
        <button type="button" onClick={() => nav(`/reglas-xp/${r.id}`)} className="text-left hover:text-accent">
          <div className="flex items-center gap-2">
            <span className="font-medium">{r.name}</span>
            {isBoostActive(r) && (
              <span className="rounded-full bg-purple/15 px-2 py-0.5 text-[12px] font-semibold text-purple">
                x{boostLabel(r.boost?.multiplier ?? 1)} activo
              </span>
            )}
          </div>
          <div className="text-[13px] text-text-tertiary">{r.description}</div>
        </button>
      ),
    },
    {
      key: 'cat',
      header: 'categoría',
      render: (r) => {
        const cat = category[r.category] ?? {
          label: r.category,
          color: 'bg-bg-tertiary text-text-tertiary',
        };
        return (
          <span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${cat.color}`}>
            {cat.label}
          </span>
        );
      },
    },
    {
      key: 'xp',
      header: 'XP',
      render: (r) => (
        <span>
          <b>{r.xpDisplay.value}</b>{' '}
          {r.xpDisplay.perUnit && <span className="text-[13px] text-text-tertiary">{r.xpDisplay.perUnit}</span>}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'estado',
      render: (r) => (
        <StatusPill
          status={
            r.status === 'active' ? 'active' : r.status === 'paused' ? 'paused' : r.status === 'draft' ? 'draft' : 'archived'
          }
        />
      ),
    },
    {
      key: 'updated',
      header: 'actualizada',
      render: (r) => <span className="text-[14px] text-text-secondary">{formatRelativeDate(r.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'acciones',
      align: 'right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <IconButton icon={Copy} title="duplicar" size="sm" onClick={() => dup.mutate(r.id)} />
          <IconButton icon={Pencil} title="editar" size="sm" onClick={() => nav(`/reglas-xp/${r.id}`)} />
          <IconButton
            icon={MoreVertical}
            title="pausar o activar"
            size="sm"
            onClick={() => toggle.mutate({ id: r.id, active: !r.active })}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reglas de XP"
        subtitle="Listado de reglas activas por categoría y evento bet_placed."
        actions={
          <>
            <Button icon={<Upload size={14} />}>Importar</Button>
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setNewRuleOpen(true)}>
              Nueva regla
            </Button>
          </>
        }
      />
      <Toolbar
        search={
          <SearchInput
            placeholder="buscar regla por nombre o evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        }
        filters={
          <>
            <FilterPill label="todas" count={counts.all} active={status === 'all'} onClick={() => setParams({})} />
            <FilterPill
              label="activas"
              count={counts.active}
              active={status === 'active'}
              onClick={() => setParams({ status: 'active' })}
            />
            <FilterPill
              label="pausadas"
              count={counts.paused}
              active={status === 'paused'}
              onClick={() => setParams({ status: 'paused' })}
            />
            <FilterPill
              label="borradores"
              count={counts.draft}
              active={status === 'draft'}
              onClick={() => setParams({ status: 'draft' })}
            />
          </>
        }
      />
      {mock === 'empty' && (
        <Table
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.id}
          emptyState={
            <EmptyState
              title="Todavía no tenés reglas"
              description="Las reglas definen cuánta XP gana cada acción del jugador."
              action={
                <Button variant="primary" onClick={() => setNewRuleOpen(true)}>
                  Crear primera regla
                </Button>
              }
            />
          }
        />
      )}
      {(mock === 'loading' || q.isLoading) && <Loading label="Cargando reglas..." />}
      {(mock === 'error' || q.isError) && <ErrorState onRetry={() => q.refetch()} />}
      {mock !== 'empty' && mock !== 'loading' && mock !== 'error' && !q.isLoading && !q.isError && (
        <Table
          columns={columns}
          rows={filtered}
          rowKey={(r) => r.id}
          emptyState={
            <EmptyState
              title="Todavía no tenés reglas"
              description="Las reglas definen cuánta XP gana cada acción del jugador."
              action={
                <Button variant="primary" onClick={() => setNewRuleOpen(true)}>
                  Crear primera regla
                </Button>
              }
            />
          }
        />
      )}
      <p className="mt-5 text-center text-[14px] font-medium italic text-text-tertiary">
        Una regla activa por categoría · evento bet_placed · tasa XP por moneda en{' '}
        <Link to="/monedas" className="text-accent hover:underline">
          Monedas
        </Link>
      </p>
      <NewRuleModal open={newRuleOpen} onClose={() => setNewRuleOpen(false)} />
    </>
  );
}
