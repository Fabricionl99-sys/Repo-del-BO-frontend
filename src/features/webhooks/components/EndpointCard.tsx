import { Archive, BarChart3, Copy, Pencil, Play, RotateCw, ScrollText } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { copyToClipboard } from '@/features/apiKeys/apiKeysUtils';
import { formatRelativeDate } from '@/lib/format';
import { toast } from '@/stores/toastStore';
import type { RewardEndpoint } from '@/types/webhooks';

export function EndpointCard({
  endpoint,
  onEdit,
  onTest,
  onDeliveries,
  onStats,
  onRotate,
  onArchive,
}: {
  endpoint: RewardEndpoint;
  onEdit: () => void;
  onTest: () => void;
  onDeliveries: () => void;
  onStats: () => void;
  onRotate: () => void;
  onArchive: () => void;
}) {
  const copyUrl = async () => {
    const ok = await copyToClipboard(endpoint.url);
    if (ok) toast.success('URL copiada');
  };
  const lastActivity = endpoint.last_used_at ?? endpoint.last_success_at ?? endpoint.created_at;

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary">{endpoint.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${
                endpoint.environment === 'production'
                  ? 'bg-accent/15 text-accent'
                  : 'bg-info/15 text-info'
              }`}
            >
              {endpoint.environment}
            </span>
            <StatusPill status={endpoint.is_active ? 'active' : 'archived'} label={endpoint.is_active ? 'activo' : 'inactivo'} />
          </div>
        </div>
        <button type="button" onClick={() => void copyUrl()} className="text-text-tertiary hover:text-text-primary" title="Copiar URL">
          <Copy size={14} />
        </button>
      </div>
      <p className="mb-2 truncate font-mono text-[11px] text-text-secondary" title={endpoint.url}>
        {endpoint.url}
      </p>
      <p className="mb-3 text-[11px] text-text-tertiary">
        Última actividad: <span className="text-text-secondary">{formatRelativeDate(lastActivity)}</span>
      </p>
      {endpoint.stats && (
        <div className="mb-3 grid grid-cols-3 gap-2 text-center">
          {[
            ['Éxito', `${endpoint.stats.success_rate}%`],
            ['Latencia', `${endpoint.stats.avg_latency_ms}ms`],
            ['24h', String(endpoint.stats.deliveries_24h)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border-subtle bg-bg-tertiary px-2 py-1.5">
              <p className="text-[9px] uppercase text-text-tertiary">{label}</p>
              <p className="text-mono text-[12px] font-semibold">{value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mb-4 flex flex-wrap gap-1">
        {endpoint.subscribed_events.map((ev) => (
          <span key={ev} className="rounded-full border border-border-subtle bg-bg-tertiary px-2 py-0.5 text-[10px] text-text-secondary">
            {ev}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-3">
        <Button size="sm" variant="ghost" icon={<Pencil size={13} />} onClick={onEdit}>
          Editar
        </Button>
        <Button size="sm" variant="secondary" icon={<Play size={13} />} onClick={onTest}>
          Test
        </Button>
        <Button size="sm" variant="ghost" icon={<ScrollText size={13} />} onClick={onDeliveries}>
          Ver entregas
        </Button>
        <Button size="sm" variant="ghost" icon={<BarChart3 size={13} />} onClick={onStats}>
          Stats
        </Button>
        <Button size="sm" variant="ghost" icon={<RotateCw size={13} />} onClick={onRotate}>
          Rotar HMAC
        </Button>
        {endpoint.is_active && (
          <Button size="sm" variant="danger" icon={<Archive size={13} />} onClick={onArchive}>
            Archivar
          </Button>
        )}
      </div>
    </div>
  );
}
