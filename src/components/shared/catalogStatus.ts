export type CatalogStatus = 'active' | 'inactive' | 'archived';

export function resolveCatalogStatus(item: {
  is_active?: boolean;
  archived_at?: string | null;
  status?: string;
}): CatalogStatus {
  if (item.archived_at || item.status === 'archived' || item.status === 'cancelled') {
    return 'archived';
  }
  if (item.is_active) return 'active';
  return 'inactive';
}
