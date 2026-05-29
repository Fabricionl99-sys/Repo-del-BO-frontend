import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import type {
  CryptoAsset,
  CryptoNetwork,
  WalletCryptoTopup,
  WalletCryptoTopupRequest,
  WalletTopupsListParams,
  WalletTopupsListResponse,
  WalletTopupStatus,
} from '@/types/walletTopup';

/**
 * Sprint #6 fix: el BO envía { crypto, network } pero el backend espera
 * crypto_currency formato NOWPayments (e.g. 'usdttrc20', 'usdcerc20').
 * Combina los 2 campos → 1 string lowercase concatenado.
 */
function toBackendCryptoCurrency(crypto: string, network: string): string {
  return `${crypto.toLowerCase()}${network.toLowerCase()}`;
}

/** Backend wallet topup row (field names vary by provider). */
type BackendWalletTopup = Partial<WalletCryptoTopup> & {
  pay_address?: string;
  payment_url?: string;
  invoice_url?: string;
};

/** QR must encode pay_address / qr_payload — never payment_url or invoice_url. */
function mapWalletTopup(
  raw: BackendWalletTopup,
  request?: WalletCryptoTopupRequest,
): WalletCryptoTopup {
  const payAddress = String(raw.pay_address ?? raw.deposit_address ?? '');
  const qrPayload = String(raw.qr_payload ?? raw.pay_address ?? raw.deposit_address ?? '');

  return {
    id: String(raw.id ?? ''),
    amount_usd: Number(raw.amount_usd ?? 0),
    crypto: request?.crypto ?? (raw.crypto as CryptoAsset) ?? 'USDT',
    network: request?.network ?? (raw.network as CryptoNetwork) ?? 'TRC20',
    amount_crypto: String(raw.amount_crypto ?? ''),
    deposit_address: payAddress,
    qr_payload: qrPayload,
    status: (raw.status as WalletTopupStatus) ?? 'pending',
    confirmations: raw.confirmations ?? 0,
    confirmations_required: raw.confirmations_required ?? 1,
    created_at: String(raw.created_at ?? new Date().toISOString()),
    expires_at: String(raw.expires_at ?? new Date().toISOString()),
    completed_at: raw.completed_at ?? null,
    tx_hash: raw.tx_hash ?? null,
  };
}

export function useCreateCryptoTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalletCryptoTopupRequest) =>
      apiClient
        .post('/admin/wallet/crypto/topup', {
          amount_usd: payload.amount_usd,
          crypto_currency: toBackendCryptoCurrency(payload.crypto, payload.network),
        })
        .then((r) => unwrapData<BackendWalletTopup>(r.data))
        .then((res) => mapWalletTopup(res, payload)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet-topups'] });
    },
  });
}

export function useWalletTopup(id: string | null) {
  return useQuery({
    queryKey: ['wallet-topup', id],
    enabled: Boolean(id),
    queryFn: () =>
      apiClient
        .get(`/admin/wallet/crypto/topup/${id}`)
        .then((r) => unwrapData<BackendWalletTopup>(r.data))
        .then((res) => mapWalletTopup(res)),
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      if (status === 'pending' || status === 'confirming') return 3000;
      return false;
    },
  });
}

export function useWalletTopups(params: WalletTopupsListParams = {}) {
  return useQuery({
    queryKey: ['wallet-topups', params],
    queryFn: () =>
      apiClient
        .get('/admin/wallet/crypto/topups', { params })
        .then((r) => unwrapData<WalletTopupsListResponse>(r.data)),
  });
}

export const TOPUP_STATUS_LABELS: Record<WalletTopupStatus, string> = {
  pending: 'Esperando pago',
  confirming: 'Confirmando',
  completed: 'Completada',
  failed: 'Fallida',
  expired: 'Expirada',
};
