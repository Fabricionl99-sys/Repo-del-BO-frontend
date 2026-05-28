import { FieldHint } from '@/components/ui/FieldHint';
import type { GameCategoryRow } from '@/features/gameCategories/gameCategoriesApi';

export function CategorySelector({
  value,
  onChange,
  categories,
}: {
  value: number;
  onChange: (value: number) => void;
  categories: GameCategoryRow[];
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[14px] text-text-secondary">
        Categoría
        <FieldHint text="Categoría de juego del catálogo del operador. Las opciones vienen del backend." />
      </span>
      <select
        className="field"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.display_name}
          </option>
        ))}
      </select>
    </label>
  );
}
