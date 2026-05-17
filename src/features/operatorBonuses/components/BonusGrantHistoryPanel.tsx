import { useState } from 'react';

import { FilterPill } from '@/components/ui/FilterPill';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { useBonusGrantHistory, useOperatorBonuses } from '@/features/operatorBonuses/operatorBonusesApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import type { BonusGrantHistoryEntry, GrantDeliveryStatus } from '@/types/operatorBonuses';

import { BonusGrantDetailModal } from './BonusGrantDetailModal';

const statusFilters: Array<'all' | GrantDeliveryStatus> = ['all', 'sent', 'success', 'failed'];

export function BonusGrantHistoryPanel() {
  const [statusFilter, setStatusFilter] = useState<'all' | GrantDeliveryStatus>('all');
  const [bonusFilter, setBonusFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const [detail, setDetail] = useState<BonusGrantHistoryEntry | null>(null);

  const bonusesQ = useOperatorBonuses();
  const grantsQ = useBonusGrantHistory({
    status: statusFilter,
    bonus_id: bonusFilter,
    source_module: moduleFilter,
    player_search: debouncedSearch || undefined,
  });

  const rows = grantsQ.data ?? [];
  const bonuses = bonusesQ.data ?? [];

  const columns: Column<BonusGrantHistoryEntry>[] = [
    { key: 'at', header: 'Timestamp', render: (r) => formatRelativeDate(r.granted_at) },
    { key: 'bonus', header: 'Bono', render: (r) => r.bonus_name },
    { key: 'player', header: 'Jugador', render: (r) => r.player_handle },
    { key: 'module', header: 'Módulo', render: (r) => r.source_module },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[13px] font-semibold',
            r.status === 'success' && 'bg-success/15 text-success',
            r.status === 'failed' && 'bg-danger/15 text-danger',
            r.status === 'sent' && 'bg-info/15 text-info',
          )}
        >
          {r.status}
        </span>
      ),
    },
    { key: 'attempts', header: 'Intentos', render: (r) => r.attempts_count },
  ];

  return (
    <>
      <Toolbar
        search={
          <SearchInput placeholder="Buscar jugador..." value={search} onChange={(e) => setSearch(e.target.value)} />
        }
        filters={
          <>
            {statusFilters.map((s) => (
              <FilterPill key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} label={s === 'all' ? 'Todos' : s} />
            ))}
            <FilterPill active={bonusFilter === 'all'} onClick={() => setBonusFilter('all')} label="Todos bonos" />
            {bonuses.slice(0, 4).map((b) => (
              <FilterPill key={b.id} active={bonusFilter === b.id} onClick={() => setBonusFilter(b.id)} label={b.name.slice(0, 20)} />
            ))}
            {['missions', 'chests', 'shop', 'rankings'].map((m) => (
              <FilterPill key={m} active={moduleFilter === m} onClick={() => setModuleFilter(m)} label={m} />
            ))}
            {moduleFilter !== 'all' && (
              <FilterPill active={moduleFilter === 'all'} onClick={() => setModuleFilter('all')} label="Todos módulos" />
            )}
          </>
        }
      />

      <Table
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        onRowClick={(r) => setDetail(r)}
        emptyState={<p className="py-8 text-center text-[14px] text-text-tertiary">Sin entregas</p>}
      />

      <BonusGrantDetailModal open={detail !== null} entry={detail} onClose={() => setDetail(null)} />
    </>
  );
}
