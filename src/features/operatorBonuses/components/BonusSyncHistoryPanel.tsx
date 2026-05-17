import { Table, type Column } from '@/components/ui/Table';
import { useBonusSyncHistory } from '@/features/operatorBonuses/operatorBonusesApi';
import { formatRelativeDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { BonusSyncHistoryEntry } from '@/types/operatorBonuses';

export function BonusSyncHistoryPanel() {
  const q = useBonusSyncHistory();
  const rows = q.data ?? [];

  const columns: Column<BonusSyncHistoryEntry>[] = [
    { key: 'ran_at', header: 'Timestamp', render: (r) => formatRelativeDate(r.ran_at) },
    { key: 'type', header: 'Tipo', render: (r) => (r.run_type === 'manual' ? 'Manual' : 'Auto') },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[13px] font-semibold',
            r.status === 'success' && 'bg-success/15 text-success',
            r.status === 'failed' && 'bg-danger/15 text-danger',
            r.status === 'partial' && 'bg-warning/15 text-warning',
          )}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: 'counts',
      header: 'Cambios',
      render: (r) => `+${r.added_count} / ~${r.updated_count} / -${r.deprecated_count}`,
    },
    {
      key: 'error',
      header: 'Error',
      render: (r) => r.error_message ?? '—',
    },
  ];

  return (
    <Table
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      emptyState={<p className="py-8 text-center text-[14px] text-text-tertiary">Sin historial de sync</p>}
    />
  );
}
