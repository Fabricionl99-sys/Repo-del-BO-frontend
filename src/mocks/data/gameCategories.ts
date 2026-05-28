import type { GameCategoryRow } from '@/features/gameCategories/gameCategoriesApi';

export const mockGameCategories: GameCategoryRow[] = [
  { id: 1, display_name: 'Deportes', code: 'deportes' },
  { id: 2, display_name: 'Casino', code: 'casino' },
  { id: 3, display_name: 'Casino en vivo', code: 'casino_vivo' },
  { id: 4, display_name: 'Virtuales', code: 'virtuales' },
  { id: 5, display_name: 'Poker', code: 'poker' },
];

export function categoryIdFromSlug(slug: string): number {
  return mockGameCategories.find((c) => c.code === slug)?.id ?? 1;
}
