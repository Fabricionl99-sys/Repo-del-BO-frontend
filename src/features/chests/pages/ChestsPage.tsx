import { Gift, Package, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { ChestInventoryDetailModal } from '@/features/chests/components/ChestInventoryDetailModal';
import { ChestTypeCard } from '@/features/chests/components/ChestTypeCard';
import { ChestTypeFormModal } from '@/features/chests/components/ChestTypeFormModal';
import {
  useChestInventory,
  useChestTypes,
  useGrantChestManual,
  usePlayerSearch,
} from '@/features/chests/chestsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type {
  ChestAcquiredVia,
  ChestInventoryStatus,
  ChestType,
  PlayerChestInventoryItem,
} from '@/types/chests';

const tabs = ['Tipos de Cofre', 'Inventario', 'Entregar manual'] as const;
type Tab = (typeof tabs)[number];

const statusFilters: Array<'all' | 'active' | 'archived'> = ['all', 'active', 'archived'];

const inventoryStatusLabels: Record<ChestInventoryStatus, string> = {
  unopened: 'no abierto',
  opened: 'abierto',
  expired: 'expirado',
};

const viaLabels: Record<ChestAcquiredVia, string> = {
  shop_purchase: 'tienda',
  mission_completed: 'misión',
  streak_completed: 'racha',
  level_up: 'level up',
  welcome: 'welcome',
  manual_grant: 'manual',
};

export default function ChestsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const chestsActive = isModuleActive(activeModuleCodes, 'chests');

  const [tab, setTab] = useState<Tab>('Tipos de Cofre');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [editorType, setEditorType] = useState<ChestType | null | 'new'>(null);
  const [inventoryDetail, setInventoryDetail] = useState<PlayerChestInventoryItem | null>(null);

  const [invTypeCode, setInvTypeCode] = useState<string | 'all'>('all');
  const [invStatus, setInvStatus] = useState<ChestInventoryStatus | 'all'>('all');
  const [invVia, setInvVia] = useState<ChestAcquiredVia | 'all'>('all');
  const [invPlayerSearch, setInvPlayerSearch] = useState('');
  const [invFrom, setInvFrom] = useState('');
  const [invTo, setInvTo] = useState('');
  const debouncedPlayerSearch = useDebounce(invPlayerSearch, 250);

  const [grantPlayerId, setGrantPlayerId] = useState('');
  const [grantPlayerQuery, setGrantPlayerQuery] = useState('');
  const [grantChestCode, setGrantChestCode] = useState('');
  const [grantNotes, setGrantNotes] = useState('');
  const debouncedGrantQuery = useDebounce(grantPlayerQuery, 250);

  const typesQ = useChestTypes({
    status: statusFilter,
    search: debouncedSearch || undefined,
  });

  const inventoryQ = useChestInventory({
    chest_type_code: invTypeCode === 'all' ? undefined : invTypeCode,
    status: invStatus === 'all' ? undefined : invStatus,
    acquired_via: invVia === 'all' ? undefined : invVia,
    player_search: debouncedPlayerSearch || undefined,
    from: invFrom || undefined,
    to: invTo || undefined,
    limit: 50,
    offset: 0,
  });

  const playerSearchQ = usePlayerSearch(debouncedGrantQuery);
  const grantManual = useGrantChestManual();

  const types = mock === 'empty' ? [] : (typesQ.data ?? []);
  const inventory = mock === 'empty' ? [] : (inventoryQ.data?.items ?? []);
  const existingCodes = useMemo(() => types.map((t) => t.code), [types]);
  const chestTypeOptions = useMemo(
    () => types.filter((t) => t.status === 'active').map((t) => ({ code: t.code, name: t.name })),
    [types],
  );

  if (!chestsActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Cofres" subtitle="Tipos de cofre, inventario y entregas manuales" />
        <EmptyState
          icon={Package}
          title="Módulo Cofres no activo"
          description="Activá el módulo chests desde el catálogo para gestionar tipos e inventario."
          action={
            <Link to="/modulos">
              <Button variant="primary">Activar módulo Cofres</Button>
            </Link>
          }
        />
      </>
    );
  }

  const catalogLoading = mock !== 'empty' && tab === 'Tipos de Cofre' && typesQ.isLoading;
  const inventoryLoading = mock !== 'empty' && tab === 'Inventario' && inventoryQ.isLoading;
  if (mock === 'loading' || catalogLoading || inventoryLoading) {
    return <Loading label="Cargando cofres..." />;
  }

  if (mock === 'error' || typesQ.isError || inventoryQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          typesQ.refetch();
          inventoryQ.refetch();
        }}
      />
    );
  }

  const inventoryColumns: Column<PlayerChestInventoryItem>[] = [
    {
      key: 'player',
      header: 'jugador',
      render: (r) => <span>{r.player_handle ?? r.player_id}</span>,
    },
    {
      key: 'type',
      header: 'tipo cofre',
      render: (r) => (
        <span>
          {r.chest_type_name}
          <span className="ml-1 font-mono text-[12px] text-text-tertiary">{r.chest_type_code}</span>
        </span>
      ),
    },
    {
      key: 'via',
      header: 'trigger',
      render: (r) => <span>{viaLabels[r.acquired_via]}</span>,
    },
    {
      key: 'date',
      header: 'adquirido',
      render: (r) => <span className="text-[14px] text-text-secondary">{formatRelativeDate(r.acquired_at)}</span>,
    },
    {
      key: 'status',
      header: 'status',
      render: (r) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[12px] font-semibold uppercase',
            r.status === 'opened'
              ? 'bg-success/15 text-success'
              : r.status === 'expired'
                ? 'bg-danger/15 text-danger'
                : 'bg-bg-tertiary text-text-secondary',
          )}
        >
          {inventoryStatusLabels[r.status]}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Button size="sm" variant="ghost" onClick={() => setInventoryDetail(r)}>
          detalle
        </Button>
      ),
    },
  ];

  const handleGrant = async () => {
    if (!grantPlayerId.trim() || !grantChestCode) return;
    await grantManual.mutateAsync({
      player_id: grantPlayerId.trim(),
      chest_type_code: grantChestCode,
      notes: grantNotes.trim() || undefined,
    });
    setGrantPlayerId('');
    setGrantPlayerQuery('');
    setGrantChestCode('');
    setGrantNotes('');
    setTab('Inventario');
  };

  return (
    <>
      <PageHeader
        title="Cofres"
        subtitle="Catálogo de tipos, inventario cross-jugadores y entregas manuales"
        actions={
          tab === 'Tipos de Cofre' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorType('new')}>
              Nuevo tipo de cofre
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-wrap gap-2 border-b border-border-subtle">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-semibold transition-colors',
              tab === t
                ? 'border-b-2 border-accent text-accent'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Tipos de Cofre' && (
        <>
          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar por nombre o code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
            filters={
              <>
                {statusFilters.map((f) => (
                  <FilterPill
                    key={f}
                    label={f === 'all' ? 'todos' : f}
                    count={
                      f === 'all'
                        ? types.length
                        : types.filter((t) => t.status === f).length
                    }
                    active={statusFilter === f}
                    onClick={() => setStatusFilter(f)}
                  />
                ))}
              </>
            }
          />

          {types.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="Sin tipos de cofre"
              description="Creá el primer tipo de cofre con premios que sumen 100%."
              action={
                <Button variant="primary" onClick={() => setEditorType('new')}>
                  Crear primer tipo de cofre
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-4 gap-4 max-[1300px]:grid-cols-3 max-md:grid-cols-1">
              {types.map((t) => (
                <ChestTypeCard key={t.code} type={t} onEdit={() => setEditorType(t)} />
              ))}
              <button
                type="button"
                onClick={() => setEditorType('new')}
                className="flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-default text-text-tertiary hover:border-accent hover:text-accent"
              >
                <Plus />
                <span>agregar tipo</span>
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'Inventario' && (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">tipo cofre</label>
              <select
                className="field py-1.5 text-[14px]"
                value={invTypeCode}
                onChange={(e) => setInvTypeCode(e.target.value)}
              >
                <option value="all">todos</option>
                {typesQ.data?.map((t) => (
                  <option key={t.code} value={t.code}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">status</label>
              <select
                className="field py-1.5 text-[14px]"
                value={invStatus}
                onChange={(e) => setInvStatus(e.target.value as ChestInventoryStatus | 'all')}
              >
                <option value="all">todos</option>
                {(Object.keys(inventoryStatusLabels) as ChestInventoryStatus[]).map((s) => (
                  <option key={s} value={s}>{inventoryStatusLabels[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">trigger</label>
              <select
                className="field py-1.5 text-[14px]"
                value={invVia}
                onChange={(e) => setInvVia(e.target.value as ChestAcquiredVia | 'all')}
              >
                <option value="all">todos</option>
                {(Object.keys(viaLabels) as ChestAcquiredVia[]).map((v) => (
                  <option key={v} value={v}>{viaLabels[v]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">jugador</label>
              <SearchInput
                placeholder="handle o id..."
                value={invPlayerSearch}
                onChange={(e) => setInvPlayerSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">desde</label>
              <input type="date" className="field py-1.5 text-[14px]" value={invFrom} onChange={(e) => setInvFrom(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">hasta</label>
              <input type="date" className="field py-1.5 text-[14px]" value={invTo} onChange={(e) => setInvTo(e.target.value)} />
            </div>
          </div>

          <Table
            columns={inventoryColumns}
            rows={inventory}
            rowKey={(r) => r.id}
            onRowClick={(r) => setInventoryDetail(r)}
            emptyState={
              <EmptyState
                title="Aún no se entregaron cofres"
                description="El inventario aparecerá cuando los jugadores reciban cofres."
              />
            }
          />
        </>
      )}

      {tab === 'Entregar manual' && (
        <div className="max-w-lg space-y-4 rounded-xl border border-border-subtle bg-bg-secondary p-6">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Buscar jugador</label>
            <SearchInput
              placeholder="handle o id (mín. 2 chars)..."
              value={grantPlayerQuery}
              onChange={(e) => setGrantPlayerQuery(e.target.value)}
            />
            {playerSearchQ.data && playerSearchQ.data.length > 0 && (
              <ul className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border-subtle bg-bg-primary">
                {playerSearchQ.data.map((p) => (
                  <li key={p.player_id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-[14px] hover:bg-bg-tertiary"
                      onClick={() => {
                        setGrantPlayerId(p.player_id);
                        setGrantPlayerQuery(p.player_handle);
                      }}
                    >
                      {p.player_handle}
                      <span className="ml-2 font-mono text-[12px] text-text-tertiary">{p.player_id}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">player_id seleccionado</label>
            <input className="field font-mono text-[14px]" value={grantPlayerId} onChange={(e) => setGrantPlayerId(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Tipo de cofre</label>
            <select className="field" value={grantChestCode} onChange={(e) => setGrantChestCode(e.target.value)}>
              <option value="">Elegí…</option>
              {chestTypeOptions.map((t) => (
                <option key={t.code} value={t.code}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Observaciones (opcional)</label>
            <textarea className="field min-h-16" value={grantNotes} onChange={(e) => setGrantNotes(e.target.value)} />
          </div>
          <Button
            variant="primary"
            loading={grantManual.isPending}
            disabled={!grantPlayerId.trim() || !grantChestCode}
            onClick={handleGrant}
          >
            Entregar
          </Button>
        </div>
      )}

      <ChestTypeFormModal
        open={editorType !== null}
        chestType={editorType === 'new' ? null : editorType}
        existingCodes={existingCodes}
        chestTypeOptions={chestTypeOptions}
        onClose={() => setEditorType(null)}
      />

      <ChestInventoryDetailModal item={inventoryDetail} onClose={() => setInventoryDetail(null)} />
    </>
  );
}
