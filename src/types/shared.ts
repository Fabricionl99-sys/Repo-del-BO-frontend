// 'owner' es el rol post-signup del backend (creator del tenant). 'editor'/
// 'moderator' son del modelo legacy; mantenidos por compat. ProtectedRoute
// usa este enum para validar rutas con roles=[...].
export type Role = 'owner' | 'admin' | 'editor' | 'moderator' | 'viewer';
export interface Operator { id:string; name:string; tier:'starter'|'growth'|'enterprise'|'pro'; locale:string; timezone?: string }
export interface User { id:string; name:string; email:string; role:Role; initials:string; operators:Operator[] }
export type Period = 'today' | '7d' | '30d' | '90d';
export type ConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
export interface RuleCondition { field:string; operator:ConditionOperator; value:string | number | boolean | string[] }

export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type RewardType = 'xp' | 'coins' | 'chest' | 'product' | 'bonus';
export interface Reward { type: RewardType; xpAmount?: number; coinsAmount?: number; coinId?: string; chestId?: string; productId?: string; bonusType?: 'deposit_match' | 'free_bet' | 'free_spins'; bonusConfig?: Record<string, unknown> }
export interface Targeting { allPlayers: boolean; segmentId?: string; vipTierThreshold?: Tier }
export interface Availability { alwaysAvailable: boolean; startsAt?: string; endsAt?: string; daysOfWeek?: number[]; startTime?: string; endTime?: string }
