export type RaffleStatus = 'draft' | 'open' | 'drawing' | 'closed' | 'cancelled';
export type RafflePrizeType = 'bonus' | 'physical';

export interface RaffleRow {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string;
  image_url: string | null;
  entry_cost_currency_id: string;
  entry_cost_amount: number;
  max_entries_per_player: number;
  winner_count: number;
  one_prize_per_player: boolean;
  min_level: number;
  vip_only: boolean;
  status: RaffleStatus;
  starts_at: string;
  deadline: string;
  drawn_at: string | null;
  total_entries: number;
  server_seed_commitment: string;
  server_seed_revealed: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface RafflePrizeRow {
  id: string;
  raffle_id: string;
  tenant_id: string;
  position: number;
  prize_type: RafflePrizeType;
  prize_bonus_id: string | null;
  prize_physical_name: string | null;
  prize_physical_image_url: string | null;
  prize_physical_value_usd: number | null;
  prize_physical_notes: string | null;
  created_at: string;
}

export interface RaffleDetail extends RaffleRow {
  prizes: RafflePrizeRow[];
}

export interface RaffleWinnerRow {
  id: string;
  raffle_id: string;
  tenant_id: string;
  raffle_prize_id: string;
  player_state_id: string;
  player_external_id: string;
  entry_id: string;
  winning_ticket_number: number;
  position: number;
  prize_type: RafflePrizeType;
  prize_physical_name: string | null;
  notified_at: string | null;
  pending_reward_id: string | null;
  physical_delivered_at: string | null;
  physical_delivered_by: string | null;
  physical_delivery_notes: string | null;
  created_at: string;
  raffle_name?: string;
}

export interface RafflePrizeUpsert {
  position: number;
  prize_type: RafflePrizeType;
  prize_bonus_id?: string | null;
  prize_physical_name?: string | null;
  prize_physical_image_url?: string | null;
  prize_physical_value_usd?: number | null;
  prize_physical_notes?: string | null;
}

export interface RaffleCreatePayload {
  code: string;
  name: string;
  description?: string;
  image_url?: string | null;
  entry_cost_currency_id: string;
  entry_cost_amount?: number;
  max_entries_per_player?: number;
  winner_count?: number;
  one_prize_per_player?: boolean;
  min_level?: number;
  vip_only?: boolean;
  starts_at: string;
  deadline: string;
  prizes: RafflePrizeUpsert[];
}

export type RaffleUpdatePayload = Partial<Omit<RaffleCreatePayload, 'prizes'>>;

export interface RaffleFilters {
  status?: RaffleStatus | 'all';
  search?: string;
}
