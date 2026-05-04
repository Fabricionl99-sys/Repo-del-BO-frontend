export type Role = 'admin' | 'editor' | 'moderator' | 'viewer';
export interface Operator { id:string; name:string; tier:'starter'|'growth'|'enterprise'; locale:string }
export interface User { id:string; name:string; email:string; role:Role; initials:string; operators:Operator[] }
export type Period = 'today' | '7d' | '30d' | '90d';
export type ConditionOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
export interface RuleCondition { field:string; operator:ConditionOperator; value:string | number | boolean | string[] }
