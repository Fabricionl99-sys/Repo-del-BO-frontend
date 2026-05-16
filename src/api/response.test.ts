import { describe, expect, it } from 'vitest';

import { unwrapData, unwrapPaginatedList } from '@/api/response';

describe('unwrapData', () => {
  it('extrae data wrapper', () => {
    expect(unwrapData<{ id: string }>({ data: { id: '1' } })).toEqual({ id: '1' });
  });

  it('pasa through sin wrapper', () => {
    expect(unwrapData<number>(42)).toBe(42);
  });
});

describe('unwrapPaginatedList', () => {
  it('lee data + pagination', () => {
    const r = unwrapPaginatedList<{ id: string }>({
      data: [{ id: 'a' }],
      pagination: { limit: 50, offset: 0, total: 1 },
    });
    expect(r.items).toHaveLength(1);
    expect(r.pagination.total).toBe(1);
  });

  it('compat legacy items', () => {
    const r = unwrapPaginatedList<{ id: string }>({ items: [{ id: 'b' }], total: 1, limit: 50, offset: 0 });
    expect(r.items[0].id).toBe('b');
  });
});
