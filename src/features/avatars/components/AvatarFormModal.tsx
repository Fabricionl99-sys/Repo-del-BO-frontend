import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import type { FieldErrors } from 'react-hook-form';
import { useForm, useWatch } from 'react-hook-form';

import { MediaUploader } from '@/components/media/MediaUploader';
import { mediaValueFromUrl } from '@/components/media/mediaUrl';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { useArchiveAvatar, useCreateAvatar, useUpdateAvatar } from '@/features/avatars/avatarsApi';
import { toast } from '@/stores/toastStore';
import type { Avatar, AvatarCategory } from '@/types/avatars';
import { MAX_ACTIVE_AVATARS } from '@/types/avatars';

import {
  avatarFormSchema,
  avatarToForm,
  defaultAvatarForm,
  formToCreatePayload,
  formToMetadataPayload,
  getAvatarImageUrl,
  type AvatarFormValues,
} from '../avatarForm';
import { AvatarRestrictionsFields } from './AvatarRestrictionsFields';
import { AvatarUnlockConfigFields } from './AvatarUnlockConfigFields';

const FORM_ID = 'avatar-form-modal';

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

  const [imageUrl, setImageUrl] = useState('');
  const [initialImageUrl, setInitialImageUrl] = useState('');
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

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
    formState: { errors, isDirty, isSubmitting },
  } = form;

  const isActive = useWatch({ control, name: 'is_active' });
  const isEdit = Boolean(avatar);
  const atLimit = !isEdit && activeCount >= MAX_ACTIVE_AVATARS;
  const isPending = createAvatar.isPending || updateAvatar.isPending;
  const saveDisabled = isEdit
    ? isPending || isSubmitting || (!isDirty && !newImageUrl)
    : atLimit || isPending || isSubmitting;

  useEffect(() => {
    if (!open) return;
    const original = getAvatarImageUrl(avatar) ?? '';
    reset(avatar ? avatarToForm(avatar) : defaultAvatarForm());
    setImageUrl(original);
    setInitialImageUrl(original);
    setNewImageUrl(null);
    setImageError(undefined);
    setFormError(undefined);
  }, [open, avatar, reset]);

  const onInvalid = (fieldErrors: FieldErrors<AvatarFormValues>) => {
    const first = Object.keys(fieldErrors)[0];
    const message = first
      ? 'Revisá los campos marcados en el formulario.'
      : 'No se pudo validar el formulario.';
    setFormError(message);
    toast.error(message);
  };

  const onSubmit = async (values: AvatarFormValues) => {
    setFormError(undefined);
    if (existingCodes.includes(values.code.trim()) && values.code.trim() !== avatar?.code) {
      setError('code', { message: 'El code ya existe' });
      return;
    }
    const hasImage = Boolean(imageUrl.trim() || initialImageUrl.trim());
    if (!hasImage) {
      setImageError('Subí una imagen para el avatar');
      return;
    }

    if (isEdit && avatar) {
      const body = {
        ...formToMetadataPayload(values),
        ...(newImageUrl ? { image_url: newImageUrl } : {}),
      };
      console.log('Guardar clicked', { body });
      await updateAvatar.mutateAsync({ id: avatar.id, ...body });
    } else {
      await createAvatar.mutateAsync(formToCreatePayload(values, imageUrl));
    }
    onClose();
  };

  const submit = handleSubmit(onSubmit, onInvalid);

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
            type="submit"
            form={FORM_ID}
            variant="primary"
            loading={isPending}
            disabled={saveDisabled}
          >
            {avatar ? 'Guardar' : 'Crear avatar'}
          </Button>
        </>
      }
    >
      {atLimit && (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[14px] text-danger">
          Límite alcanzado: máximo {MAX_ACTIVE_AVATARS} avatares activos.
        </p>
      )}

      {formError && (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[14px] text-danger">
          {formError}
        </p>
      )}

      <form id={FORM_ID} onSubmit={submit} noValidate>
      <ConfiguratorScaffold>
        <ConfigSection title="Imagen">
          <MediaUploader
            value={mediaValueFromUrl(imageUrl)}
            onChange={(v) => {
              const url = v?.url ?? '';
              setImageUrl(url);
              setImageError(undefined);
              setNewImageUrl(url && url !== initialImageUrl ? url : null);
            }}
            context={{ module: 'avatars', purpose: 'main_image' }}
            required={!isEdit}
            error={imageError}
          />
        </ConfigSection>

        <ConfigSection title="Datos">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[14px] text-text-secondary">code</label>
              <input className="field font-mono" disabled={isEdit} {...register('code')} />
              {errors.code && <p className="mt-1 text-[13px] text-danger">{errors.code.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-[14px] text-text-secondary">nombre</label>
              <input className="field" {...register('name')} />
              {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-[14px] text-text-secondary">descripción</label>
            <textarea className="field min-h-16" {...register('description')} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[14px] text-text-secondary">categoría</label>
              <select className="field" {...register('category_id')}>
                <option value="">Elegí…</option>
                {categories.filter((c) => c.is_active).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-[13px] text-danger">{errors.category_id.message}</p>}
            </div>
            <div className="flex items-end gap-4 pb-1">
              <div className="flex items-center gap-2">
                <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} aria-label="activo" />
                <span className="text-[14px] text-text-secondary">activo</span>
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
      </form>
    </Modal>
  );
}
