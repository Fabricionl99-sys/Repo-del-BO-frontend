import { PackageX } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/format';
import type { ShopProduct } from '@/types/shop';

export function ShopProductCard({
  product,
  onEdit,
}: {
  product: ShopProduct;
  onEdit: () => void;
}) {
  const archived = product.status === 'archived';
  const outOfStock = product.stock !== null && product.stock <= 0;
  const lowStock = product.stock !== null && product.stock > 0 && product.stock <= 10;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary transition hover:-translate-y-0.5 hover:border-border-default ${
        archived || !product.is_active ? 'opacity-70' : ''
      }`}
    >
      <div className="relative aspect-square bg-bg-tertiary">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-text-tertiary">
            <PackageX size={32} />
          </div>
        )}
        {archived && (
          <span className="absolute left-2 top-2 rounded bg-bg-primary/80 px-2 py-0.5 text-[10px] font-semibold uppercase">
            archivado
          </span>
        )}
        {!archived && !product.is_active && (
          <span className="absolute left-2 top-2 rounded bg-warning/90 px-2 py-0.5 text-[10px] font-semibold text-bg-primary">
            inactivo
          </span>
        )}
        {outOfStock && !archived && (
          <span className="absolute left-2 top-2 rounded bg-danger/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            sin stock
          </span>
        )}
        {lowStock && !outOfStock && (
          <span className="absolute right-2 top-2 rounded bg-warning/90 px-2 py-0.5 text-[10px] font-semibold text-bg-primary">
            stock bajo
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="label-section mb-1">{product.reward_type}</div>
        <h4 className="line-clamp-2 text-[13px] font-medium">{product.name}</h4>
        <p className="mb-1 font-mono text-[10px] text-text-tertiary">{product.code}</p>
        <p className="mb-2 line-clamp-2 text-[11px] text-text-tertiary">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-mono text-[14px] font-semibold text-accent">
            {formatNumber(product.cost_in_coins)}{' '}
            <span className="text-[11px] text-text-tertiary">{product.currency_code}</span>
          </span>
          <span className="text-[10px] text-text-tertiary">
            stock: {product.stock === null ? '∞' : product.stock}
          </span>
        </div>
        <Button size="sm" variant="ghost" className="mt-3 w-full" onClick={onEdit}>
          {archived ? 'ver detalle' : 'editar'}
        </Button>
      </div>
    </div>
  );
}
