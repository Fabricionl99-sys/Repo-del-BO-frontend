import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { queryClient } from '@/api/queryClient';
import type { BillingMode, BillingStatus } from '@/types/billing';
import type { Operator } from '@/types/shared';

interface OperatorState {
  current: Operator | null;
  available: Operator[];
  activeModuleCodes: string[] | null;
  billingMode: BillingMode | null;
  walletBalanceUsd: number | null;
  billingStatus: BillingStatus | null;
  walletLowBalanceThresholdUsd: number | null;
  setCurrent: (op: Operator) => void;
  setAvailable: (ops: Operator[]) => void;
  setActiveModules: (codes: string[] | null) => void;
  setBillingSnapshot: (snapshot: {
    billing_mode: BillingMode;
    wallet_balance_usd: number;
    wallet_low_balance_threshold_usd: number;
    status: BillingStatus;
  }) => void;
}

export const useOperatorStore = create<OperatorState>()(
  persist(
    (set) => ({
      current: null,
      available: [],
      activeModuleCodes: null,
      billingMode: null,
      walletBalanceUsd: null,
      billingStatus: null,
      walletLowBalanceThresholdUsd: null,
      setCurrent: (op) => {
        set({ current: op });
        queryClient.invalidateQueries();
      },
      setAvailable: (ops) => set({ available: ops }),
      setActiveModules: (codes) => set({ activeModuleCodes: codes }),
      setBillingSnapshot: (snapshot) =>
        set({
          billingMode: snapshot.billing_mode,
          walletBalanceUsd: snapshot.wallet_balance_usd,
          walletLowBalanceThresholdUsd: snapshot.wallet_low_balance_threshold_usd,
          billingStatus: snapshot.status,
        }),
    }),
    { name: 'niveles_operator', partialize: (s) => ({ current: s.current }) },
  ),
);
