export type CryptoAsset = 'USDT' | 'USDC';
export type CryptoNetwork = 'TRC20' | 'ERC20';
export type WalletTopupStatus = 'pending' | 'confirming' | 'completed' | 'failed' | 'expired';

export interface WalletCryptoTopupRequest {
  amount_usd: number;
  crypto: CryptoAsset;
  network: CryptoNetwork;
}

export interface WalletCryptoTopup {
  id: string;
  amount_usd: number;
  crypto: CryptoAsset;
  network: CryptoNetwork;
  amount_crypto: string;
  deposit_address: string;
  qr_payload: string;
  status: WalletTopupStatus;
  confirmations: number;
  confirmations_required: number;
  created_at: string;
  expires_at: string;
  completed_at: string | null;
  tx_hash: string | null;
}

export interface WalletTopupsListParams {
  status?: WalletTopupStatus;
  crypto?: CryptoAsset;
  limit?: number;
  offset?: number;
}

export interface WalletTopupsListResponse {
  items: WalletCryptoTopup[];
  total: number;
  limit: number;
  offset: number;
}
