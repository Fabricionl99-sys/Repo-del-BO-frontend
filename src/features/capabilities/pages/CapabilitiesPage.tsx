import { Radar, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Table, type Column } from '@/components/ui/Table';
import {
  useBulkUpdateCapabilities,
  useCapabilities,
  useCapabilityAuditLog,
  usePatchCapability,
  useUnsupportedConfigs,
} from '@/features/capabilities/capabilitiesApi';
import { CapabilityTable, filterByDimension } from '@/features/capabilities/components/CapabilityTable';
import { DetectNowModal } from '@/features/capabilities/components/DetectNowModal';
import { DIMENSION_TAB_LABELS } from '@/features/capabilities/capabilityLabels';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import type {
  CapabilityAuditEntry,
  CapabilityDimension,
  OperatorCapability,
  UnsupportedConfig,
} from '@/types/capabilities';

const tabs = [
  'Productos',
  'Tipos de bono',
  'Eventos',
  'Configs no soportadas',
  'Auditoría',
] as const;
type Tab = (typeof tabs)[number];

const tabToDimension: Partial<Record<Tab, CapabilityDimension>> = {
  Productos: 'products',
  'Tipos de bono': 'bonus_types',
  Eventos: 'events',
};

function capKey(row: OperatorCapability) {
  return `${row.dimension}:${row.capability}`;
}

export default function CapabilitiesPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const [tab, setTab] = useState<Tab>('Productos');
  const [detectOpen, setDetectOpen] = useState(false);
  const [localCaps, setLocalCaps] = useState<OperatorCapability[] | null>(null);
  const [pending, setPending] = useState<Map<string, { row: OperatorCapability; is_active: boolean }>>(new Map());
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const capsQ = useCapabilities();
  const auditQ = useCapabilityAuditLog(50);
  const unsupportedQ = useUnsupportedConfigs();
  const patchCap = usePatchCapability();
  const bulkUpdate = useBulkUpdateCapabilities();

  const serverCaps = mock === 'empty' ? [] : (capsQ.data?.capabilities ?? []);
  const capabilities = localCaps ?? serverCaps;
  const isEmpty = capabilities.length === 0;

  const dimension = tabToDimension[tab];

  const dimensionRows = useMemo(
    () => (dimension ? filterByDimension(capabilities, dimension) : []),
    [capabilities, dimension],
  );

  const pendingKeys = useMemo(() => new Set(pending.keys()), [pending]);

  const applyLocal = (updated: OperatorCapability) => {
    setLocalCaps((prev) => {
      const base = prev ?? serverCaps;
      return base.map((c) => (capKey(c) === capKey(updated) ? updated : c));
    });
  };

  const handleToggle = async (row: OperatorCapability, next: boolean) => {
    const key = capKey(row);
    setSavingKey(key);
    setPending((p) => new Map(p).set(key, { row, is_active: next }));
    applyLocal({ ...row, is_active: next, manual_override: true });
    try {
      await patchCap.mutateAsync({
        dimension: row.dimension,
        capability: row.capability,
        is_active: next,
        manual_override: true,
      });
      setPending((p) => {
        const n = new Map(p);
        n.delete(key);
        return n;
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handleReset = async (row: OperatorCapability) => {
    const key = capKey(row);
    setSavingKey(key);
    try {
      const updated = await patchCap.mutateAsync({
        dimension: row.dimension,
        capability: row.capability,
        is_active: row.is_detected,
        manual_override: false,
      });
      applyLocal(updated);
    } finally {
      setSavingKey(null);
    }
  };

  const saveAllPending = async () => {
    if (pending.size === 0) return;
    const updates = [...pending.values()].map(({ row, is_active }) => ({
      dimension: row.dimension,
      capability: row.capability,
      is_active,
      manual_override: true,
    }));
    await bulkUpdate.mutateAsync({ updates });
    setPending(new Map());
    setLocalCaps(null);
  };

  if (mock === 'loading' || capsQ.isLoading) {
    return <Loading label="Cargando capabilities..." />;
  }

  if (mock === 'error' || capsQ.isError) {
    return <ErrorState onRetry={() => capsQ.refetch()} />;
  }

  if (isEmpty) {
    return (
      <>
        <PageHeader title="Capacidades" subtitle="Qué soporta tu plataforma · productos, bonos y eventos" />
        <EmptyState
          icon={SlidersHorizontal}
          title="Sin capabilities detectadas"
          description="Ejecutá la primera detección para mapear productos, tipos de bono y eventos de tu operador."
          action={
            <Button variant="primary" icon={<Radar size={14} />} onClick={() => setDetectOpen(true)}>
              Ejecutar primera detección
            </Button>
          }
        />
        <DetectNowModal open={detectOpen} onClose={() => { setDetectOpen(false); capsQ.refetch(); }} />
      </>
    );
  }

  const auditColumns: Column<CapabilityAuditEntry>[] = [
    { key: 'at', header: 'fecha', render: (r) => formatRelativeDate(r.created_at) },
    { key: 'dim', header: 'dimensión', render: (r) => r.dimension },
    { key: 'cap', header: 'capability', render: (r) => r.capability_label },
    { key: 'action', header: 'acción', render: (r) => r.action },
    { key: 'actor', header: 'actor', render: (r) => r.actor_email },
    { key: 'detail', header: 'detalle', render: (r) => r.detail ?? '—' },
  ];

  const unsupportedColumns: Column<UnsupportedConfig>[] = [
    { key: 'module', header: 'módulo', render: (r) => r.source_module },
    { key: 'path', header: 'config', render: (r) => <code className="text-[12px]">{r.config_path}</code> },
    { key: 'reason', header: 'razón', render: (r) => r.reason },
    { key: 'sample', header: 'ejemplo', render: (r) => r.sample_value ?? '—' },
    { key: 'at', header: 'detectado', render: (r) => formatRelativeDate(r.detected_at) },
  ];

  return (
    <>
      <PageHeader
        title="Capacidades"
        subtitle={
          capsQ.data?.last_detection_at
            ? `Última detección: ${formatRelativeDate(capsQ.data.last_detection_at)}`
            : 'Qué soporta tu plataforma'
        }
        actions={
          <Button variant="secondary" icon={<Radar size={14} />} onClick={() => setDetectOpen(true)}>
            Detectar ahora
          </Button>
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
              tab === t ? 'border-b-2 border-accent text-accent' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {dimension && (
        <>
          <p className="mb-3 text-[14px] text-text-secondary">
            {DIMENSION_TAB_LABELS[dimension]} · {dimensionRows.filter((r) => r.is_active).length} activos de{' '}
            {dimensionRows.length}
          </p>
          <CapabilityTable
            rows={dimensionRows}
            pendingKeys={pendingKeys}
            onToggle={handleToggle}
            onReset={handleReset}
            savingKey={savingKey}
          />
        </>
      )}

      {tab === 'Configs no soportadas' && (
        unsupportedQ.isLoading ? (
          <Loading label="Cargando configs..." />
        ) : (
          <Table
            columns={unsupportedColumns}
            rows={unsupportedQ.data ?? []}
            rowKey={(r) => r.id}
            emptyState={<EmptyState title="Sin configs no soportadas" description="Todo mapeado correctamente." />}
          />
        )
      )}

      {tab === 'Auditoría' && (
        auditQ.isLoading ? (
          <Loading label="Cargando auditoría..." />
        ) : (
          <Table columns={auditColumns} rows={auditQ.data ?? []} rowKey={(r) => r.id} />
        )
      )}

      {pending.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border-default bg-bg-secondary px-4 py-3 shadow-modal">
          <span className="text-[14px] font-semibold">{pending.size} cambios pendientes</span>
          <Button variant="primary" loading={bulkUpdate.isPending} onClick={saveAllPending}>
            Guardar todos los cambios
          </Button>
        </div>
      )}

      <DetectNowModal
        open={detectOpen}
        onClose={() => {
          setDetectOpen(false);
          setLocalCaps(null);
          capsQ.refetch();
        }}
      />
    </>
  );
}
