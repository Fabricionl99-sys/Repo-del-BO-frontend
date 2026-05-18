import { describe, expect, it } from 'vitest';

import { summarizeConditions } from '@/features/notifications/loginPopupForm';
import { filterLoginPopupTemplates, loginPopupTemplates } from '@/mocks/data/loginPopups';

describe('loginPopups mocks', () => {
  it('tiene 6 templates seedeados', () => {
    expect(loginPopupTemplates).toHaveLength(6);
    expect(loginPopupTemplates.some((t) => t.priority === 'urgent')).toBe(true);
  });

  it('filtra por status activo', () => {
    const params = new URLSearchParams({ status: 'active' });
    const list = filterLoginPopupTemplates(params);
    expect(list.every((t) => t.is_active)).toBe(true);
  });

  it('resume condiciones', () => {
    const t = loginPopupTemplates[0]!;
    expect(summarizeConditions(t.conditions).length).toBeGreaterThan(0);
  });
});
