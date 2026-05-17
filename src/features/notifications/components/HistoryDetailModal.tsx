import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatRelativeDate } from '@/lib/format';
import type { NotificationHistoryItem } from '@/types/notifications';

import { CHANNEL_LABELS, TRIGGER_EVENT_LABELS } from '../notificationVariables';

const statusColor: Record<string, string> = {
  sent: 'text-text-secondary',
  delivered: 'text-success',
  failed: 'text-danger',
  opened: 'text-info',
  clicked: 'text-accent',
};

export function HistoryDetailModal({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: NotificationHistoryItem | null;
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalle de envío"
      description={`${item.player_handle} · ${formatRelativeDate(item.sent_at)}`}
      footer={<Button variant="ghost" onClick={onClose}>Cerrar</Button>}
    >
      <dl className="grid grid-cols-2 gap-3 text-[13px] max-md:grid-cols-1">
        <div>
          <dt className="text-text-tertiary">jugador</dt>
          <dd>{item.player_handle}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">template</dt>
          <dd>{item.template_name}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">canal</dt>
          <dd>{CHANNEL_LABELS[item.channel_type]}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">trigger</dt>
          <dd>{TRIGGER_EVENT_LABELS[item.trigger_event]}</dd>
        </div>
        <div>
          <dt className="text-text-tertiary">estado</dt>
          <dd className={statusColor[item.delivery_status]}>{item.delivery_status}</dd>
        </div>
      </dl>
      {item.subject_snapshot && (
        <p className="mt-4 text-[12px]">
          <span className="text-text-tertiary">subject: </span>
          {item.subject_snapshot}
        </p>
      )}
      <pre className="mt-3 max-h-48 overflow-auto rounded-lg border border-border-subtle bg-bg-tertiary p-3 text-[12px] whitespace-pre-wrap">
        {item.body_snapshot}
      </pre>
      {item.error_message && (
        <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger">
          {item.error_message}
        </p>
      )}
    </Modal>
  );
}
