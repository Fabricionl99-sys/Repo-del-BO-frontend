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

export function useCreateCryptoTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalletCryptoTopupRequest) =>
      apiClient.post('/admin/wallet/topup', payload).then((r) => unwrapData<WalletCryptoTopup>(r.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet-topups'] });
    },
  });
}

export function useWalletTopup(id: string | null) {
  return useQuery({
    queryKey: ['wallet-topup', id],
    enabled: Boolean(id),
    queryFn: () => apiClient.get(`/admin/wallet/topup/${id}`).then((r) => unwrapData<WalletCryptoTopup>(r.data)),
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
        .get('/admin/wallet/topups', { params })
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
