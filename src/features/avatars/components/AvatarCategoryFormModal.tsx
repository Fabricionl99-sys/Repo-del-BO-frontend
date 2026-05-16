import { zodResolver } from '@hookform/resolvers/zod';
import * as LucideIcons from 'lucide-react';
import { useEffect, type ComponentType } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/cn';
import type { AvatarCategory } from '@/types/avatars';

import {
  AVATAR_ICON_PRESETS,
  avatarCategoryFormSchema,
  categoryToForm,
  defaultAvatarCategoryForm,
  formToCategoryPayload,
  type AvatarCategoryFormValues,
} from '../avatarCategoryForm';
import { useCreateAvatarCategory, useDeleteAvatarCategory, useUpdateAvatarCategory } from '../avatarsApi';

function CategoryIcon({ name, size = 16 }: { name: string; size?: number }) {
  const Icon =
    (LucideIcons as unknown as Record<string, ComponentType<{ size?: number }>>)[name] ?? LucideIcons.Star;
  return <Icon size={size} />;
}

export function AvatarCategoryFormModal({
  open,
  category,
  existingCodes,
  nextOrder,
  onClose,
}: {
  open: boolean;
  category: AvatarCategory | null;
  existingCodes: string[];
  nextOrder: number;
  onClose: () => void;
}) {
  const createCategory = useCreateAvatarCategory();
  const updateCategory = useUpdateAvatarCategory();
  const deleteCategory = useDeleteAvatarCategory();

  const form = useForm<AvatarCategoryFormValues>({
    resolver: zodResolver(avatarCategoryFormSchema),
    defaultValues: defaultAvatarCategoryForm(nextOrder),
  });

  const { register, handleSubmit, reset, setValue, setError, control, formState: { errors } } = form;
  const isActive = useWatch({ control, name: 'is_active' });
  const icon = useWatch({ control, name: 'icon' });
  const vipOnly = useWatch({ control, name: 'restrictions.vip_only' });
  const newPlayersOnly = useWatch({ control, name: 'restrictions.new_players_only' });

  useEffect(() => {
    if (!open) return;
    reset(category ? categoryToForm(category) : defaultAvatarCategoryForm(nextOrder));
  }, [open, category, nextOrder, reset]);

  const submit = handleSubmit(async (values) => {
    if (existingCodes.includes(values.code.trim()) && values.code.trim() !== category?.code) {
      setError('code', { message: 'El code ya existe' });
      return;
    }
    const payload = formToCategoryPayload(values);
    if (category) {
      await updateCategory.mutateAsync({ id: category.id, ...payload });
    } else {
      await createCategory.mutateAsync(payload);
    }
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Editar categoría' : 'Nueva categoría'}
      description="Organizá el catálogo de avatares del operador"
      footer={
        <>
          {category && (category.avatar_count ?? 0) === 0 && (
            <Button
              variant="ghost"
              className="mr-auto text-danger"
              onClick={async () => {
                await deleteCategory.mutateAsync(category.id);
                onClose();
              }}
            >
              Eliminar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={createCategory.isPending || updateCategory.isPending} onClick={submit}>
            {category ? 'Guardar' : 'Crear categoría'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="avatar-category-code" className="mb-1 block text-[12px] text-text-secondary">code</label>
            <input id="avatar-category-code" className="field font-mono" disabled={Boolean(category)} {...register('code')} />
            {errors.code && <p className="mt-1 text-[11px] text-danger">{errors.code.message}</p>}
          </div>
          <div>
            <label htmlFor="avatar-category-name" className="mb-1 block text-[12px] text-text-secondary">nombre</label>
            <input id="avatar-category-name" className="field" {...register('name')} />
            {errors.name && <p className="mt-1 text-[11px] text-danger">{errors.name.message}</p>}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[12px] text-text-secondary">descripción</label>
          <textarea className="field min-h-16" {...register('description')} />
        </div>
        <div>
          <label className="mb-2 block text-[12px] text-text-secondary">ícono</label>
          <div className="flex flex-wrap gap-2">
            {AVATAR_ICON_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setValue('icon', preset)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg border transition',
                  icon === preset ? 'border-accent bg-accent/10 text-accent' : 'border-border-subtle text-text-secondary',
                )}
              >
                <CategoryIcon name={preset} />
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">orden</label>
            <input type="number" className="field" {...register('display_order', { valueAsNumber: true })} />
          </div>
          <div className="flex items-end gap-2 pb-1">
            <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} aria-label="activa" />
            <span className="text-[12px] text-text-secondary">activa</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-border-subtle pt-4">
          <div>
            <label className="mb-1 block text-[12px] text-text-secondary">nivel mínimo</label>
            <input
              type="number"
              className="field"
              placeholder="sin mínimo"
              {...register('restrictions.min_level', {
                setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
              })}
            />
          </div>
          <div className="flex items-end gap-2 pb-1">
            <Switch checked={vipOnly} onChange={(v) => setValue('restrictions.vip_only', v)} aria-label="solo VIP" />
            <span className="text-[12px] text-text-secondary">solo VIP</span>
          </div>
          <div className="flex items-end gap-2 pb-1">
            <Switch
              checked={newPlayersOnly}
              onChange={(v) => setValue('restrictions.new_players_only', v)}
              aria-label="solo nuevos"
            />
            <span className="text-[12px] text-text-secondary">solo nuevos</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
