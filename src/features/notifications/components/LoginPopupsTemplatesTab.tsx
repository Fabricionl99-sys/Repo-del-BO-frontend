import { Copy, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterPill } from '@/components/ui/FilterPill';
import { SearchInput } from '@/components/ui/SearchInput';
import { StatCard } from '@/components/ui/StatCard';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import {
  useArchiveLoginPopupTemplate,
  useLoginPopupStats,
  useLoginPopupTemplates,
  useSaveLoginPopupTemplate,
  useToggleLoginPopupTemplate,
} from '@/features/notifications/loginPopupsApi';
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  TRIGGER_LABELS,
  formToPayload,
  summarizeConditions,
  templateToForm,
} from '@/features/notifications/loginPopupForm';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import type { LoginPopupPriority, LoginPopupTemplate, LoginPopupTrigger } from '@/types/loginPopups';

import { LoginPopupFormModal } from './LoginPopupFormModal';

export function LoginPopupsTemplatesTab() {
  const [search, setSearch] = useState('');
  const [trigger, setTrigger] = useState<LoginPopupTrigger | 'all'>('all');
  const [priority, setPriority] = useState<LoginPopupPriority | 'all'>('all');
  const [status, setStatus] = useState<'active' | 'inactive' | 'all'>('active');
  const [editor, setEditor] = useState<LoginPopupTemplate | null | 'new'>(null);
  const debouncedSearch = useDebounce(search, 250);

  const statsQ = useLoginPopupStats();
  const listQ = useLoginPopupTemplates({
    search: debouncedSearch || undefined,
    trigger,
    priority,
    status,
  });
  const save = useSaveLoginPopupTemplate();
  const toggle = useToggleLoginPopupTemplate();
  const archive = useArchiveLoginPopupTemplate();

  const templates = listQ.data ?? [];
  const existingCodes = useMemo(() => templates.map((t) => t.code), [templates]);
  const stats = statsQ.data;

  const columns: Column<LoginPopupTemplate>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (t) => (
        <div>
          <div className="font-semibold">{t.name}</div>
          <div className="font-mono text-[12px] text-text-tertiary">{t.code}</div>
        </div>
      ),
    },
    {
      key: 'trigger',
      header: 'Trigger',
      render: (t) => (
        <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[12px]">{TRIGGER_LABELS[t.trigger_event]}</span>
      ),
    },
    {
      key: 'priority',
      header: 'Prioridad',
      render: (t) => (
        <span className={cn('rounded-full px-2 py-0.5 text-[12px] font-semibold', PRIORITY_COLORS[t.priority])}>
          {PRIORITY_LABELS[t.priority]}
        </span>
      ),
    },
    {
      key: 'conditions',
      header: 'Condiciones',
      render: (t) => <span className="text-[13px] text-text-secondary">{summarizeConditions(t.conditions)}</span>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (t) => (
        <span className={cn('text-[13px]', t.is_active ? 'text-success' : 'text-text-tertiary')}>
          {t.is_active ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'views',
      header: 'Views',
      render: (t) => formatNumber(t.views_count),
    },
    {
      key: 'ctr',
      header: 'CTR',
      render: (t) => `${Math.round(t.click_rate * 100)}%`,
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (t) => (
        <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="ghost" onClick={() => setEditor(t)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant="ghost"
            loading={toggle.isPending}
            onClick={() => toggle.mutate({ id: t.id, is_active: !t.is_active })}
          >
            {t.is_active ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Copy size={12} />}
            loading={save.isPending}
            onClick={() => {
              const form = templateToForm(t);
              form.code = `${t.code}_copy`;
              form.name = `${t.name} (copia)`;
              void save.mutateAsync(formToPayload(form));
            }}
          >
            Duplicar
          </Button>
          <Button size="sm" variant="ghost" loading={archive.isPending} onClick={() => archive.mutate(t.id)}>
            Archivar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section>
      {stats && (
        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <StatCard label="Activos" value={formatNumber(stats.active_templates)} />
          <StatCard label="Views hoy" value={formatNumber(stats.views_today)} />
          <StatCard label="CTR promedio" value={`${Math.round(stats.avg_click_rate * 100)}%`} />
        </div>
      )}

      <div className="mb-4 flex justify-end">
        <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditor('new')}>
          Nuevo popup template
        </Button>
      </div>

      <Toolbar
        search={
          <SearchInput placeholder="Buscar por nombre..." value={search} onChange={(e) => setSearch(e.target.value)} />
        }
        filters={
          <>
            <FilterPill label="Todos triggers" active={trigger === 'all'} onClick={() => setTrigger('all')} />
            {(Object.keys(TRIGGER_LABELS) as LoginPopupTrigger[]).map((tr) => (
              <FilterPill key={tr} label={TRIGGER_LABELS[tr]} active={trigger === tr} onClick={() => setTrigger(tr)} />
            ))}
            <FilterPill label="Todas prioridades" active={priority === 'all'} onClick={() => setPriority('all')} />
            {(Object.keys(PRIORITY_LABELS) as LoginPopupPriority[]).map((p) => (
              <FilterPill key={p} label={PRIORITY_LABELS[p]} active={priority === p} onClick={() => setPriority(p)} />
            ))}
            <FilterPill label="Activos" active={status === 'active'} onClick={() => setStatus('active')} />
            <FilterPill label="Inactivos" active={status === 'inactive'} onClick={() => setStatus('inactive')} />
            <FilterPill label="Todos" active={status === 'all'} onClick={() => setStatus('all')} />
          </>
        }
      />

      {templates.length === 0 ? (
        <EmptyState
          title="Sin popup templates"
          description="Creá tu primer popup para mostrar al login del jugador."
          action={<Button variant="primary" onClick={() => setEditor('new')}>Crear popup</Button>}
        />
      ) : (
        <Table columns={columns} rows={templates} rowKey={(t) => t.id} onRowClick={(t) => setEditor(t)} />
      )}

      <LoginPopupFormModal
        open={editor !== null}
        template={editor === 'new' ? null : editor}
        existingCodes={existingCodes}
        onClose={() => setEditor(null)}
      />
    </section>
  );
}
