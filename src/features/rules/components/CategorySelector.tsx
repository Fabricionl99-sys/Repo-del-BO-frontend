import { CATEGORIES, type GameCategory } from '@/types/expandedTier5';

export function CategorySelector({
  value,
  onChange,
  enabledCategories,
}: {
  value: GameCategory;
  onChange: (value: GameCategory) => void;
  enabledCategories: GameCategory[];
}) {
  const enabled = CATEGORIES.filter((category) => enabledCategories.includes(category.value));

  return (
    <label>
      <span className="mb-1.5 block text-[12px] text-text-secondary">categoría de juego</span>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value as GameCategory)}>
        {enabled.map((category) => (
          <option key={category.value} value={category.value}>
            {category.label} · {category.description}
          </option>
        ))}
      </select>
    </label>
  );
}
