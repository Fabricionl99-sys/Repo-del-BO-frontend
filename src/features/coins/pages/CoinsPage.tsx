import { useState } from 'react';
import { Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { IconButton } from '@/components/ui/IconButton';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Switch } from '@/components/ui/Switch';
import { Table, type Column } from '@/components/ui/Table';
import { formatNumber } from '@/lib/format';
import { useCoins, useDeleteCoin, useSetCoinActive } from '@/features/coinsApi';
import type { Coin, CoinDeliveryMode } from '@/types/coins';
import { CurrencyEditorModal } from '../components/CurrencyEditorModal';

const modeLabel = (m: CoinDeliveryMode) => (m === 'auto_xp' ? 'Por XP' : 'Manual');

export default function CoinsPage() {
  const [params] = useSearchParams();
  const mock = params.get('mockState');
  const q = useCoins();
  const setActive = useSetCoinActive();
  const del = useDeleteCoin();
  const coins = mock === 'empty' ? [] : (q.data ?? []);
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
      key: 'img',
      header: '',
      width: '56px',
      render: (c) =>
        c.imageUrl ? (
          <img src={c.imageUrl} alt="" className="h-9 w-9 rounded-md border border-border-subtle object-cover" />
        ) : (
          <span className="text-xl">{c.emoji ?? '🪙'}</span>
        ),
    },
    { key: 'name', header: 'Moneda', render: (c) => <span className="font-medium">{c.name}</span> },
    { key: 'sym', header: 'Símbolo', render: (c) => <span className="text-mono text-text-secondary">{c.symbol}</span> },
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
      render: (c) => <span className="text-mono text-[15px]">{formatNumber(c.totalInCirculation, { compact: true })}</span>,
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
                if (confirm(`¿Eliminar moneda ${c.name}?`)) del.mutate(c.id);
              }}
            />
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Monedas"
        subtitle="Configurá los tipos de monedas virtuales, modo de entrega y reglas anti-abuso."
        actions={
          <>
            <Button icon={<Download size={14} />}>exportar</Button>
            <Button variant="primary" icon={<Plus size={14} />} onClick={openNew}>
              nueva moneda
            </Button>
          </>
        }
      />

      <div className="mb-7 grid grid-cols-4 gap-4 max-md:grid-cols-2">
        <StatCard label="monedas activas" value={coins.filter((c) => c.active).length} hint="config por moneda" />
        <StatCard label="modo automático" value={coins.filter((c) => c.deliveryMode === 'auto_xp').length} />
        <StatCard label="modo manual" value={coins.filter((c) => c.deliveryMode === 'manual').length} />
        <StatCard label="P2P habilitado" value={coins.filter((c) => c.p2p.enabled).length} />
      </div>

      {mock === 'empty' && coins.length === 0 && (
        <EmptyState
          title="No hay monedas configuradas"
          description="Creá tu moneda principal para conectar reglas, tienda y recompensas."
          action={
            <Button variant="primary" onClick={openNew}>
              Crear moneda
            </Button>
          }
        />
      )}
      {(mock === 'loading' || q.isLoading) && <Loading label="Cargando monedas..." />}
      {(mock === 'error' || q.isError) && <ErrorState onRetry={() => q.refetch()} />}
      {mock !== 'empty' && mock !== 'loading' && mock !== 'error' && !q.isLoading && !q.isError && coins.length === 0 && (
        <EmptyState
          title="No hay monedas configuradas"
          description="Creá tu moneda principal para conectar reglas, tienda y recompensas."
          action={
            <Button variant="primary" onClick={openNew}>
              Crear moneda
            </Button>
          }
        />
      )}
      {coins.length > 0 && (
        <div className="card p-5">
          <Table columns={columns} rows={coins} rowKey={(c) => c.id} />
        </div>
      )}

      <CurrencyEditorModal
        open={editor}
        onClose={() => {
          setEditor(false);
          setEditing(null);
        }}
        initial={editing}
      />
    </>
  );
}
