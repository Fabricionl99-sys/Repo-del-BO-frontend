import { Archive, Pencil, Trash2, UserCircle2 } from 'lucide-react';

import { resolveCatalogStatus } from '@/components/shared/catalogStatus';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/Button';
import { CardActionItem, CardActionsMenu } from '@/components/lifecycle/CardActionsMenu';
import { cn } from '@/lib/cn';
import type { Avatar } from '@/types/avatars';

import { unlockMethodLabel, getAvatarImageUrl } from '../avatarForm';

export function AvatarCard({
  avatar,
  onEdit,
  onArchive,
  onDeletePermanent,
}: {
  avatar: Avatar;
  onEdit: () => void;
  onArchive?: () => void;
  onDeletePermanent?: () => void;
}) {
  const catalogStatus = resolveCatalogStatus(avatar);
  const imageUrl = getAvatarImageUrl(avatar);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border-subtle bg-bg-secondary text-left transition hover:-translate-y-0.5 hover:border-border-default',
        catalogStatus === 'archived' && 'opacity-70',
      )}
    >
      <button type="button" onClick={onEdit} className="block w-full text-left">
        <div className="relative aspect-square bg-bg-tertiary">
          {imageUrl ? (
            <img src={imageUrl} alt={avatar.name} loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-text-tertiary">
              <UserCircle2 size={40} />
            </div>
          )}
          {avatar.is_premium && (
            <span className="absolute left-2 top-2 rounded bg-accent/90 px-2 py-0.5 text-[12px] font-semibold text-text-onAccent">
              premium
            </span>
          )}
        </div>
        <div className="p-4">
          <h4 className="text-[16px] font-bold">{avatar.name}</h4>
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
        </div>
      </button>

      <CardActionsMenu>
        {(close) => (
          <>
            {catalogStatus !== 'archived' && (
              <>
                <CardActionItem label="Editar" icon={<Pencil size={14} />} onClick={() => { close(); onEdit(); }} />
                {onArchive && (
                  <CardActionItem
                    label="Archivar"
                    icon={<Archive size={14} />}
                    danger
                    onClick={() => { close(); onArchive(); }}
                  />
                )}
              </>
            )}
            {catalogStatus === 'archived' && onDeletePermanent && (
              <CardActionItem
                label="Eliminar definitivo"
                icon={<Trash2 size={14} />}
                danger
                onClick={() => { close(); onDeletePermanent(); }}
              />
            )}
          </>
        )}
      </CardActionsMenu>

      <div className="border-t border-border-subtle px-4 pb-4">
        <Button size="sm" variant="ghost" className="w-full" onClick={onEdit}>
          {catalogStatus === 'archived' ? 'ver detalle' : 'editar'}
        </Button>
        <div className="mt-2 flex justify-center">
          <StatusBadge status={catalogStatus} />
        </div>
      </div>
    </div>
  );
}
