import { useMemo, useState } from 'react';

import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { usePredictionPoolEntries } from '@/features/predictions/predictionsApi';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import type { PlayerPredictionEntry, PredictionPool } from '@/types/predictions';

type StatusFilter = 'all' | 'with_reward' | 'pending';

export function PoolParticipantsModal({
  open,
  pool,
  onClose,
}: {
  open: boolean;
  pool: PredictionPool | null;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const entriesQ = usePredictionPoolEntries(open && pool ? pool.id : null);
  const entries = entriesQ.data ?? [];

  const filtered = useMemo(() => {
    let list = entries;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.player_handle.toLowerCase().includes(q));
    }
    if (statusFilter === 'with_reward') {
      list = list.filter((e) => e.reward_delivered_at);
    }
    if (statusFilter === 'pending') {
      list = list.filter((e) => !e.reward_delivered_at);
    }
    return list;
  }, [entries, search, statusFilter]);

  const columns: Column<PlayerPredictionEntry>[] = [
    { key: 'player', header: 'Jugador', render: (e) => `@${e.player_handle}` },
    { key: 'at', header: 'Predijo', render: (e) => formatRelativeDate(e.predicted_at) },
    {
      key: 'hits',
      header: 'Aciertos',
      render: (e) =>
        e.hits_count != null ? `${e.hits_count}/${e.total_events}` : `—/${e.total_events}`,
    },
    { key: 'rank', header: 'Ranking', render: (e) => (e.rank != null ? `#${e.rank}` : '—') },
    {
      key: 'reward',
      header: 'Premio',
      render: (e) => e.reward_delivered_amount ?? '—',
    },
  ];

  if (!pool) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Participantes — ${pool.name}`} size="lg">
      <div className="mb-4 flex flex-wrap gap-3">
        <SearchInput
          placeholder="Buscar jugador..."
          value={search}
          onChange={(ev) => setSearch(ev.target.value)}
        />
        <select
          className="field w-auto"
          value={statusFilter}
          onChange={(ev) => setStatusFilter(ev.target.value as StatusFilter)}
        >
          <option value="all">Todos</option>
          <option value="with_reward">Con premio</option>
          <option value="pending">Sin premio</option>
        </select>
      </div>

      {entriesQ.isLoading ? (
        <p className="text-[14px] text-text-secondary">Cargando participantes...</p>
      ) : (
        <Table
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          onRowClick={(e) => setExpandedId(expandedId === e.id ? null : e.id)}
        />
      )}

      {expandedId && (
        <div className="mt-4 rounded-lg border border-border-subtle bg-bg-tertiary p-4">
          <h4 className="mb-2 text-[14px] font-semibold">Selecciones del jugador</h4>
          <ul className="space-y-2">
            {filtered
              .find((e) => e.id === expandedId)
              ?.selections.map((s) => (
                <li
                  key={s.id}
                  className={cn(
                    'flex justify-between text-[13px]',
                    s.is_correct === true && 'text-success',
                    s.is_correct === false && 'text-danger',
                  )}
                >
                  <span>
                    {s.event_name} ({s.prediction_type})
                  </span>
                  <span className="font-medium">{s.option_text}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}
