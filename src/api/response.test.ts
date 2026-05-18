import { describe, expect, it } from 'vitest';

import { coerceToList, unwrapData, unwrapDataList, unwrapPaginatedList } from '@/api/response';

describe('unwrapData', () => {
  it('extrae data wrapper', () => {
    expect(unwrapData<{ id: string }>({ data: { id: '1' } })).toEqual({ id: '1' });
  });

  it('pasa through sin wrapper', () => {
    expect(unwrapData<number>(42)).toBe(42);
  });
});

describe('coerceToList / unwrapDataList', () => {
  it('acepta array directo', () => {
    expect(coerceToList<number>([1, 2])).toEqual([1, 2]);
  });

  it('extrae pools anidado', () => {
    expect(unwrapDataList<{ id: string }>({ data: { pools: [{ id: 'a' }] } }, ['pools'])).toEqual([
      { id: 'a' },
    ]);
  });

  it('devuelve [] si no hay lista', () => {
    expect(unwrapDataList<string>({ data: { total: 0 } })).toEqual([]);
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
