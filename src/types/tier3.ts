import type { RuleCondition, Reward, Targeting, Availability, Tier } from './shared';
export type MissionType = 'daily' | 'weekly' | 'monthly' | 'one_time' | 'event';
export interface Mission { id:string; name:string; description:string; iconKey:string; category:string; type:MissionType; objective:{type:'counter'|'streak'|'first_time'|'reach_level'|'custom';event?:string;targetValue:number;filters:RuleCondition[]}; rewards:Reward[]; availability:Availability; targeting:Targeting; status:'active'|'paused'|'draft'|'expired'; progress:{started:number;completed:number}; updatedAt:string }
export type Rarity = 'common'|'rare'|'epic'|'legendary';
export type RewardType = 'coins'|'xp'|'chest'|'item'|'bonus';
export interface ChestReward { id:string; probability:number; type:RewardType; amount?:number; label:string; coinId?:string }
export interface Chest { id:string; name:string; description:string; rarity:Rarity; iconKey:string; stock:{kind:'unlimited'}|{kind:'fixed';remaining:number}; rewards:ChestReward[]; obtainMethod:{kind:'shop'|'reward'|'login_drop'|'event';shopPrice?:{amount:number;coinId:string}}; availability:Availability; status:'active'|'draft'|'archived' }
export interface DayReward { dayNumber:number; isMilestone:boolean; rewards:Reward[] }
export interface RewardsCycle { id:string; name:string; durationDays:number; resetMode:'on_complete'|'on_streak_break'; targeting:Targeting; days:DayReward[]; active:boolean; createdAt:string }
export type TournamentStatus = 'draft'|'scheduled'|'live'|'finished'|'cancelled';
export interface Tournament { id:string; name:string; description:string; bannerUrl?:string; iconKey:string; kind:'leaderboard'|'versus'|'streak'|'group_mission'; metric:{event:string;aggregation:'count'|'sum_amount'}; filters:RuleCondition[]; startsAt:string; endsAt:string; recurrence?:{interval:'daily'|'weekly'|'monthly';autoCreateNext:boolean}; prizePool:Array<{position:string;rewards:Reward[]}>; eligibility:{target:'all'|'vip_tier_or_higher'|'segment';vipTierThreshold?:Tier;segmentId?:string}; entry:{mode:'auto'|'opt_in';cost?:{amount:number;coinId:string}}; status:TournamentStatus; participantsCount:number }
