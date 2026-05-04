import type { Role } from '@/types/shared';
export type Action='team.manage'|'apikeys.manage'|'branding.edit'|'metrics.view'|'config.edit'|'moderation.review';
const PERMISSIONS:Record<Role,(Action|'*')[]>={admin:['*'],editor:['config.edit','metrics.view'],moderator:['moderation.review','metrics.view'],viewer:['metrics.view']};
export function isAllowed(role:Role,action:Action){const p=PERMISSIONS[role];return p.includes('*')||p.includes(action)}
