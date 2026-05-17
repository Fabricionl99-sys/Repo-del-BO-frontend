import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { useShopPurchase } from '@/features/shop/shopApi';
import { formatRelativeDate } from '@/lib/format';

function formatPurchaseDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

const statusLabels: Record<string, string> = {
  pending_delivery: 'pendiente',
  in_flight: 'en vuelo',
  delivered: 'entregado',
  failed_exhausted: 'falló',
  delivered_manually: 'manual',
  manual_pending_operator: 'manual pendiente',
};

export function ShopPurchaseDetailModal({
  purchaseId,
  onClose,
}: {
  purchaseId: string | null;
  onClose: () => void;
}) {
  const q = useShopPurchase(purchaseId);
  const purchase = q.data;

  return (
    <Modal
      open={Boolean(purchaseId)}
      onClose={onClose}
      title="Detalle de compra"
      description={purchaseId ?? undefined}
      footer={<Button onClick={onClose}>Cerrar</Button>}
    >
      {q.isLoading && <Loading label="Cargando compra..." />}
      {purchase && (
        <dl className="space-y-3 text-[15px]">
          <div>
            <dt className="text-text-tertiary">Jugador</dt>
            <dd>{purchase.player_handle ?? purchase.player_id}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Producto</dt>
            <dd>
              {purchase.product_name}{' '}
              <span className="font-mono text-[13px] text-text-tertiary">({purchase.product_code})</span>
            </dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Monedas pagadas</dt>
            <dd className="text-mono">
              {purchase.coins_paid} {purchase.currency_code}
            </dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Fecha</dt>
            <dd title={formatRelativeDate(purchase.purchased_at)}>{formatPurchaseDate(purchase.purchased_at)}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">Estado entrega</dt>
            <dd>{statusLabels[purchase.delivery_status] ?? purchase.delivery_status}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">reward_type</dt>
            <dd>{purchase.reward_type}</dd>
          </div>
          <div>
            <dt className="text-text-tertiary">reward_snapshot</dt>
            <dd>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-bg-tertiary p-2 text-[13px]">
                {JSON.stringify(purchase.reward_snapshot, null, 2)}
              </pre>
            </dd>
          </div>
        </dl>
      )}
    </Modal>
  );
}
