import { useEffect, useMemo, useState } from 'react';
import { Copy, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { NewRuleModal } from '@/features/rules/components/NewRuleModal';
import { RuleBoostCell } from '@/features/rules/components/RuleBoostCell';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { IconButton } from '@/components/ui/IconButton';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { RowContextMenu, openRowContextMenu, type RowContextMenuAnchor } from '@/components/ui/RowContextMenu';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatusPill } from '@/components/ui/StatusPill';
import { Switch } from '@/components/ui/Switch';
import { Table, type Column } from '@/components/ui/Table';
import { useDebounce } from '@/hooks/useDebounce';
import { Toolbar } from '@/components/ui/Toolbar';
import { formatRelativeDate } from '@/lib/format';
import {
  isPublishedLikeStatus,
  useDeleteRule,
  useRulesList,
  useToggleRule,
} from '@/features/rulesApi';
import { CATEGORIES } from '@/types/expandedTier5';
import type { RuleCategory, RuleListItem, RuleStatus } from '@/types/rules';

const category = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, { label: c.label, color: 'bg-info/15 text-info' }]),
) as Record<RuleCategory, { label: string; color: string }>;

function statusPillStatus(rule: RuleListItem): 'active' | 'paused' | 'draft' | 'archived' {
  if (isPublishedLikeStatus(rule.status)) return 'active';
  if (rule.status === 'paused') return 'paused';
  if (rule.status === 'draft') return 'draft';
  return 'archived';
}

function statusPillLabel(rule: RuleListItem): string | undefined {
  if (isPublishedLikeStatus(rule.status)) return 'publicada';
  return undefined;
}

export default function RulesListPage() {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') as RuleStatus | 'all') ?? 'all';
  const mock = params.get('mockState');
  const [newRuleOpen, setNewRuleOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<RowContextMenuAnchor | null>(null);

  useEffect(() => {
    if (params.get('create') !== '1') return;
    setNewRuleOpen(true);
    const next = new URLSearchParams(params);
    next.delete('create');
    setParams(next, { replace: true });
  }, [params, setParams]);

  const q = useRulesList();
  const nav = useNavigate();
  const debounced = useDebounce(search);
  const toggle = useToggleRule();
  const del = useDeleteRule();
  const allRules = mock === 'empty' ? [] : (q.data ?? []);
  const rules = useMemo(() => {
    if (status === 'all') return allRules;
    if (status === 'active') return allRules.filter((r) => isPublishedLikeStatus(r.status));
    return allRules.filter((r) => r.status === status);
  }, [allRules, status]);
  const filtered = useMemo(
    () => rules.filter((r) => !debounced || `${r.name} ${r.description}`.toLowerCase().includes(debounced.toLowerCase())),
    [rules, debounced],
  );
  const menuRule = menuAnchor ? allRules.find((r) => r.id === menuAnchor.id) : undefined;
  const counts = useMemo(
    () => ({
      all: allRules.length,
      active: allRules.filter((r) => isPublishedLikeStatus(r.status)).length,
      paused: allRules.filter((r) => r.status === 'paused').length,
      draft: allRules.filter((r) => r.status === 'draft').length,
    }),
    [allRules],
  );

  const columns: Column<RuleListItem>[] = [
    {
      key: 'switch',
      header: '',
      width: '50px',
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={r.active}
            disabled={toggle.isPending}
            onChange={(active) => {
              if (!active && !window.confirm(`¿Archivar la regla "${r.name}"? Libera el slot único de la categoría.`)) {
                return;
              }
              toggle.mutate({ id: r.id, active });
            }}
            aria-label={r.active ? `archivar ${r.name}` : `activar ${r.name}`}
          />
        </div>
      ),
    },
    {
      key: 'name',
      header: 'regla',
      render: (r) => (
        <button type="button" onClick={() => nav(`/reglas-xp/${r.id}`)} className="text-left hover:text-accent">
          <div className="font-medium">{r.name}</div>
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
      key: 'boost',
      header: 'boost',
      render: (r) => <RuleBoostCell boost={r.boost} />,
    },
    {
      key: 'status',
      header: 'estado',
      render: (r) => <StatusPill status={statusPillStatus(r)} label={statusPillLabel(r)} />,
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
        <div className="relative flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <IconButton
            icon={Copy}
            title="copiar"
            size="sm"
            onClick={() => nav(`/reglas-xp/nueva?copyFrom=${encodeURIComponent(r.id)}`)}
          />
          <IconButton icon={Pencil} title="editar" size="sm" onClick={() => nav(`/reglas-xp/${r.id}`)} />
          <IconButton
            icon={MoreVertical}
            title="más acciones"
            size="sm"
            onClick={(e) => setMenuAnchor(openRowContextMenu(e, r.id, menuAnchor))}
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
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => setNewRuleOpen(true)}>
            Nueva regla
          </Button>
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
              label="publicadas"
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
      <RowContextMenu anchor={menuAnchor} onClose={() => setMenuAnchor(null)}>
        {menuRule && (
          <>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
              onClick={() => {
                setMenuAnchor(null);
                nav(`/reglas-xp/${menuRule.id}?mode=edit`);
              }}
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
              onClick={() => {
                setMenuAnchor(null);
                nav(`/reglas-xp/nueva?copyFrom=${encodeURIComponent(menuRule.id)}`);
              }}
            >
              <Copy size={14} /> Copiar
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[14px] text-danger hover:bg-bg-tertiary"
              onClick={() => {
                setMenuAnchor(null);
                if (window.confirm(`¿Archivar la regla "${menuRule.name}"? Libera el slot único de la categoría.`)) {
                  void del.mutateAsync(menuRule.id);
                }
              }}
            >
              <Trash2 size={14} /> Archivar
            </button>
          </>
        )}
      </RowContextMenu>
    </>
  );
}
