import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { useArchiveAvatar, useCreateAvatar, useUpdateAvatar } from '@/features/avatars/avatarsApi';
import type { Avatar, AvatarCategory } from '@/types/avatars';
import { MAX_ACTIVE_AVATARS } from '@/types/avatars';

import {
  avatarFormSchema,
  avatarToForm,
  defaultAvatarForm,
  formToCreatePayload,
  formToMetadataPayload,
  type AvatarFormValues,
} from '../avatarForm';
import { AvatarImageUploadZone, fileToDataUrl } from './AvatarImageUploadZone';
import { AvatarRestrictionsFields } from './AvatarRestrictionsFields';
import { AvatarUnlockConfigFields } from './AvatarUnlockConfigFields';

export function AvatarFormModal({
  open,
  avatar,
  categories,
  existingCodes,
  activeCount,
  onClose,
}: {
  open: boolean;
  avatar: Avatar | null;
  categories: AvatarCategory[];
  existingCodes: string[];
  activeCount: number;
  onClose: () => void;
}) {
  const createAvatar = useCreateAvatar();
  const updateAvatar = useUpdateAvatar();
  const archiveAvatar = useArchiveAvatar();

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | undefined>();

  const form = useForm<AvatarFormValues>({
    resolver: zodResolver(avatarFormSchema),
    defaultValues: defaultAvatarForm(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = form;

  const isActive = useWatch({ control, name: 'is_active' });
  const isPremium = useWatch({ control, name: 'is_premium' });
  const isEdit = Boolean(avatar);
  const atLimit = !isEdit && activeCount >= MAX_ACTIVE_AVATARS;

  useEffect(() => {
    if (!open) return;
    reset(avatar ? avatarToForm(avatar) : defaultAvatarForm());
    setUploadFile(null);
    setPreviewUrl(avatar?.image_url ?? null);
    setImageError(undefined);
  }, [open, avatar, reset]);

  const submit = handleSubmit(async (values) => {
    if (existingCodes.includes(values.code.trim()) && values.code.trim() !== avatar?.code) {
      setError('code', { message: 'El code ya existe' });
      return;
    }
    if (!isEdit && !uploadFile && !previewUrl) {
      setImageError('Subí una imagen para el avatar');
      return;
    }

    if (isEdit && avatar) {
      let image_url: string | undefined;
      if (uploadFile) {
        image_url = await fileToDataUrl(uploadFile);
      }
      await updateAvatar.mutateAsync({
        id: avatar.id,
        ...formToMetadataPayload(values),
        ...(image_url ? { image_url } : {}),
      });
    } else {
      const image_url = uploadFile ? await fileToDataUrl(uploadFile) : previewUrl!;
      await createAvatar.mutateAsync(formToCreatePayload(values, image_url));
    }
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={avatar ? 'Editar avatar' : 'Nuevo avatar'}
      description="Imagen, categoría, método de desbloqueo y restricciones"
      size="lg"
      footer={
        <>
          {avatar && avatar.status === 'active' && (
            <Button
              variant="ghost"
              className="mr-auto text-danger"
              onClick={async () => {
                await archiveAvatar.mutateAsync(avatar.id);
                onClose();
              }}
            >
              Archivar
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            variant="primary"
            loading={createAvatar.isPending || updateAvatar.isPending}
            disabled={atLimit}
            onClick={submit}
          >
            {avatar ? 'Guardar' : 'Crear avatar'}
          </Button>
        </>
      }
    >
      {atLimit && (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12px] text-danger">
          Límite alcanzado: máximo {MAX_ACTIVE_AVATARS} avatares activos.
        </p>
      )}

      <ConfiguratorScaffold>
        <ConfigSection title="Imagen">
          <AvatarImageUploadZone
            previewUrl={previewUrl}
            error={imageError}
            onValidated={(file, url) => {
              setUploadFile(file);
              setPreviewUrl(url);
              setImageError(undefined);
            }}
            onClear={() => {
              setUploadFile(null);
              setPreviewUrl(null);
            }}
          />
        </ConfigSection>

        <ConfigSection title="Datos">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] text-text-secondary">code</label>
              <input className="field font-mono" disabled={isEdit} {...register('code')} />
              {errors.code && <p className="mt-1 text-[11px] text-danger">{errors.code.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-text-secondary">nombre</label>
              <input className="field" {...register('name')} />
              {errors.name && <p className="mt-1 text-[11px] text-danger">{errors.name.message}</p>}
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-[12px] text-text-secondary">descripción</label>
            <textarea className="field min-h-16" {...register('description')} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] text-text-secondary">categoría</label>
              <select className="field" {...register('category_id')}>
                <option value="">Elegí…</option>
                {categories.filter((c) => c.is_active).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-[11px] text-danger">{errors.category_id.message}</p>}
            </div>
            <div className="flex items-end gap-4 pb-1">
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} aria-label="activo" />
                <span className="text-[12px] text-text-secondary">activo</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={isPremium} onChange={(v) => setValue('is_premium', v)} aria-label="premium" />
                <span className="text-[12px] text-text-secondary">premium</span>
              </div>
            </div>
          </div>
        </ConfigSection>

        <ConfigSection title="Método de desbloqueo">
          <AvatarUnlockConfigFields
            control={control}
            register={register}
            setValue={setValue}
            errors={errors}
          />
        </ConfigSection>

        <ConfigSection title="Restricciones">
          <AvatarRestrictionsFields register={register} setValue={setValue} control={control} />
        </ConfigSection>
      </ConfiguratorScaffold>
    </Modal>
  );
}
