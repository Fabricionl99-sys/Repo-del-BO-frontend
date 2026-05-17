import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import {
  useReactivateOperatorBonus,
  useSaveOperatorBonus,
  useValidateBonusId,
  useVerifyOperatorBonus,
} from '@/features/operatorBonuses/operatorBonusesApi';
import {
  BONUS_TYPE_LABELS,
  bonusToForm,
  defaultOperatorBonusForm,
  formToBonusPayload,
  operatorBonusFormSchema,
  type OperatorBonusFormValues,
} from '@/features/operatorBonuses/operatorBonusForm';
import type { OperatorBonus } from '@/types/operatorBonuses';

export function BonusFormModal({
  open,
  bonus,
  onClose,
}: {
  open: boolean;
  bonus: OperatorBonus | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(bonus);
  const save = useSaveOperatorBonus();
  const validate = useValidateBonusId();
  const verify = useVerifyOperatorBonus();
  const reactivate = useReactivateOperatorBonus();

  const [validationState, setValidationState] = useState<'idle' | 'loading' | 'valid' | 'invalid'>('idle');

  const form = useForm<OperatorBonusFormValues>({
    resolver: zodResolver(operatorBonusFormSchema),
    defaultValues: defaultOperatorBonusForm(),
  });

  const { register, handleSubmit, reset, setValue, watch, control, formState: { errors } } = form;
  const externalId = watch('external_id');
  const isActive = watch('is_active');

  useEffect(() => {
    if (!open) return;
    reset(bonus ? bonusToForm(bonus) : defaultOperatorBonusForm());
    setValidationState('idle');
  }, [open, bonus, reset]);

  const handleValidateId = async () => {
    if (!externalId.trim() || isEdit) return;
    setValidationState('loading');
    try {
      const res = await validate.mutateAsync(externalId.trim());
      if (res.valid) {
        setValidationState('valid');
        if (!watch('name') && res.name) setValue('name', res.name);
        if (res.bonus_type) setValue('bonus_type', res.bonus_type);
      } else {
        setValidationState('invalid');
      }
    } catch {
      setValidationState('invalid');
    }
  };

  const submit = handleSubmit(async (values) => {
    await save.mutateAsync({ id: bonus?.id, ...formToBonusPayload(values) });
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar bono' : 'Nuevo bono manual'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={save.isPending} onClick={submit}>Guardar</Button>
        </>
      }
    >
      {bonus?.status === 'deprecated' && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-[14px] text-warning">
          Este bono está deprecated en la plataforma.
          <Button
            size="sm"
            className="ml-3"
            loading={reactivate.isPending}
            onClick={() => bonus && reactivate.mutate(bonus.id)}
          >
            Reactivar bono
          </Button>
        </div>
      )}

      <ConfiguratorScaffold>
        <ConfigSection icon="🎫" title="Identificación">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">external_id</label>
            <div className="flex gap-2">
              <input
                className="field flex-1"
                disabled={isEdit}
                {...register('external_id')}
                onBlur={() => !isEdit && void handleValidateId()}
              />
              {!isEdit && validationState === 'loading' && (
                <span className="flex items-center text-text-tertiary"><Loader2 size={16} className="animate-spin" /></span>
              )}
              {!isEdit && validationState === 'valid' && (
                <span className="flex items-center text-success"><CheckCircle2 size={18} /></span>
              )}
              {!isEdit && validationState === 'invalid' && (
                <span className="flex items-center text-danger"><XCircle size={18} /></span>
              )}
            </div>
            {errors.external_id && <p className="mt-1 text-[13px] text-danger">{errors.external_id.message}</p>}
            {!isEdit && validationState === 'invalid' && (
              <p className="mt-1 text-[13px] text-danger">ID no encontrado en plataforma</p>
            )}
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[14px] text-text-secondary">Tipo</label>
            <select className="field" {...register('bonus_type')}>
              {Object.entries(BONUS_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </ConfigSection>

        <ConfigSection icon="📝" title="Presentación">
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Nombre (display jugador)</label>
            <input className="field" {...register('name')} />
            {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[14px] text-text-secondary">Descripción interna</label>
            <textarea className="field min-h-[80px]" {...register('description')} />
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[14px] text-text-secondary">Imagen del bono</label>
            <MediaUploaderRhf
              control={control}
              name="image_url"
              context={{ module: 'bonuses', purpose: 'thumbnail' }}
              error={errors.image_url?.message}
            />
          </div>
          <div className="mt-3 max-w-xs">
            <label className="mb-1.5 block text-[14px] text-text-secondary">default_value_usd</label>
            <input type="number" min={0} step="0.01" className="field" {...register('default_value_usd', { valueAsNumber: true })} />
          </div>
        </ConfigSection>

        <ConfigSection icon="{}" title="Metadata (opcional)">
          <textarea className="field min-h-[100px] font-mono text-[13px]" placeholder='{"game_id":"book_of_dead"}' {...register('metadata_json')} />
        </ConfigSection>

        <div className="flex items-center justify-between rounded-lg border border-border-subtle p-4">
          <span className="text-[14px] text-text-secondary">Activo</span>
          <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
        </div>

        {isEdit && (
          <Button
            variant="secondary"
            loading={verify.isPending}
            onClick={() => bonus && verify.mutate(bonus.id)}
          >
            Verificar bono ahora
          </Button>
        )}
      </ConfiguratorScaffold>
    </Modal>
  );
}
