import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowUp, Plus } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { RewardSelectorRhf } from '@/components/rewards/RewardSelectorRhf';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { toast } from '@/stores/toastStore';
import { PoolMatchOptionsEditor } from '@/features/predictions/components/PoolMatchOptionsEditor';
import {
  useOpenPredictionPool,
  usePredictionPool,
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
  // Backend usa :code (slug) en TODOS los endpoints, no :id (UUID).
  const poolDetailQ = usePredictionPool(pool?.code ?? null);
  const categoriesQ = usePredictionPoolCategories();
  const typesQ = usePredictionTypes();
  const categories = categoriesQ.data ?? [];
  const predictionTypes = typesQ.data ?? [];
  const editingPool = poolDetailQ.data ?? pool;
  const readOnly = Boolean(editingPool && editingPool.status !== 'draft');
  const formKey = useMemo(() => (pool ? pool.id ?? 'new' : 'closed'), [pool]);

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
    if (pool && pool.id && poolDetailQ.isLoading) return;
    reset(editingPool ? poolToForm(editingPool) : defaultPoolForm());
  }, [open, pool, editingPool, poolDetailQ.isLoading, reset]);

  const persist = async (values: PoolFormValues, andOpen: boolean) => {
    // eslint-disable-next-line no-console
    console.log('[PoolFormModal] persist start', { andOpen, values });
    if (existingCodes.includes(values.code.trim()) && values.code.trim() !== pool?.code) {
      form.setError('code', { message: 'El code ya existe' });
      toast.error(`El code "${values.code.trim()}" ya existe`);
      return;
    }
    // Backend exige al menos 1 premio. Validamos según el reward_structure_type
    // que eligió el operador (cada uno usa un field distinto).
    if (andOpen) {
      const struct = values.reward_structure_type;
      let hasReward = false;
      if (struct === 'top_positions') hasReward = (values.position_rewards?.length ?? 0) > 0;
      else if (struct === 'by_hits_tiers') hasReward = (values.tier_rewards?.length ?? 0) > 0;
      else if (struct === 'all_correct_only') hasReward = Boolean(values.jackpot_reward);
      else if (struct === 'every_correct_gives') hasReward = true; // siempre tiene reward base
      if (!hasReward) {
        toast.error('Agregá al menos 1 premio antes de abrir el prode');
        return;
      }
    }
    try {
      // Backend usa :code para PATCH. Mandamos `id` field con el code.
      const saved = await save.mutateAsync({ id: pool?.code, ...formToPayload(values) });
      // eslint-disable-next-line no-console
      console.log('[PoolFormModal] saved', saved);
      if (andOpen) {
        await openPool.mutateAsync(saved.code ?? saved.id);
        toast.success('Prode publicado');
      } else {
        toast.success('Prode guardado como borrador');
      }
      onClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[PoolFormModal] persist failed', err);
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (err as Error)?.message ??
        'Error desconocido';
      toast.error(`No se pudo guardar: ${msg}`);
    }
  };

  // Handler de errores de validación — sin esto, react-hook-form rechaza el
  // submit silenciosamente y el operador no entiende por qué no pasa nada.
  const onValidationError = (errs: Record<string, unknown>) => {
    // eslint-disable-next-line no-console
    console.warn('[PoolFormModal] validation errors:', errs);
    // Buscar primer error con mensaje legible. React-hook-form errors anidan
    // pero también tienen refs circulares al DOM/React fiber → evitar recursión
    // infinita filtrando keys peligrosas + cap de profundidad.
    const SKIP_KEYS = new Set(['ref', 'refs', '_f', '_fields', '_proxyFormState']);
    const collectMessages = (obj: unknown, path: string[] = [], depth = 0): string[] => {
      if (depth > 6 || !obj || typeof obj !== 'object') return [];
      const out: string[] = [];
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (SKIP_KEYS.has(k)) continue;
        if (k === 'message' && typeof v === 'string') {
          out.push(`${path.join('.')}: ${v}`);
        } else if (typeof v === 'object' && v !== null && !(v instanceof Element)) {
          out.push(...collectMessages(v, [...path, k], depth + 1));
        }
      }
      return out;
    };
    const messages = collectMessages(errs);
    if (messages.length > 0) {
      toast.error(messages[0]);
    } else {
      toast.error(`Faltan datos: ${Object.keys(errs).join(', ') || 'revisá el formulario'}`);
    }
  };
  const saveDraft = handleSubmit((v) => persist(v, false), onValidationError);
  const saveAndOpen = handleSubmit((v) => {
    // eslint-disable-next-line no-console
    console.log('[PoolFormModal] saveAndOpen click — validation passed');
    return persist(v, true);
  }, onValidationError);

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
          Estás en Predicciones → Edición. Para archivar este prode, andá al{' '}
          <Link to="/predicciones" className="font-semibold underline">
            catálogo de predicciones
          </Link>
          .
        </p>
      )}
      {pool?.id && poolDetailQ.isLoading ? (
        <Loading label="Cargando partidos..." />
      ) : (
      <ConfiguratorScaffold key={formKey}>
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
                <PoolMatchOptionsEditor
                  key={`${ev.id}-options`}
                  control={control}
                  register={register}
                  matchIndex={evIdx}
                  readOnly={readOnly}
                  errors={errors}
                />
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
                  prediction_type: '',
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
      )}
    </Modal>
  );
}
