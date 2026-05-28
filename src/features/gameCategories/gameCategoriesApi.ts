import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/api/client';
import { unwrapData } from '@/api/response';
import type { RuleCategory } from '@/types/rules';

export interface GameCategoryRow {
  id: number;
  display_name: string;
  code: string;
}

/** Backend real IDs (1–5). Used when API is unavailable. */
export const FALLBACK_GAME_CATEGORIES: GameCategoryRow[] = [
  { id: 1, display_name: 'Deportes', code: 'deportes' },
  { id: 2, display_name: 'Casino', code: 'casino' },
  { id: 3, display_name: 'Casino en vivo', code: 'casino_vivo' },
  { id: 4, display_name: 'Virtuales', code: 'virtuales' },
  { id: 5, display_name: 'Poker', code: 'poker' },
];

export const FALLBACK_CATEGORY_ID_BY_SLUG: Record<RuleCategory, number> = {
  deportes: 1,
  casino: 2,
  casino_vivo: 3,
  virtuales: 4,
  poker: 5,
};

export const FALLBACK_SLUG_BY_CATEGORY_ID: Record<number, RuleCategory> = {
  1: 'deportes',
  2: 'casino',
  3: 'casino_vivo',
  4: 'virtuales',
  5: 'poker',
};

export function useGameCategories() {
  return useQuery({
    queryKey: ['game-categories'],
    queryFn: async () => {
      const rows = await apiClient
        .get('/admin/categories')
        .then((r) => unwrapData<GameCategoryRow[]>(r.data));
      return rows?.length ? rows : FALLBACK_GAME_CATEGORIES;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function categorySlugForId(categories: GameCategoryRow[], id: number): RuleCategory {
  const row = categories.find((c) => c.id === id);
  if (row?.code) return row.code as RuleCategory;
  return FALLBACK_SLUG_BY_CATEGORY_ID[id] ?? 'deportes';
}

export function categoryLabelForId(categories: GameCategoryRow[], id: number): string {
  const row = categories.find((c) => c.id === id);
  return row?.display_name ?? `Categoría ${id}`;
}

export function filterCategoriesByEnabled(
  categories: GameCategoryRow[],
  enabledSlugs: RuleCategory[],
): GameCategoryRow[] {
  if (!enabledSlugs.length) return categories;
  return categories.filter((c) => enabledSlugs.includes(c.code as RuleCategory));
}
