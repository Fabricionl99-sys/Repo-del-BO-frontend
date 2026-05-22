import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import type {
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

export function useCreateCryptoTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalletCryptoTopupRequest) =>
      apiClient
        .post('/admin/wallet/crypto/topup', {
          amount_usd: payload.amount_usd,
          crypto_currency: toBackendCryptoCurrency(payload.crypto, payload.network),
        })
        .then((r) => unwrapData<WalletCryptoTopup>(r.data))
        .then((res) => ({
          // Backend devuelve campos con nombres distintos. Mapeamos a lo
          // que el componente BO espera. Defaults para los que backend MVP
          // no expone aún (Sprint #7: confirmations, tx_hash).
          ...res,
          crypto: payload.crypto,
          network: payload.network,
          confirmations: (res as unknown as { confirmations?: number }).confirmations ?? 0,
          confirmations_required:
            (res as unknown as { confirmations_required?: number }).confirmations_required ?? 1,
          tx_hash: (res as unknown as { tx_hash?: string | null }).tx_hash ?? null,
          completed_at: (res as unknown as { completed_at?: string | null }).completed_at ?? null,
        })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet-topups'] });
    },
  });
}

export function useWalletTopup(id: string | null) {
  return useQuery({
    queryKey: ['wallet-topup', id],
    enabled: Boolean(id),
    queryFn: () => apiClient.get(`/admin/wallet/crypto/topup/${id}`).then((r) => unwrapData<WalletCryptoTopup>(r.data)),
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
