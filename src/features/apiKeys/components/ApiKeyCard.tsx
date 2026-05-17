import { FileText, RotateCw, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { formatMaskedKey } from '@/features/apiKeys/apiKeysUtils';
import { formatRelativeDate } from '@/lib/format';
import type { ApiKey } from '@/types/apiKeys';

export function ApiKeyCard({
  apiKey,
  onViewLogs,
  onRotate,
  onRevoke,
}: {
  apiKey: ApiKey;
  onViewLogs: () => void;
  onRotate: () => void;
  onRevoke: () => void;
}) {
  const status = apiKey.is_active ? 'active' : 'archived';

  return (
    <div className="rounded-xl border border-border-subtle bg-bg-secondary p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary">{apiKey.name}</h3>
          <code className="mt-1 block font-mono text-[14px] text-text-secondary">{formatMaskedKey(apiKey)}</code>
        </div>
        <StatusPill status={status} label={apiKey.is_active ? 'activa' : 'revocada'} />
      </div>
      <p className="mb-3 text-[13px] text-text-tertiary">
        Último uso:{' '}
        <span className="text-text-secondary">
          {apiKey.last_used_at ? formatRelativeDate(apiKey.last_used_at) : 'sin uso'}
        </span>
      </p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {apiKey.permissions.map((p) => (
          <span key={p} className="rounded-full border border-border-subtle bg-bg-tertiary px-2 py-0.5 text-[12px] text-text-secondary">
            {p}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-border-subtle pt-3">
        <Button size="sm" variant="ghost" icon={<FileText size={13} />} onClick={onViewLogs}>
          Ver logs
        </Button>
        {apiKey.is_active && (
          <>
            <Button size="sm" variant="secondary" icon={<RotateCw size={13} />} onClick={onRotate}>
              Rotar
            </Button>
            <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={onRevoke}>
              Revocar
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
