import type { RuleCondition } from './shared';
export type RuleStatus = 'active' | 'paused' | 'draft' | 'archived';
export type RuleCategory = 'sports' | 'slots' | 'poker' | 'casino' | 'bingo' | 'deposit' | 'social' | 'login' | 'custom';
export type TriggerEvent = 'bet_placed' | 'game_played' | 'deposit' | 'login' | 'feed_post' | 'custom';
export interface XPAction { xpBase: number; xpPerAmount?: { xp: number; amount: number; currency?: string }; xpMaxPerEvent?: number | null; alsoCoins?: { amount: number; currencyId: string } }
export interface XPRule { id:string; name:string; description:string; status:RuleStatus; category:RuleCategory; trigger:{event:TriggerEvent;category?:RuleCategory}; conditionsLogic:'all'|'any'; conditions:RuleCondition[]; action:XPAction; applicableMultiplierIds:string[]; createdAt:string; updatedAt:string; createdBy:{name:string;initials:string} }
export interface RuleListItem { id:string; name:string; description:string; category:RuleCategory; xpDisplay:{value:string;perUnit?:string}; status:RuleStatus; updatedAt:string; active:boolean }
