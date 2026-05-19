import type { WalletCryptoTopup } from '@/types/walletTopup';

export const walletTopupsStore: WalletCryptoTopup[] = [
  {
    id: 'top_001',
    amount_usd: 500,
    crypto: 'USDT',
    network: 'TRC20',
    amount_crypto: '500.00',
    deposit_address: 'TXyz9k2mPqR8vN4wL6hJ3fC1aB5dE7gH9',
    qr_payload: 'TXyz9k2mPqR8vN4wL6hJ3fC1aB5dE7gH9',
    status: 'completed',
    confirmations: 12,
    confirmations_required: 12,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    expires_at: new Date(Date.now() - 86400000 * 3 + 3600000).toISOString(),
    completed_at: new Date(Date.now() - 86400000 * 3 + 600000).toISOString(),
    tx_hash: '0xabc123def456',
  },
];

export function seedWalletTopup(
  body: { amount_usd: number; crypto: 'USDT' | 'USDC'; network: 'TRC20' | 'ERC20' },
): WalletCryptoTopup {
  const id = `top_${Date.now()}`;
  const rate = 1;
  const topup: WalletCryptoTopup = {
    id,
    amount_usd: body.amount_usd,
    crypto: body.crypto,
    network: body.network,
    amount_crypto: (body.amount_usd * rate).toFixed(2),
    deposit_address: `T${id.replace(/\D/g, '').slice(-8)}Social2GameDeposit`,
    qr_payload: `crypto:${body.crypto}:${body.network}:${body.amount_usd}`,
    status: 'pending',
    confirmations: 0,
    confirmations_required: 12,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    completed_at: null,
    tx_hash: null,
  };
  walletTopupsStore.unshift(topup);
  return topup;
}

/** Simula progreso on-chain en polls. */
export function advanceTopupStatus(id: string): WalletCryptoTopup | undefined {
  const t = walletTopupsStore.find((x) => x.id === id);
  if (!t || t.status === 'completed' || t.status === 'failed' || t.status === 'expired') return t;

  const age = Date.now() - new Date(t.created_at).getTime();
  if (age > 55 * 60 * 1000) {
    t.status = 'expired';
    return t;
  }
  if (t.status === 'pending' && age > 8000) {
    t.status = 'confirming';
    t.confirmations = 3;
    return t;
  }
  if (t.status === 'confirming') {
    t.confirmations = Math.min(t.confirmations_required, t.confirmations + 2);
    if (t.confirmations >= t.confirmations_required) {
      t.status = 'completed';
      t.completed_at = new Date().toISOString();
      t.tx_hash = `0x${id.slice(-8)}mock`;
    }
  }
  return t;
}
