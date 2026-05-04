import type { RuleCondition } from './shared';
export type MultiplierKind = 'permanent' | 'temporary' | 'event' | 'recurring';
export interface Multiplier { id:string; name:string; description:string; factor:number; kind:MultiplierKind; active:boolean; conditions:RuleCondition[]; conditionsLogic:'all'|'any'; schedule:{startsAt:string|null;endsAt:string|null;recurrence:'none'|'weekly'|'monthly'|'custom';recurrenceConfig?:{daysOfWeek?:number[];daysOfMonth?:number[]}}; appliedCountWeek:number; status:'active'|'paused'|'scheduled'|'expired'|'disabled' }
