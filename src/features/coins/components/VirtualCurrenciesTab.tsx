import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { IconButton } from '@/components/ui/IconButton';
import { Loading } from '@/components/ui/Loading';
import { Switch } from '@/components/ui/Switch';
import { Table, type Column } from '@/components/ui/Table';
import { formatNumber } from '@/lib/format';
import { useCoins, useDeleteCoin, useSetCoinActive } from '@/features/coinsApi';
import type { Coin, CoinDeliveryMode } from '@/types/coins';

import { CurrencyEditorModal } from './CurrencyEditorModal';
import { CurrencyIcon } from './CurrencyIcon';

const modeLabel = (m: CoinDeliveryMode) => (m === 'auto_xp' ? 'Por XP' : 'Manual');

function isVirtualCoin(coin: Coin) {
  return !coin.globalCurrencyId;
}

export function VirtualCurrenciesTab({ forceEmpty }: { forceEmpty?: boolean }) {
  const q = useCoins();
  const setActive = useSetCoinActive();
  const del = useDeleteCoin();
  const allCoins = forceEmpty ? [] : (q.data ?? []);
  const coins = allCoins.filter(isVirtualCoin);
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState<Coin | null>(null);

  const openNew = () => {
    setEditing(null);
    setEditor(true);
  };
  const openEdit = (coin: Coin) => {
    setEditing(coin);
    setEditor(true);
  };

  const columns: Column<Coin>[] = [
    {
      key: 'icon',
      header: 'Ícono',
      width: '64px',
      render: (c) => <CurrencyIcon coin={c} />,
    },
    { key: 'name', header: 'Moneda', render: (c) => <span className="font-medium">{c.name}</span> },
    { key: 'sym', header: 'Código', render: (c) => <span className="text-mono text-text-secondary">{c.symbol}</span> },
    { key: 'mode', header: 'Modo', render: (c) => <span>{modeLabel(c.deliveryMode)}</span> },
    {
      key: 'on',
      header: 'Activa',
      render: (c) => (
        <Switch
          checked={c.active}
          disabled={setActive.isPending}
          onChange={(active) => setActive.mutate({ id: c.id, active })}
          aria-label={`activar ${c.name}`}
        />
      ),
    },
    {
      key: 'circ',
      header: 'En circulación',
      render: (c) => (
        <span className="text-mono text-[15px]">{formatNumber(c.totalInCirculation, { compact: true })}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <IconButton icon={Pencil} title="editar" size="sm" onClick={() => openEdit(c)} />
          {!c.isDefault ? (
            <IconButton
              icon={Trash2}
              title="eliminar"
              size="sm"
              onClick={() => {
                if (confirm(`¿Desactivar moneda ${c.name}?`)) del.mutate(c.id);
              }}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-[15px] text-text-secondary">
          Monedas inventadas por vos (Gold, Coins, Gemas) usadas como recompensas en misiones / cofres / tienda.
        </p>
        <Button variant="primary" icon={<Plus size={14} />} onClick={openNew}>
          Nueva Moneda Virtual
        </Button>
      </div>

      {q.isLoading && !forceEmpty ? <Loading label="Cargando monedas virtuales..." /> : null}
      {(q.isError && !forceEmpty) ? <ErrorState onRetry={() => q.refetch()} /> : null}

      {!q.isLoading && !q.isError && coins.length === 0 ? (
        <EmptyState
          title="No hay monedas virtuales"
          description="Creá monedas de juego para recompensas, tienda y cofres."
          action={
            <Button variant="primary" onClick={openNew}>
              Nueva Moneda Virtual
            </Button>
          }
        />
      ) : null}

      {coins.length > 0 ? (
        <div className="card p-5">
          <Table columns={columns} rows={coins} rowKey={(c) => c.id} />
        </div>
      ) : null}

      <CurrencyEditorModal
        open={editor}
        onClose={() => {
          setEditor(false);
          setEditing(null);
        }}
        initial={editing}
      />
    </div>
  );
}
