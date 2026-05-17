import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { PredictionRewardConfigFields } from '@/features/predictions/components/PredictionRewardConfigFields';
import { usePredictionCategories, useSavePrediction } from '@/features/predictions/predictionsApi';
import {
  defaultPredictionForm,
  formToPayload,
  PREDICTION_REWARD_TYPES,
  predictionFormSchema,
  predictionToForm,
  REWARD_TYPE_LABELS,
  type PredictionFormValues,
} from '@/features/predictions/predictionForm';
import type { PredictionEvent } from '@/types/predictions';

export function PredictionFormModal({
  open,
  event,
  existingCodes,
  onClose,
}: {
  open: boolean;
  event: PredictionEvent | null;
  existingCodes: string[];
  onClose: () => void;
}) {
  const save = useSavePrediction();
  const categoriesQ = usePredictionCategories();
  const categories = categoriesQ.data ?? [];

  const form = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: defaultPredictionForm(),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const { fields, append, remove, move } = useFieldArray({ control, name: 'options' });
  const participationType = useWatch({ control, name: 'participation_type' });
  const rewardType = useWatch({ control, name: 'reward_type' });
  const categoryValue = watch('category');

  useEffect(() => {
    if (!open) return;
    reset(event ? predictionToForm(event) : defaultPredictionForm());
  }, [open, event, reset]);

  const submit = handleSubmit(async (values) => {
    if (existingCodes.includes(values.code.trim()) && values.code.trim() !== event?.code) {
      form.setError('code', { message: 'El code ya existe' });
      return;
    }
    await save.mutateAsync({ id: event?.id, ...formToPayload(values) });
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={event ? 'Editar evento' : 'Nuevo evento'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" loading={save.isPending} onClick={submit}>
            Guardar
          </Button>
        </>
      }
    >
      <ConfiguratorScaffold>
        <ConfigSection icon="📋" title="Información del evento">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">code</label>
              <input className="field" placeholder="river_boca_resultado" {...register('code')} />
              {errors.code && <p className="mt-1 text-[13px] text-danger">{errors.code.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Nombre</label>
              <input className="field" {...register('name')} />
              {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Descripción</label>
            <textarea className="field min-h-[80px]" {...register('description')} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Categoría</label>
              <input className="field" list="prediction-categories" {...register('category')} />
              <datalist id="prediction-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              {!categoryValue && errors.category && (
                <p className="mt-1 text-[13px] text-danger">{errors.category.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Tipo de predicción</label>
              <input className="field" placeholder="Resultado, Goleador, Corners..." {...register('prediction_type')} />
              {errors.prediction_type && (
                <p className="mt-1 text-[13px] text-danger">{errors.prediction_type.message}</p>
              )}
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon="🎯" title="Opciones de predicción">
          <p className="mb-3 text-[14px] text-text-tertiary">Mínimo 2 opciones · sin límite superior</p>
          {errors.options?.message && (
            <p className="mb-2 text-[13px] text-danger">{String(errors.options.message)}</p>
          )}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-text-secondary">Opción {index + 1}</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={index === 0}
                      icon={<ArrowUp size={14} />}
                      onClick={() => move(index, index - 1)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={index === fields.length - 1}
                      icon={<ArrowDown size={14} />}
                      onClick={() => move(index, index + 1)}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={fields.length <= 2}
                      icon={<Trash2 size={14} />}
                      onClick={() => remove(index)}
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[14px] text-text-secondary">Texto</label>
                    <input className="field" {...register(`options.${index}.text`)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[14px] text-text-secondary">image_url (opcional)</label>
                    <input className="field" {...register(`options.${index}.image_url`)} />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="mb-1.5 block text-[14px] text-text-secondary">Descripción (opcional)</label>
                  <input className="field" {...register(`options.${index}.description`)} />
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            icon={<Plus size={14} />}
            onClick={() => append({ text: '', description: '', image_url: '' })}
          >
            Agregar opción
          </Button>
        </ConfigSection>

        <ConfigSection icon="📅" title="Programación">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Abre (opens_at)</label>
              <input type="datetime-local" className="field" {...register('opens_at')} />
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Cierra (closes_at)</label>
              <input type="datetime-local" className="field" {...register('closes_at')} />
              {errors.closes_at && <p className="mt-1 text-[13px] text-danger">{errors.closes_at.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Resuelve (resolves_at)</label>
              <input type="datetime-local" className="field" {...register('resolves_at')} />
              {errors.resolves_at && <p className="mt-1 text-[13px] text-danger">{errors.resolves_at.message}</p>}
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon="💰" title="Costo de participación">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-[14px]">
              <input
                type="radio"
                checked={participationType === 'free'}
                onChange={() => setValue('participation_type', 'free')}
              />
              Gratis
            </label>
            <label className="flex items-center gap-2 text-[14px]">
              <input
                type="radio"
                checked={participationType === 'paid_with_coins'}
                onChange={() => setValue('participation_type', 'paid_with_coins')}
              />
              Pagado con coins
            </label>
          </div>
          {participationType === 'paid_with_coins' && (
            <div className="mt-3 max-w-xs">
              <label className="mb-1.5 block text-[14px] text-text-secondary">cost_in_coins</label>
              <input type="number" min={1} className="field" {...register('cost_in_coins', { valueAsNumber: true })} />
              {errors.cost_in_coins && (
                <p className="mt-1 text-[13px] text-danger">{errors.cost_in_coins.message}</p>
              )}
            </div>
          )}
        </ConfigSection>

        <ConfigSection icon="🎁" title="Premio para acertadores">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">reward_type</label>
              <select className="field" {...register('reward_type')}>
                {PREDICTION_REWARD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {REWARD_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">currency_mode</label>
              <select className="field" {...register('currency_mode')}>
                <option value="auto_usd">auto_usd</option>
                <option value="manual_per_currency">manual_per_currency</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <PredictionRewardConfigFields rewardType={rewardType} register={register} />
          </div>
        </ConfigSection>

        <ConfigSection icon="🔒" title="Restricciones">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">min_level</label>
              <input
                type="number"
                min={1}
                className="field"
                placeholder="Sin mínimo"
                {...register('min_level', {
                  setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                })}
              />
            </div>
            <label className="flex items-center gap-2 pt-6 text-[14px]">
              <input type="checkbox" {...register('vip_only')} />
              Solo VIP
            </label>
            <label className="flex items-center gap-2 pt-6 text-[14px]">
              <input type="checkbox" {...register('new_players_only')} />
              Solo jugadores nuevos
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[14px] text-text-secondary">Visible para jugadores</span>
            <Switch checked={watch('is_visible_to_players')} onChange={(v) => setValue('is_visible_to_players', v)} />
          </div>
        </ConfigSection>
      </ConfiguratorScaffold>
    </Modal>
  );
}
