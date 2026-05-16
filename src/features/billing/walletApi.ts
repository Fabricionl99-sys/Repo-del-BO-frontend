import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import type {
  WalletBalance,
  WalletTopupRequest,
  WalletTransaction,
  WalletTransactionsResponse,
} from '@/types/billing';

export interface WalletTransactionsParams {
  limit?: number;
  offset?: number;
  transaction_type?: string;
}

export function useWalletBalance() {
  return useQuery({
    queryKey: ['wallet-balance'],
    queryFn: () => apiClient.get('/admin/wallet/balance').then((r) => unwrapData<WalletBalance>(r.data)),
  });
}

export function useWalletTransactions(params: WalletTransactionsParams = {}) {
  return useQuery({
    queryKey: ['wallet-transactions', params],
    queryFn: () =>
      apiClient
        .get('/admin/wallet/transactions', { params })
        .then((r) => unwrapData<WalletTransactionsResponse>(r.data)),
  });
}

export function useWalletTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalletTopupRequest) =>
      apiClient.post('/admin/wallet/topup', payload).then((r) => unwrapData<WalletTransaction>(r.data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet-balance'] });
      qc.invalidateQueries({ queryKey: ['wallet-transactions'] });
      qc.invalidateQueries({ queryKey: ['operator-billing'] });
    },
  });
}
