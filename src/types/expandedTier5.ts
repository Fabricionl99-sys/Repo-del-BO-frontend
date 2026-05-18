export type GameCategory='deportes'|'casino'|'casino_vivo'|'virtuales'|'poker';
export interface CategoryOption{value:GameCategory;label:string;description:string}
export const CATEGORIES:CategoryOption[]=[{value:'deportes',label:'Deportes',description:'sportsbook y apuestas deportivas'},{value:'casino',label:'Casino',description:'slots, bingo, crash y RNG'},{value:'casino_vivo',label:'Casino en vivo',description:'juegos con dealer humano'},{value:'virtuales',label:'Virtuales',description:'partidos virtuales y lotería'},{value:'poker',label:'Poker',description:'cash, torneos y sit & go'}];
import type { BillingMode, BillingStatus } from '@/types/billing';

export interface OperatorConfig {
  commercial_name: string;
  legal_name: string;
  country: string;
  website: string;
  logo_url: string;
  timezone: string;
  fiat_currency: string;
  bo_locale: string;
  widget_default_locale: string;
  date_format: 'DMY' | 'MDY';
  time_format: 'H24' | 'H12';
  first_day_of_week: 'monday' | 'sunday';
  daily_reset_policy: 'operator_tz' | 'player_tz';
  weekly_reset_policy: 'operator_tz' | 'player_tz';
  mission_reset_policy: 'operator_tz' | 'player_tz';
  month_end_policy: 'calendar' | 'rolling_30d';
  alerts_email: string;
  reports_email: string;
  webhook_url?: string;
  terms_url: string;
  privacy_url: string;
  min_player_age: 18 | 21;
  game_catalog: Record<GameCategory, boolean>;
  billing_mode: BillingMode;
  wallet_balance_usd: number;
  wallet_low_balance_threshold_usd: number;
  status: BillingStatus;
}
export type RankingId='best_xp'|'best_casino'|'best_live_casino'|'best_sports'|'best_virtuals'|'best_poker'|'best_depositors'|'best_vip';
export type RankingWindow='daily'|'weekly'|'monthly'|'all_time'; export type RankingVisibility='public'|'vip_only'|'by_country'|'anonymous';
export interface PrizeRow{position_label:string;position_from:number;position_to:number;amount:number;prize_type:'coins'|'coins_plus_chest'|'coins_plus_multiplier'|'xp_boost'}
export interface Ranking{id:RankingId;name:string;description:string;icon:string;metric_label:string;requires_category:GameCategory|null;active:boolean;window:RankingWindow;visibility:RankingVisibility;prizes:PrizeRow[];current_participants:number;total_distributed_this_period:number;closes_at:string}
export interface LeaderboardEntry{position:number;player_handle:string;player_avatar_seed:string;metric_value:number;change:number|null;vip_tier?:'gold'|'silver'|'bronze';verified:boolean}
