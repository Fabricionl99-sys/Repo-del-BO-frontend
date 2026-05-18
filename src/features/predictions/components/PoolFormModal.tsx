import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { RewardSelectorRhf } from '@/components/rewards/RewardSelectorRhf';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import {
  useOpenPredictionPool,
  usePredictionPoolCategories,
  usePredictionTypes,
  useSavePredictionPool,
} from '@/features/predictions/predictionsApi';
import {
  AUDIENCE_LABELS,
  defaultPoolForm,
  formToPayload,
  poolFormSchema,
  poolToForm,
  REWARD_STRUCTURE_LABELS,
  type PoolFormValues,
} from '@/features/predictions/poolForm';
import type { PredictionPool, RewardStructureType } from '@/types/predictions';

function MatchOptionsEditor({
  control,
  register,
  matchIndex,
  readOnly,
}: {
  control: ReturnType<typeof useForm<PoolFormValues>>['control'];
  register: ReturnType<typeof useForm<PoolFormValues>>['register'];
  matchIndex: number;
  readOnly: boolean;
}) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `events.${matchIndex}.options`,
  });

  return (
    <div className="space-y-2">
      {fields.map((field, optIdx) => (
        <div key={field.id} className="flex flex-wrap items-start gap-2 rounded-lg border border-border-subtle p-3">
          <div className="min-w-[140px] flex-1">
            <input
              className="field"
              placeholder="Texto opción"
              disabled={readOnly}
              {...register(`events.${matchIndex}.options.${optIdx}.text`)}
            />
          </div>
          {!readOnly && (
            <MediaUploaderRhf
              control={control}
              name={`events.${matchIndex}.options.${optIdx}.image_url`}
              context={{ module: 'predictions', purpose: 'thumbnail' }}
              compact
            />
          )}
          {!readOnly && (
            <div className="flex gap-1">
              <Button type="button" size="sm" variant="ghost" disabled={optIdx === 0} onClick={() => move(optIdx, optIdx - 1)}>
                <ArrowUp size={14} />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={optIdx === fields.length - 1}
                onClick={() => move(optIdx, optIdx + 1)}
              >
                <ArrowDown size={14} />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={fields.length <= 2}
                onClick={() => remove(optIdx)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => append({ text: '', description: '', image_url: '' })}
        >
          Agregar opción
        </Button>
      )}
    </div>
  );
}

export function PoolFormModal({
  open,
  pool,
  existingCodes,
  onClose,
}: {
  open: boolean;
  pool: PredictionPool | null;
  existingCodes: string[];
  onClose: () => void;
}) {
  const save = useSavePredictionPool();
  const openPool = useOpenPredictionPool();
  const categoriesQ = usePredictionPoolCategories();
  const typesQ = usePredictionTypes();
  const categories = categoriesQ.data ?? [];
  const predictionTypes = typesQ.data ?? [];
  const readOnly = Boolean(pool && pool.status !== 'draft');

  const form = useForm<PoolFormValues>({
    resolver: zodResolver(poolFormSchema),
    defaultValues: defaultPoolForm(),
  });

  const { register, handleSubmit, reset, control, setValue, watch, formState: { errors } } = form;
  const { fields: eventFields, append: appendEvent, remove: removeEvent, move: moveEvent } = useFieldArray({
    control,
    name: 'events',
  });

  const participationType = useWatch({ control, name: 'participation_type' });
  const rewardStructure = useWatch({ control, name: 'reward_structure_type' });
  const targetAudience = useWatch({ control, name: 'target_audience' });
  const categoryValue = watch('category');

  const { fields: tierFields, append: appendTier, remove: removeTier } = useFieldArray({
    control,
    name: 'tier_rewards',
  });
  const { fields: positionFields, append: appendPosition, remove: removePosition } = useFieldArray({
    control,
    name: 'position_rewards',
  });

  useEffect(() => {
    if (!open) return;
    reset(pool ? poolToForm(pool) : defaultPoolForm());
  }, [open, pool, reset]);

  const persist = async (values: PoolFormValues, andOpen: boolean) => {
    if (existingCodes.includes(values.code.trim()) && values.code.trim() !== pool?.code) {
      form.setError('code', { message: 'El code ya existe' });
      return;
    }
    const saved = await save.mutateAsync({ id: pool?.id, ...formToPayload(values) });
    if (andOpen) await openPool.mutateAsync(saved.id);
    onClose();
  };

  const saveDraft = handleSubmit((v) => persist(v, false));
  const saveAndOpen = handleSubmit((v) => persist(v, true));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={pool ? 'Editar prode' : 'Nuevo prode'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          {!readOnly && (
            <>
              <Button variant="secondary" loading={save.isPending} onClick={saveDraft}>
                Guardar como borrador
              </Button>
              <Button variant="primary" loading={save.isPending || openPool.isPending} onClick={saveAndOpen}>
                Guardar y abrir predicciones
              </Button>
            </>
          )}
        </>
      }
    >
      {readOnly && (
        <p className="mb-4 rounded-lg bg-warning/10 px-3 py-2 text-[13px] text-warning">
          Este prode ya está abierto o cerrado. Solo podés cancelarlo desde el catálogo.
        </p>
      )}
      <ConfiguratorScaffold>
        <ConfigSection icon="📋" title="Información del prode">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">code</label>
              <input className="field" disabled={readOnly} {...register('code')} />
              {errors.code && <p className="mt-1 text-[13px] text-danger">{errors.code.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Nombre</label>
              <input className="field" disabled={readOnly} {...register('name')} />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[14px] text-text-secondary">Descripción</label>
            <textarea className="field min-h-[80px]" disabled={readOnly} {...register('description')} />
          </div>
          <div className="mt-3">
            {!readOnly && (
              <div>
                <p className="mb-1.5 text-[14px] text-text-secondary">Banner del prode</p>
                <MediaUploaderRhf
                  control={control}
                  name="image_url"
                  context={{ module: 'predictions', purpose: 'banner' }}
                />
              </div>
            )}
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[14px] text-text-secondary">Categoría</label>
            <input className="field" list="pool-categories" disabled={readOnly} {...register('category')} />
            <datalist id="pool-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
              {categoryValue && !categories.includes(categoryValue) && <option value={categoryValue} />}
            </datalist>
          </div>
        </ConfigSection>

        <ConfigSection icon="📅" title="Programación">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Abre</label>
              <input type="datetime-local" className="field" disabled={readOnly} {...register('opens_at')} />
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Cierra</label>
              <input type="datetime-local" className="field" disabled={readOnly} {...register('closes_at')} />
              {errors.closes_at && <p className="mt-1 text-[13px] text-danger">{errors.closes_at.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Resuelve</label>
              <input type="datetime-local" className="field" disabled={readOnly} {...register('resolves_at')} />
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon="⚽" title="Partidos del prode">
          <div className="space-y-4">
            {eventFields.map((ev, evIdx) => (
              <div key={ev.id} className="card space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-text-tertiary">Partido {evIdx + 1}</span>
                  {!readOnly && (
                    <div className="flex gap-1">
                      <Button type="button" size="sm" variant="ghost" disabled={evIdx === 0} onClick={() => moveEvent(evIdx, evIdx - 1)}>
                        <ArrowUp size={14} />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={evIdx === eventFields.length - 1}
                        onClick={() => moveEvent(evIdx, evIdx + 1)}
                      >
                        <ArrowDown size={14} />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={eventFields.length <= 1}
                        onClick={() => removeEvent(evIdx)}
                      >
                        Quitar
                      </Button>
                    </div>
                  )}
                </div>
                <input className="field" placeholder="Nombre del partido" disabled={readOnly} {...register(`events.${evIdx}.name`)} />
                <input
                  className="field"
                  placeholder="Tipo (Resultado, Corners, Goles...)"
                  list="prediction-types"
                  disabled={readOnly}
                  {...register(`events.${evIdx}.prediction_type`)}
                />
                <datalist id="prediction-types">
                  {predictionTypes.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                <MatchOptionsEditor control={control} register={register} matchIndex={evIdx} readOnly={readOnly} />
              </div>
            ))}
          </div>
          {!readOnly && (
            <Button
              type="button"
              className="mt-3"
              variant="secondary"
              icon={<Plus size={14} />}
              onClick={() =>
                appendEvent({
                  name: '',
                  description: '',
                  image_url: '',
                  prediction_type: 'Resultado',
                  options: [
                    { text: '', description: '', image_url: '' },
                    { text: '', description: '', image_url: '' },
                  ],
                })
              }
            >
              Agregar partido al prode
            </Button>
          )}
        </ConfigSection>

        <ConfigSection icon="💰" title="Costo de participación">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-[14px]">
              <input type="radio" value="free" disabled={readOnly} {...register('participation_type')} />
              Gratis
            </label>
            <label className="flex items-center gap-2 text-[14px]">
              <input type="radio" value="paid" disabled={readOnly} {...register('participation_type')} />
              Pagado con coins
            </label>
          </div>
          {participationType === 'paid' && (
            <div className="mt-3 max-w-[200px]">
              <input type="number" className="field" disabled={readOnly} {...register('cost_in_coins', { valueAsNumber: true })} />
            </div>
          )}
        </ConfigSection>

        <ConfigSection icon="🎁" title="Premios">
          <div className="space-y-2">
            {(Object.keys(REWARD_STRUCTURE_LABELS) as RewardStructureType[]).map((type) => (
              <label key={type} className="flex items-center gap-2 text-[14px]">
                <input
                  type="radio"
                  value={type}
                  disabled={readOnly}
                  checked={rewardStructure === type}
                  onChange={() => setValue('reward_structure_type', type)}
                />
                {REWARD_STRUCTURE_LABELS[type]}
              </label>
            ))}
          </div>
          {rewardStructure === 'all_correct_only' && (
            <RewardSelectorRhf moduleKey="predictions" control={control} name="jackpot_reward" disabled={readOnly} />
          )}
          {rewardStructure === 'every_correct_gives' && (
            <RewardSelectorRhf moduleKey="predictions" control={control} name="per_hit_reward" disabled={readOnly} />
          )}
          {rewardStructure === 'by_hits_tiers' && (
            <div className="mt-3 space-y-3">
              {tierFields.map((t, i) => (
                <div key={t.id} className="card p-3">
                  <input className="field mb-2" disabled={readOnly} {...register(`tier_rewards.${i}.label`)} />
                  <input
                    type="number"
                    className="field mb-2 w-32"
                    disabled={readOnly}
                    {...register(`tier_rewards.${i}.min_hits_percent`, { valueAsNumber: true })}
                  />
                  <RewardSelectorRhf moduleKey="predictions" control={control} name={`tier_rewards.${i}.reward`} disabled={readOnly} />
                  {!readOnly && (
                    <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => removeTier(i)}>
                      Quitar tier
                    </Button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    appendTier({
                      label: 'Nuevo tier',
                      min_hits_percent: 50,
                      reward: defaultPoolForm().jackpot_reward,
                    })
                  }
                >
                  Agregar tier
                </Button>
              )}
            </div>
          )}
          {rewardStructure === 'top_positions' && (
            <div className="mt-3 space-y-3">
              {positionFields.map((p, i) => (
                <div key={p.id} className="card p-3">
                  <input className="field mb-2" disabled={readOnly} {...register(`position_rewards.${i}.label`)} />
                  <div className="mb-2 flex gap-2">
                    <input
                      type="number"
                      className="field w-24"
                      disabled={readOnly}
                      {...register(`position_rewards.${i}.position_from`, { valueAsNumber: true })}
                    />
                    <input
                      type="number"
                      className="field w-24"
                      disabled={readOnly}
                      {...register(`position_rewards.${i}.position_to`, { valueAsNumber: true })}
                    />
                  </div>
                  <RewardSelectorRhf
                    moduleKey="predictions"
                    control={control}
                    name={`position_rewards.${i}.reward`}
                    disabled={readOnly}
                  />
                  {!readOnly && (
                    <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => removePosition(i)}>
                      Quitar rango
                    </Button>
                  )}
                </div>
              ))}
              {!readOnly && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    appendPosition({
                      label: 'Nuevo rango',
                      position_from: 1,
                      position_to: 1,
                      reward: defaultPoolForm().jackpot_reward,
                    })
                  }
                >
                  Agregar rango
                </Button>
              )}
            </div>
          )}
        </ConfigSection>

        <ConfigSection icon="👥" title="Audiencia">
          <div className="space-y-2">
            {(Object.keys(AUDIENCE_LABELS) as Array<keyof typeof AUDIENCE_LABELS>).map((a) => (
              <label key={a} className="flex items-center gap-2 text-[14px]">
                <input type="radio" value={a} disabled={readOnly} {...register('target_audience')} />
                {AUDIENCE_LABELS[a]}
              </label>
            ))}
          </div>
          {targetAudience === 'by_level' && (
            <div className="mt-3 flex gap-3">
              <input type="number" className="field w-28" placeholder="Min" disabled={readOnly} {...register('min_level', { valueAsNumber: true })} />
              <input type="number" className="field w-28" placeholder="Max" disabled={readOnly} {...register('max_level', { valueAsNumber: true })} />
            </div>
          )}
          {targetAudience === 'by_country' && (
            <input className="field mt-3" placeholder="AR, BR, CL" disabled={readOnly} {...register('countries')} />
          )}
          {targetAudience === 'specific_players' && (
            <input className="field mt-3" placeholder="IDs separados por coma" disabled={readOnly} {...register('player_ids')} />
          )}
        </ConfigSection>

        <ConfigSection icon="⚙️" title="Avanzado">
          <div className="flex items-center justify-between">
            <span className="text-[14px]">Visible para jugadores</span>
            <Switch checked={watch('is_visible_to_players')} onChange={(v) => setValue('is_visible_to_players', v)} disabled={readOnly} />
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[14px] text-text-secondary">Máx. entradas por jugador</label>
            <input type="number" className="field w-28" disabled={readOnly} {...register('max_predictions_per_player', { valueAsNumber: true })} />
          </div>
        </ConfigSection>
      </ConfiguratorScaffold>
    </Modal>
  );
}
