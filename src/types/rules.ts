import type { GameCategory } from './expandedTier5';
import type { RuleCondition } from './shared';
export type RuleStatus = 'active' | 'paused' | 'draft' | 'archived';
export type RuleCategory = GameCategory;
export type TriggerEvent = 'bet_placed' | 'bet_won' | 'session_started' | 'session_ended' | 'game_played' | 'live_dealer_tip' | 'live_table_joined' | 'sport_combo_placed' | 'sport_inplay_bet' | 'sport_cashout' | 'crash_cashout' | 'crash_auto_cashout_set' | 'deposit' | 'withdrawal' | 'login' | 'registration' | 'kyc_completed' | 'custom';
export interface XPAction { xpBase: number; xpPerAmount?: { xp: number; amount: number; currency?: string }; xpMaxPerEvent?: number | null; alsoCoins?: { amount: number; currencyId: string } }
export interface RuleBoost { enabled:boolean; multiplier:2|3|5; starts_at:string; ends_at:string }
export interface XPRule { id:string; name:string; description:string; status:RuleStatus; category:RuleCategory; trigger:{event:TriggerEvent;category?:RuleCategory}; conditionsLogic:'all'|'any'; conditions:RuleCondition[]; action:XPAction; boost?:RuleBoost; createdAt:string; updatedAt:string; createdBy:{name:string;initials:string} }
export interface RuleListItem { id:string; name:string; description:string; category:RuleCategory; xpDisplay:{value:string;perUnit?:string}; status:RuleStatus; updatedAt:string; active:boolean; boost?:RuleBoost }
export const UNIVERSAL_EVENTS:TriggerEvent[]=['bet_placed','bet_won','session_started','session_ended','game_played','deposit','withdrawal','login','registration','kyc_completed','custom'];
export const EVENTS_BY_CATEGORY: Partial<Record<RuleCategory, TriggerEvent[]>>={sports:['bet_placed','bet_won','sport_combo_placed','sport_inplay_bet','sport_cashout','deposit','withdrawal','login','registration','kyc_completed','custom'],live_casino:['bet_placed','bet_won','game_played','live_dealer_tip','live_table_joined','deposit','withdrawal','login','registration','kyc_completed','custom'],crash_only:['bet_placed','bet_won','crash_cashout','crash_auto_cashout_set','deposit','withdrawal','login','custom']};
