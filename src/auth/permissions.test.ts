import { describe, expect, it } from 'vitest'; import { isAllowed } from './permissions';
describe('permisos',()=>{it('admin puede todo y viewer no gestiona equipo',()=>{expect(isAllowed('admin','team.manage')).toBe(true); expect(isAllowed('viewer','team.manage')).toBe(false); expect(isAllowed('editor','config.edit')).toBe(true); expect(isAllowed('moderator','moderation.review')).toBe(true)})});
