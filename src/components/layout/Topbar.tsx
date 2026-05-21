import { Bell, HelpCircle, LogOut, Plus, Search, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { IconButton } from '@/components/ui/IconButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/auth/AuthProvider';
import { useWalletBalance } from '@/features/billing/walletApi';
import { ROUTE_TITLES } from '@/lib/routeTitles';
import { useOperatorStore } from '@/stores/operatorStore';

/** Formato corto para el badge: $250 / $10k / $1.2k. */
function formatUsdShort(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

export function Topbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const op = useOperatorStore((s) => s.current);
  const title = ROUTE_TITLES['/' + location.pathname.split('/')[1]] ?? 'Próximamente';

  // Wallet badge: visible solo en modo billing=wallet (manual/invoice no
  // tiene UX de saldo). Click → /wallet (movements). Plus → /wallet?tab=crypto
  // (topup NOWPayments). Color warning si balance < threshold.
  const balanceQ = useWalletBalance();
  const balance = balanceQ.data ? Number(balanceQ.data.wallet_balance_usd) : null;
  const threshold = balanceQ.data ? Number(balanceQ.data.wallet_low_balance_threshold_usd) : null;
  const isWallet = balanceQ.data?.billing_mode === 'wallet';
  const lowBalance = balance !== null && threshold !== null && balance < threshold;

  return (
    <div className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border-subtle bg-bg-primary px-7">
      <nav className="flex items-center gap-2 text-[14px] text-text-secondary">
        <span>{op?.name ?? 'Casino Astral'}</span>
        <span className="text-text-tertiary">/</span>
        <span className="font-semibold text-text-primary">{title}</span>
      </nav>
      <div className="flex items-center gap-3">
        {isWallet && balance !== null && (
          <div
            className={`flex items-center gap-1 rounded-full border px-1 py-1 text-[13px] font-semibold ${
              lowBalance
                ? 'border-warning/40 bg-warning/10 text-warning'
                : 'border-border-subtle bg-bg-secondary text-text-primary'
            }`}
            title={`Saldo wallet${lowBalance ? ' (bajo)' : ''}`}
          >
            <Link
              to="/wallet"
              className="flex items-center gap-1.5 rounded-full px-2 py-0.5 hover:opacity-80"
            >
              <Wallet size={14} />
              <span className="tabular-nums">{formatUsdShort(balance)}</span>
            </Link>
            <Link
              to="/wallet?tab=crypto"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-accent hover:bg-accent/30"
              title="Depositar (crypto)"
            >
              <Plus size={12} />
            </Link>
          </div>
        )}
        <ThemeToggle />
        <IconButton icon={Search} title="Buscar (⌘K)" />
        <IconButton icon={Bell} title="Notificaciones" hasDot />
        <IconButton icon={HelpCircle} title="Ayuda" />
        <button className="flex items-center gap-2 rounded-full border border-border-subtle bg-bg-secondary py-1 pl-1.5 pr-3 hover:bg-bg-hover">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-info to-purple text-[14px] font-semibold text-text-onAccent">
            {user?.initials}
          </div>
          <div className="text-left leading-tight">
            <div className="text-[15px] font-semibold">{user?.name}</div>
            <div className="text-[14px] text-text-secondary">{user?.role}</div>
          </div>
        </button>
        <IconButton icon={LogOut} title="Salir" onClick={logout} />
      </div>
    </div>
  );
}
