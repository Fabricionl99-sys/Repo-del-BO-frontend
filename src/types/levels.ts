export interface LevelEntry { level:number; xpRequired:number; isMilestone:boolean; notes?:string; isLocked?:boolean }
export interface LevelsCurve { version:number; totalLevels:number; formula:{xpBase:number; multiplier:number; exponent:number}|null; levels:LevelEntry[]; updatedAt:string; publishedAt:string|null }
export interface CurvePreset { id:'casual'|'balanced'|'vip-focused'|'exponential'; name:string; description:string; miniChart:number[]; formula:{xpBase:number; multiplier:number; exponent:number} }
export interface PlayerDistribution { level:number; count:number }
export interface CurvePreview { affectedPlayers:number; levelChanges:Array<{fromLevel:number;toLevel:number;playersCount:number}> }
