import * as LucideIcons from 'lucide-react';
import { GripVertical, Pencil } from 'lucide-react';
import { useState, type ComponentType } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { AvatarCategory } from '@/types/avatars';

function CategoryIcon({ name }: { name: string }) {
  const Icon =
    (LucideIcons as unknown as Record<string, ComponentType<{ size?: number }>>)[name] ?? LucideIcons.Star;
  return <Icon size={16} />;
}

export function CategoryReorderList({
  categories,
  onEdit,
  onReorder,
}: {
  categories: AvatarCategory[];
  onEdit: (category: AvatarCategory) => void;
  onReorder: (orderedIds: string[]) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = categories.map((c) => c.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    onReorder(ids);
    setDragId(null);
  };

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.id}
          draggable
          onDragStart={() => setDragId(category.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(category.id)}
          className={cn(
            'flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-secondary p-4 transition',
            dragId === category.id && 'border-accent/50 opacity-70',
          )}
        >
          <GripVertical size={16} className="cursor-grab text-text-tertiary" />
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-tertiary text-accent">
            <CategoryIcon name={category.icon} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-[14px] font-semibold">{category.name}</h4>
              {!category.is_active && (
                <span className="rounded bg-warning/15 px-2 py-0.5 text-[10px] text-warning">inactiva</span>
              )}
            </div>
            <p className="font-mono text-[10px] text-text-tertiary">{category.code}</p>
            <p className="mt-1 text-[11px] text-text-secondary">
              {category.avatar_count ?? 0} avatares
              {category.restrictions.vip_only && ' · VIP'}
              {category.restrictions.min_level && ` · lvl ${category.restrictions.min_level}+`}
            </p>
          </div>
          <Button size="sm" variant="ghost" icon={<Pencil size={14} />} onClick={() => onEdit(category)}>
            editar
          </Button>
        </div>
      ))}
    </div>
  );
}
