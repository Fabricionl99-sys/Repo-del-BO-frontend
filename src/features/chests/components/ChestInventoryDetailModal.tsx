import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { summarizeRewardConfig } from '@/features/chests/chestPrizeForm';
import { formatRelativeDate } from '@/lib/format';
import type { PlayerChestInventoryItem } from '@/types/chests';

const statusLabels = {
  unopened: 'no abierto',
  opened: 'abierto',
  expired: 'expirado',
} as const;

const viaLabels = {
  shop_purchase: 'tienda',
  mission_completed: 'misión',
  streak_completed: 'racha',
  level_up: 'level up',
  welcome: 'welcome',
  manual_grant: 'manual',
} as const;

export function ChestInventoryDetailModal({
  item,
  onClose,
}: {
  item: PlayerChestInventoryItem | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      title="Detalle de cofre entregado"
      size="md"
      footer={<Button variant="ghost" onClick={onClose}>Cerrar</Button>}
    >
      {item && (
        <div className="space-y-4 text-[15px]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[13px] text-text-tertiary">jugador</p>
              <p className="font-medium">{item.player_handle ?? item.player_id}</p>
            </div>
            <div>
              <p className="text-[13px] text-text-tertiary">tipo</p>
              <p className="font-medium">{item.chest_type_name}</p>
              <p className="font-mono text-[12px] text-text-tertiary">{item.chest_type_code}</p>
            </div>
            <div>
              <p className="text-[13px] text-text-tertiary">adquirido</p>
              <p>{formatRelativeDate(item.acquired_at)}</p>
            </div>
            <div>
              <p className="text-[13px] text-text-tertiary">trigger</p>
              <p>{viaLabels[item.acquired_via]}</p>
            </div>
            <div>
              <p className="text-[13px] text-text-tertiary">status</p>
              <p>{statusLabels[item.status]}</p>
            </div>
            <div>
              <p className="text-[13px] text-text-tertiary">expira</p>
              <p>{item.expires_at ? formatRelativeDate(item.expires_at) : '—'}</p>
            </div>
          </div>

          {item.prize_snapshot && (
            <div className="rounded-lg border border-border-subtle bg-bg-tertiary p-4">
              <p className="label-section mb-2">prize_snapshot (inmutable)</p>
              <p className="font-medium">{item.prize_snapshot.name}</p>
              <p className="text-[13px] text-text-secondary">{item.prize_snapshot.reward_type}</p>
              <p className="mt-1 text-[14px] text-text-secondary">
                {summarizeRewardConfig(item.prize_snapshot)}
              </p>
              <pre className="mt-3 overflow-x-auto rounded bg-bg-primary p-2 text-[12px] text-text-tertiary">
                {JSON.stringify(item.prize_snapshot.reward_config, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
