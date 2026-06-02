import { Gift, Plus, RefreshCw, UserCircle2, Wallet } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { StatusPill } from '@/components/ui/StatusPill';
import { Table } from '@/components/ui/Table';
import { GrantAvatarsModal } from '@/features/players/components/GrantAvatarsModal';
import { GrantChestsModal } from '@/features/players/components/GrantChestsModal';
import { GrantCoinsModal } from '@/features/players/components/GrantCoinsModal';
import { GrantXpModal } from '@/features/players/components/GrantXpModal';
import { SetCurrencyModal } from '@/features/players/components/SetCurrencyModal';
import { usePlayerDetail } from '@/features/players/playersApi';
import { formatNumber, formatRelativeDate } from '@/lib/format';
import type { AdminPlayerSummary } from '@/types/players';

type DetailTab = 'wallet';

export function PlayerDetailPanel({
  playerId,
  summary,
}: {
  playerId: string;
  summary: AdminPlayerSummary;
}) {
  const detailQ = usePlayerDetail(playerId);
  const [tab, setTab] = useState<DetailTab>('wallet');
  const [avatarsOpen, setAvatarsOpen] = useState(false);
  const [chestsOpen, setChestsOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [xpOpen, setXpOpen] = useState(false);
  const [coinsOpen, setCoinsOpen] = useState(false);

  const player = detailQ.data?.player ?? summary;
  const primaryCoin = player.coins[0]?.currency_code;

  const refresh = () => {
    void detailQ.refetch();
  };

  if (detailQ.isLoading && !detailQ.data) {
    return <Loading label="Cargando jugador..." />;
  }

  if (detailQ.isError) {
    return <ErrorState onRetry={refresh} />;
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <UserCircle2 className="h-5 w-5 text-accent" />
              <h2 className="text-[20px] font-bold">{player.external_player_id}</h2>
              <StatusPill status="live" label={`Nivel ${player.current_level}`} />
            </div>
            <p className="mt-2 text-[14px] text-text-secondary">
              {formatNumber(Number(player.total_xp))} XP total
            </p>
            <div className="mt-3 grid gap-1 text-[13px] text-text-tertiary sm:grid-cols-2">
              <span>Registro: {formatRelativeDate(player.created_at)}</span>
              <span>Última actividad: {formatRelativeDate(player.last_event_at)}</span>
            </div>
            <p className="mt-2 font-mono text-[12px] text-text-tertiary">{player.id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={refresh}>
              Refrescar
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setAvatarsOpen(true)}>
              Entregar avatares
            </Button>
            <Button variant="secondary" size="sm" icon={<Gift size={14} />} onClick={() => setChestsOpen(true)}>
              Entregar cofres
            </Button>
            <Button variant="primary" size="sm" icon={<Wallet size={14} />} onClick={() => setCurrencyOpen(true)}>
              Cambiar moneda
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 border-b border-border-subtle pb-2">
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-[14px] font-semibold ${
            tab === 'wallet' ? 'bg-bg-tertiary text-text-primary' : 'text-text-tertiary'
          }`}
          onClick={() => setTab('wallet')}
        >
          Wallet
        </button>
      </div>

      {tab === 'wallet' ? (
        <Card className="overflow-hidden p-0">
          <Table
            columns={[
              {
                key: 'currency',
                header: 'Moneda',
                render: (row) => row.currency,
              },
              {
                key: 'balance',
                header: 'Balance',
                align: 'right',
                render: (row) => row.balance,
              },
            ]}
            rows={player.coins.map((coin) => ({
              id: coin.currency_code,
              currency: (
                <span className="font-medium text-text-primary">
                  {coin.currency_code}
                  {coin.currency_code === primaryCoin ? (
                    <span className="ml-2 text-[12px] text-accent">principal</span>
                  ) : null}
                </span>
              ),
              balance: formatNumber(Number(coin.balance)),
            }))}
            rowKey={(row) => row.id}
            emptyState={<p className="p-4 text-[14px] text-text-tertiary">Sin balances de moneda</p>}
          />
          <div className="flex flex-wrap gap-2 border-t border-border-subtle p-4">
            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setXpOpen(true)}>
              Dar XP
            </Button>
            <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={() => setCoinsOpen(true)}>
              Dar monedas
            </Button>
          </div>
        </Card>
      ) : null}

      <GrantAvatarsModal
        open={avatarsOpen}
        playerId={playerId}
        onClose={() => setAvatarsOpen(false)}
        onGranted={refresh}
      />
      <GrantChestsModal
        open={chestsOpen}
        playerId={playerId}
        onClose={() => setChestsOpen(false)}
        onGranted={refresh}
      />
      <SetCurrencyModal
        open={currencyOpen}
        playerId={playerId}
        currentCode={primaryCoin}
        onClose={() => setCurrencyOpen(false)}
        onSaved={refresh}
      />
      <GrantXpModal
        open={xpOpen}
        playerId={playerId}
        onClose={() => setXpOpen(false)}
        onGranted={refresh}
      />
      <GrantCoinsModal
        open={coinsOpen}
        playerId={playerId}
        onClose={() => setCoinsOpen(false)}
        onGranted={refresh}
      />
    </div>
  );
}

export function PlayerDetailEmpty() {
  return (
    <EmptyState
      title="Seleccioná un jugador"
      description="Elegí un jugador de la lista para ver su wallet y ejecutar acciones manuales."
    />
  );
}
