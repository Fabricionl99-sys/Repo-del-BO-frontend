import { UserCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { Avatar } from '@/types/avatars';

import { unlockMethodLabel } from '../avatarForm';

export function AvatarCard({ avatar, onEdit }: { avatar: Avatar; onEdit: () => void }) {
  const archived = avatar.status === 'archived';

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        'overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary text-left transition hover:-translate-y-0.5 hover:border-border-default',
        archived && 'opacity-70',
      )}
    >
      <div className="relative aspect-square bg-bg-tertiary">
        {avatar.image_url ? (
          <img src={avatar.image_url} alt={avatar.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-text-tertiary">
            <UserCircle2 size={40} />
          </div>
        )}
        {archived && (
          <span className="absolute right-2 top-2 rounded bg-bg-primary/80 px-2 py-0.5 text-[12px] font-semibold uppercase">
            archivado
          </span>
        )}
        {!archived && !avatar.is_active && (
          <span className="absolute right-2 top-2 rounded bg-warning/90 px-2 py-0.5 text-[12px] font-semibold text-text-onAccent">
            inactivo
          </span>
        )}
        {avatar.is_premium && (
          <span className="absolute left-2 top-2 rounded bg-accent/90 px-2 py-0.5 text-[12px] font-semibold text-text-onAccent">
            premium
          </span>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-[16px] font-semibold">{avatar.name}</h4>
        <p className="mb-2 font-mono text-[12px] text-text-tertiary">{avatar.code}</p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {avatar.category_name && (
            <span className="rounded-full bg-bg-tertiary px-2 py-0.5 text-[12px] text-text-secondary">
              {avatar.category_name}
            </span>
          )}
          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[12px] text-accent">
            {unlockMethodLabel(avatar.unlock_method)}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          {archived ? 'ver detalle' : 'editar'}
        </Button>
      </div>
    </button>
  );
}
