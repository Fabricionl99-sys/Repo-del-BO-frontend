import { Modal } from '@/components/ui/Modal';
import { formatRelativeDate } from '@/lib/format';
import type { ApiRequestLog } from '@/types/apiKeys';

export function RequestLogDetailModal({
  open,
  log,
  onClose,
}: {
  open: boolean;
  log: ApiRequestLog | null;
  onClose: () => void;
}) {
  if (!log) return null;

  return (
    <Modal open={open} onClose={onClose} title="Detalle de request" size="lg">
      <div className="space-y-4 text-[15px]">
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          <div>
            <p className="label-section">endpoint</p>
            <code className="font-mono text-[14px]">
              {log.method} {log.endpoint}
            </code>
          </div>
          <div>
            <p className="label-section">timestamp</p>
            <p>{formatRelativeDate(log.created_at)}</p>
          </div>
          <div>
            <p className="label-section">status</p>
            <p className={log.status_code >= 400 ? 'text-danger' : 'text-success'}>{log.status_code}</p>
          </div>
          <div>
            <p className="label-section">duración</p>
            <p className="text-mono">{log.duration_ms}ms</p>
          </div>
          <div>
            <p className="label-section">IP</p>
            <code className="font-mono text-[14px]">{log.ip_address}</code>
          </div>
          <div>
            <p className="label-section">user agent</p>
            <p className="text-text-tertiary">{log.user_agent}</p>
          </div>
        </div>
        {log.error_message && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-danger">{log.error_message}</div>
        )}
        <div>
          <p className="label-section mb-2">request headers</p>
          <pre className="overflow-x-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px]">
            {JSON.stringify(log.request_headers ?? {}, null, 2)}
          </pre>
        </div>
        <div>
          <p className="label-section mb-2">response headers</p>
          <pre className="overflow-x-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px]">
            {JSON.stringify(log.response_headers ?? {}, null, 2)}
          </pre>
        </div>
        <div>
          <p className="label-section mb-2">body snippet</p>
          <pre className="overflow-x-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 font-mono text-[13px]">
            {log.request_body_snippet}
          </pre>
        </div>
      </div>
    </Modal>
  );
}
