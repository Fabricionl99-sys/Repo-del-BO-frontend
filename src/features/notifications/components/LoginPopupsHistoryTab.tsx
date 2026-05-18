import { useState } from 'react';

import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatCard } from '@/components/ui/StatCard';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { useLoginPopupHistory, useLoginPopupStats, useLoginPopupTemplates } from '@/features/notifications/loginPopupsApi';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/features/notifications/loginPopupForm';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import type { LoginPopupHistoryItem, LoginPopupHistoryStatus } from '@/types/loginPopups';

export function LoginPopupsHistoryTab() {
  const [search, setSearch] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [status, setStatus] = useState<LoginPopupHistoryStatus | 'all'>('all');
  const [detail, setDetail] = useState<LoginPopupHistoryItem | null>(null);
  const debouncedSearch = useDebounce(search, 250);

  const statsQ = useLoginPopupStats();
  const templatesQ = useLoginPopupTemplates({ status: 'all' });
  const historyQ = useLoginPopupHistory({
    search: debouncedSearch || undefined,
    template_id: templateId || undefined,
    status,
  });

  const stats = statsQ.data;
  const columns: Column<LoginPopupHistoryItem>[] = [
    { key: 'at', header: 'Timestamp', render: (h) => formatRelativeDate(h.shown_at) },
    { key: 'template', header: 'Template', render: (h) => h.template_name },
    { key: 'player', header: 'Jugador', render: (h) => `@${h.player_handle}` },
    {
      key: 'priority',
      header: 'Prioridad',
      render: (h) => (
        <span className={cn('rounded-full px-2 py-0.5 text-[12px] font-semibold', PRIORITY_COLORS[h.priority])}>
          {PRIORITY_LABELS[h.priority]}
        </span>
      ),
    },
    { key: 'status', header: 'Estado', render: (h) => h.status },
    { key: 'cta', header: 'CTA', render: (h) => h.cta_action ?? '—' },
  ];

  return (
    <section>
      {stats && (
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Mostrados hoy" value={formatNumber(stats.total_shown_today)} />
          <StatCard label="Click rate" value={`${Math.round(stats.avg_click_rate * 100)}%`} />
          <StatCard label="Dismiss rate" value={`${Math.round(stats.dismiss_rate * 100)}%`} />
          <StatCard label="Views hoy" value={formatNumber(stats.views_today)} />
        </div>
      )}

      <Toolbar
        search={
          <SearchInput placeholder="Buscar jugador o template..." value={search} onChange={(e) => setSearch(e.target.value)} />
        }
        filters={
          <>
            <select className="field w-auto" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
              <option value="">Todos los templates</option>
              {(templatesQ.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <select className="field w-auto" value={status} onChange={(e) => setStatus(e.target.value as LoginPopupHistoryStatus | 'all')}>
              <option value="all">Todos los estados</option>
              <option value="pending">pending</option>
              <option value="viewed">viewed</option>
              <option value="dismissed">dismissed</option>
              <option value="clicked">clicked</option>
            </select>
          </>
        }
      />

      <Table
        columns={columns}
        rows={historyQ.data ?? []}
        rowKey={(h) => h.id}
        onRowClick={(h) => setDetail(h)}
      />

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Detalle del popup" size="md">
        {detail && (
          <dl className="space-y-2 text-[14px]">
            <div className="flex justify-between gap-4">
              <dt className="text-text-tertiary">Jugador</dt>
              <dd>@{detail.player_handle}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-tertiary">Template</dt>
              <dd>{detail.template_name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-text-tertiary">Estado</dt>
              <dd>{detail.status}</dd>
            </div>
            {detail.context && (
              <pre className="mt-3 rounded-lg bg-bg-tertiary p-3 text-[12px]">
                {JSON.stringify(detail.context, null, 2)}
              </pre>
            )}
          </dl>
        )}
      </Modal>
    </section>
  );
}
