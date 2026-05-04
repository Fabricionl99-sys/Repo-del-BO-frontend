import type { RuleCondition, Tier } from './shared';
export type ModerationItemKind='post'|'comment'; export type FlagKind='auto_filter'|'reported_by_users'|'new_player'|'previous_warnings';
export interface ModerationItem{ id:string; kind:ModerationItemKind; flags:FlagKind[]; flagReason?:string; content:{text:string;imageUrl?:string}; author:{userId:string;handle:string;level:number;joinedDaysAgo:number;previousWarnings:number}; postedAt:string; reactionsCount:number; reportsCount:number; contextUrl?:string }
export interface ModerationStats{inQueue:number;approvedLast24h:number;rejectedLast24h:number;avgResponseMinutes:number}
export interface KpiSet{mau:{value:number;trend:{direction:'up'|'down'|'flat';percentChange:number;comparedTo:string}};dau:{value:number;trend:{direction:'up'|'down'|'flat';percentChange:number;comparedTo:string}};stickiness:{value:number;trend:{direction:'up'|'down'|'flat';percentChange:number;comparedTo:string}};retention:{d7:number;d30:number}}
export interface FunnelStep{step:string;label:string;count:number;conversionFromPrevious:number}
export interface VipDistribution{tier:Tier;count:number;percentage:number}
export interface HeatmapCell{dayOfWeek:number;hourOfDay:number;count:number;intensity:number}
export interface BrandingConfig{palette:{primary:string;secondary:string;background:string;textPrimary:string;textSecondary:string;accentGlow:string};typography:{fontFamily:'urbanist'|'inter'|'manrope'|'custom';customFontUrl?:string;baseSize:14|15|16};density:'compact'|'medium'|'spacious';images:{logo?:string;favicon?:string;bannerDefault?:string;avatarFallback?:string};texts:Record<string,string>;publishedAt:string|null;updatedAt:string}
export interface PalettePreset{id:'nightclub'|'casino-classic'|'crypto'|'minimal';name:string;palette:BrandingConfig['palette']}
export interface TournamentLite{ id:string; name:string; filters:RuleCondition[] }
