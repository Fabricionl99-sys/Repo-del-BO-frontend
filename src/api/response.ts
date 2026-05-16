/** Helpers para respuestas `{ data: T }` del backend (api-shapes.md). */

export function unwrapData<T>(body: unknown): T {
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export interface ApiPagination {
  limit: number;
  offset: number;
  total: number;
}

export function unwrapPaginatedList<T>(body: unknown): { items: T[]; pagination: ApiPagination } {
  if (body && typeof body === 'object') {
    const o = body as Record<string, unknown>;
    if (Array.isArray(o.data) && o.pagination && typeof o.pagination === 'object') {
      const p = o.pagination as ApiPagination;
      return { items: o.data as T[], pagination: p };
    }
    if (Array.isArray(o.items) && typeof o.total === 'number') {
      return {
        items: o.items as T[],
        pagination: {
          limit: Number(o.limit ?? 50),
          offset: Number(o.offset ?? 0),
          total: o.total,
        },
      };
    }
    if (Array.isArray(o.data)) {
      const items = o.data as T[];
      return { items, pagination: { limit: items.length, offset: 0, total: items.length } };
    }
  }
  return { items: [], pagination: { limit: 50, offset: 0, total: 0 } };
}
