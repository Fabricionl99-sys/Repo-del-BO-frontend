export type BillingMode = 'manual' | 'wallet';
export type BillingStatus = 'active' | 'suspended' | 'pending';
export type PaymentMethod = 'crypto' | 'bank_transfer' | 'card';
export type TransactionType = 'topup' | 'charge' | 'refund' | 'adjustment';

export type ModuleCode =
  | 'xp_engine'
  | 'coins'
  | 'streaks'
  | 'missions'
  | 'shop'
  | 'rewards_delivery'
  | 'chests'
  | 'wheels'
  | 'tournaments'
  | 'predictions'
  | 'raffles'
  | 'rankings'
  | 'avatars'
  | 'branding'
  | 'multi_currency'
  | 'notifications'
  | 'news'
  | 'social';

export interface WalletBalance {
  wallet_balance_usd: number;
  wallet_low_balance_threshold_usd: number;
  billing_mode: BillingMode;
  status: BillingStatus;
}

export interface WalletTransaction {
  id: string;
  transaction_type: TransactionType;
  amount_usd: number;
  reason: string;
  notes: string | null;
  balance_after_usd: number;
  created_at: string;
}

export interface WalletTransactionsResponse {
  items: WalletTransaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface WalletTopupRequest {
  amount_usd: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
}

export interface ModulePublic {
  code: ModuleCode;
  name: string;
  description: string;
  price_usd_monthly: number;
  category: string;
}

export interface OperatorActiveModulePublic {
  code: ModuleCode;
  activated_at: string;
  pending_deactivation: boolean;
  pending_deactivation_at: string | null;
  operator_price_usd_monthly: number;
}

export interface OperatorBillingSnapshot {
  billing_mode: BillingMode;
  wallet_balance_usd: number;
  wallet_low_balance_threshold_usd: number;
  status: BillingStatus;
}
