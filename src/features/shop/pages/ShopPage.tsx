import { Plus, ShoppingBag } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { FilterPill } from '@/components/ui/FilterPill';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Table, type Column } from '@/components/ui/Table';
import { Toolbar } from '@/components/ui/Toolbar';
import { isModuleActive } from '@/features/billing/moduleCatalog';
import { ShopProductCard } from '@/features/shop/components/ShopProductCard';
import { ShopProductFormModal } from '@/features/shop/components/ShopProductFormModal';
import { ShopPurchaseDetailModal } from '@/features/shop/components/ShopPurchaseDetailModal';
import { SHOP_CURRENCY_CODES, SHOP_REWARD_TYPES } from '@/features/shop/shopProductForm';
import { useShopProducts, useShopPurchases } from '@/features/shop/shopApi';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/cn';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import { useOperatorStore } from '@/stores/operatorStore';
import type { ShopProduct, ShopPurchase, ShopPurchaseDeliveryStatus, ShopRewardType } from '@/types/shop';

const tabs = ['Catálogo', 'Compras'] as const;
type Tab = (typeof tabs)[number];

const statusFilters: Array<'all' | 'active' | 'archived'> = ['all', 'active', 'archived'];

const purchaseStatusLabels: Record<ShopPurchaseDeliveryStatus, string> = {
  pending_delivery: 'pendiente',
  in_flight: 'en vuelo',
  delivered: 'entregado',
  failed_exhausted: 'falló',
  delivered_manually: 'manual',
  manual_pending_operator: 'manual pendiente',
};

export default function ShopPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const activeModuleCodes = useOperatorStore((s) => s.activeModuleCodes);
  const shopActive = isModuleActive(activeModuleCodes, 'shop');

  const [tab, setTab] = useState<Tab>('Catálogo');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [rewardFilter, setRewardFilter] = useState<ShopRewardType | 'all'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [editorProduct, setEditorProduct] = useState<ShopProduct | null | 'new'>(null);
  const [purchaseDetailId, setPurchaseDetailId] = useState<string | null>(null);

  const [purchaseStatus, setPurchaseStatus] = useState<ShopPurchaseDeliveryStatus | 'all'>('all');
  const [purchaseProductId, setPurchaseProductId] = useState<string | 'all'>('all');
  const [purchasePlayerSearch, setPurchasePlayerSearch] = useState('');
  const [purchaseFrom, setPurchaseFrom] = useState('');
  const [purchaseTo, setPurchaseTo] = useState('');
  const debouncedPlayerSearch = useDebounce(purchasePlayerSearch, 250);

  const productsQ = useShopProducts({
    status: statusFilter,
    reward_type: rewardFilter === 'all' ? undefined : rewardFilter,
    currency_code: currencyFilter === 'all' ? undefined : currencyFilter,
    search: debouncedSearch || undefined,
  });

  const purchasesQ = useShopPurchases({
    status: purchaseStatus === 'all' ? undefined : purchaseStatus,
    product_id: purchaseProductId === 'all' ? undefined : purchaseProductId,
    player_search: debouncedPlayerSearch || undefined,
    from: purchaseFrom || undefined,
    to: purchaseTo || undefined,
    limit: 50,
    offset: 0,
  });

  const products = mock === 'empty' ? [] : (productsQ.data ?? []);
  const purchases = mock === 'empty' ? [] : (purchasesQ.data?.items ?? []);
  const existingCodes = useMemo(() => products.map((p) => p.code), [products]);

  if (!shopActive && mock !== 'loading') {
    return (
      <>
        <PageHeader title="Tienda" subtitle="Productos canjeables por monedas" />
        <EmptyState
          icon={ShoppingBag}
          title="Módulo Tienda no activo"
          description="Activá el módulo shop desde el catálogo para gestionar productos y compras."
          action={
            <Link to="/modulos">
              <Button variant="primary">Ir a Módulos</Button>
            </Link>
          }
        />
      </>
    );
  }

  const catalogLoading = mock !== 'empty' && tab === 'Catálogo' && productsQ.isLoading;
  const purchasesLoading = mock !== 'empty' && tab === 'Compras' && purchasesQ.isLoading;
  if (mock === 'loading' || catalogLoading || purchasesLoading) {
    return <Loading label="Cargando tienda..." />;
  }

  if (mock === 'error' || productsQ.isError || purchasesQ.isError) {
    return (
      <ErrorState
        onRetry={() => {
          productsQ.refetch();
          purchasesQ.refetch();
        }}
      />
    );
  }

  const purchaseColumns: Column<ShopPurchase>[] = [
    {
      key: 'player',
      header: 'jugador',
      render: (r) => <span>{r.player_handle ?? r.player_id}</span>,
    },
    {
      key: 'product',
      header: 'producto',
      render: (r) => (
        <span>
          {r.product_name}
          <span className="ml-1 font-mono text-[12px] text-text-tertiary">{r.product_code}</span>
        </span>
      ),
    },
    {
      key: 'coins',
      header: 'monedas',
      render: (r) => (
        <span className="text-mono">
          {formatNumber(r.coins_paid)} {r.currency_code}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'fecha',
      render: (r) => <span className="text-[14px] text-text-secondary">{formatRelativeDate(r.purchased_at)}</span>,
    },
    {
      key: 'status',
      header: 'entrega',
      render: (r) => (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[12px] font-semibold uppercase',
            r.delivery_status === 'delivered' || r.delivery_status === 'delivered_manually'
              ? 'bg-success/15 text-success'
              : r.delivery_status === 'failed_exhausted'
                ? 'bg-danger/15 text-danger'
                : 'bg-bg-tertiary text-text-secondary',
          )}
        >
          {purchaseStatusLabels[r.delivery_status]}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Button size="sm" variant="ghost" onClick={() => setPurchaseDetailId(r.id)}>
          detalle
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Tienda"
        subtitle="Catálogo de productos y historial de compras cross-jugadores"
        actions={
          tab === 'Catálogo' ? (
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setEditorProduct('new')}>
              Nuevo producto
            </Button>
          ) : undefined
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
              tab === t
                ? 'border-b-2 border-accent text-accent'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Catálogo' && (
        <>
          <Toolbar
            search={
              <SearchInput
                placeholder="Buscar por nombre o code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            }
            filters={
              <>
                {statusFilters.map((f) => (
                  <FilterPill
                    key={f}
                    label={f === 'all' ? 'todos' : f}
                    count={
                      f === 'all'
                        ? products.length
                        : products.filter((p) => p.status === f).length
                    }
                    active={statusFilter === f}
                    onClick={() => setStatusFilter(f)}
                  />
                ))}
                {SHOP_REWARD_TYPES.map((rt) => (
                  <FilterPill
                    key={rt}
                    label={rt}
                    active={rewardFilter === rt}
                    onClick={() => setRewardFilter(rewardFilter === rt ? 'all' : rt)}
                  />
                ))}
                {SHOP_CURRENCY_CODES.map((c) => (
                  <FilterPill
                    key={c}
                    label={c}
                    active={currencyFilter === c}
                    onClick={() => setCurrencyFilter(currencyFilter === c ? 'all' : c)}
                  />
                ))}
              </>
            }
          />

          {products.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Sin productos"
              description="Creá el primer producto canjeable para tu tienda."
              action={
                <Button variant="primary" onClick={() => setEditorProduct('new')}>
                  Crear primer producto
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-4 gap-4 max-[1300px]:grid-cols-3 max-md:grid-cols-1">
              {products.map((p) => (
                <ShopProductCard key={p.id} product={p} onEdit={() => setEditorProduct(p)} />
              ))}
              <button
                type="button"
                onClick={() => setEditorProduct('new')}
                className="flex min-h-72 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-default text-text-tertiary hover:border-accent hover:text-accent"
              >
                <Plus />
                <span>agregar producto</span>
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'Compras' && (
        <>
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">status entrega</label>
              <select
                className="field py-1.5 text-[14px]"
                value={purchaseStatus}
                onChange={(e) => setPurchaseStatus(e.target.value as ShopPurchaseDeliveryStatus | 'all')}
              >
                <option value="all">todos</option>
                {(Object.keys(purchaseStatusLabels) as ShopPurchaseDeliveryStatus[]).map((s) => (
                  <option key={s} value={s}>
                    {purchaseStatusLabels[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">producto</label>
              <select
                className="field py-1.5 text-[14px]"
                value={purchaseProductId}
                onChange={(e) => setPurchaseProductId(e.target.value)}
              >
                <option value="all">todos</option>
                {productsQ.data?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">jugador</label>
              <SearchInput
                placeholder="handle o id..."
                value={purchasePlayerSearch}
                onChange={(e) => setPurchasePlayerSearch(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">desde</label>
              <input type="date" className="field py-1.5 text-[14px]" value={purchaseFrom} onChange={(e) => setPurchaseFrom(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-[13px] text-text-tertiary">hasta</label>
              <input type="date" className="field py-1.5 text-[14px]" value={purchaseTo} onChange={(e) => setPurchaseTo(e.target.value)} />
            </div>
          </div>

          <Table
            columns={purchaseColumns}
            rows={purchases}
            rowKey={(r) => r.id}
            onRowClick={(r) => setPurchaseDetailId(r.id)}
            emptyState={
              <EmptyState
                title="Sin compras"
                description="Aún no hay compras registradas en la tienda."
              />
            }
          />
        </>
      )}

      <ShopProductFormModal
        open={editorProduct !== null}
        product={editorProduct === 'new' ? null : editorProduct}
        existingCodes={existingCodes}
        onClose={() => setEditorProduct(null)}
      />

      <ShopPurchaseDetailModal purchaseId={purchaseDetailId} onClose={() => setPurchaseDetailId(null)} />
    </>
  );
}
