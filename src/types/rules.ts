import type { GameCategory } from './expandedTier5';
import type { RuleCondition } from './shared';
export type RuleStatus = 'active' | 'paused' | 'draft' | 'archived';
export type RuleCategory = GameCategory;
export type TriggerEvent = 'bet_placed';
export interface XPAction { xpBase: number; xpPerAmount?: { xp: number; amount: number; currency?: string }; xpMaxPerEvent?: number | null }
export interface RuleBoost { enabled:boolean; multiplier:1.5|2|3|5; starts_at:string; ends_at:string; scope:'all'|'category'; category_code?:RuleCategory }
export interface XPRule { id:string; name:string; description:string; status:RuleStatus; category:RuleCategory; trigger:{event:TriggerEvent;category?:RuleCategory}; conditionsLogic:'all'|'any'; conditions:RuleCondition[]; action:XPAction; boost?:RuleBoost; createdAt:string; updatedAt:string; createdBy:{name:string;initials:string} }
export interface RuleListItem { id:string; name:string; description:string; category:RuleCategory; xpDisplay:{value:string;perUnit?:string}; status:RuleStatus; updatedAt:string; active:boolean; boost?:RuleBoost }
export const UNIVERSAL_EVENTS:TriggerEvent[]=['bet_placed'];
export const EVENTS_BY_CATEGORY: Partial<Record<RuleCategory, TriggerEvent[]>>={};
