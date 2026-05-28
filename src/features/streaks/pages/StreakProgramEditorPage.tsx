import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useFieldArray, useForm, useFormContext, useWatch } from 'react-hook-form';

import { StreakEditorPlayerPreview } from '@/features/streaks/components/StreakEditorPlayerPreview';
import {
  ActivityConfigFields,
  DailyRewardFields,
  FieldErr,
  MilestoneCard,
  RESET_OPTIONS,
} from '@/features/streaks/streakEditorFields';
import {
  ACTIVITY_OPTIONS,
  type StreakEditorFormValues,
  TIMEZONE_OPTIONS,
  applyValidationErrors,
  buildProgramPayload,
  coinCodeForSelect,
  defaultStreakEditorForm,
  emptyMilestoneRow,
  programToEditorForm,
  timezoneFriendlyLabel,
  validateStreakEditorFormWithListLimits,
} from '@/features/streaks/streakEditorForm';
import { ConfiguratorScaffold, ConfigSection } from '@/components/configurator/ConfiguratorScaffold';
import { Button } from '@/components/ui/Button';
import { FieldHint } from '@/components/ui/FieldHint';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StickyBottomBar } from '@/features/rules/components/RuleBlocks';
import {
  useActivateStreakProgram,
  useSaveStreakProgram,
  useStreakProgram,
  useStreakProgramNameAvailable,
} from '@/features/streakProgramsApi';
import { useCoins } from '@/features/coinsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useOperatorStore } from '@/stores/operatorStore';

function EditorPreviewBridge({ defTz, defCoin }: { defTz: string; defCoin: string }) {
  const {
    control,
    formState: { errors },
  } = useFormContext<StreakEditorFormValues>();
  const v = useWatch({ control, defaultValue: defaultStreakEditorForm(defTz, defCoin) });
  return <StreakEditorPlayerPreview values={v as StreakEditorFormValues} formErrors={errors} />;
}

export default function StreakProgramEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const nav = useNavigate();
  const op = useOperatorStore((s) => s.current);
  const coinsQ = useCoins();
  const defaultCoin = coinCodeForSelect(coinsQ.data?.find((c) => c.active)?.id ?? 'coin_oro');
  const defaultTz = op?.timezone ?? 'America/Argentina/Buenos_Aires';

  const q = useStreakProgram(isNew ? null : id!);
  const save = useSaveStreakProgram();
  const activate = useActivateStreakProgram();

  const form = useForm<StreakEditorFormValues>({ defaultValues: defaultStreakEditorForm(defaultTz, defaultCoin) });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'milestones' });
  const [milestoneListError, setMilestoneListError] = useState('');

  const nameWatch = form.watch('name');
  const debouncedName = useDebounce(nameWatch, 400);
  const nameQ = useStreakProgramNameAvailable(debouncedName, isNew ? null : id);

  useEffect(() => {
    if (!isNew && q.data) {
      form.reset(programToEditorForm(q.data, defaultCoin));
    }
  }, [isNew, q.data, form, defaultCoin]);

  const resetPolicy = form.watch('reset_policy');
  const mstones = form.watch('milestones');
  const milestoneOrder = useMemo(() => {
    const rows = mstones ?? [];
    return rows.map((_, i) => i).sort((a, b) => (rows[a]?.day_number ?? 0) - (rows[b]?.day_number ?? 0));
  }, [mstones]);

  if (!isNew && q.isLoading) return <Loading label="Cargando programa..." />;
  if (!isNew && q.isError) return <ErrorState onRetry={() => q.refetch()} />;

  const resolveNameAvailable = (): boolean | null => {
    const cur = nameWatch.trim().toLowerCase();
    if (cur.length < 3) return null;
    const orig = !isNew && q.data ? q.data.name.trim().toLowerCase() : '';
    if (!isNew && cur === orig) return true;
    if (nameQ.isFetched) return nameQ.data?.available ?? null;
    return null;
  };

  const persist = async (thenActivate: boolean) => {
    const vals = form.getValues();
    setMilestoneListError('');
    if (debouncedName.trim().length >= 3 && nameQ.isFetching) {
      form.setError('name', { type: 'manual', message: 'Esperá la verificación del nombre…' });
      return;
    }
    const nameAvailable = resolveNameAvailable();
    const { fieldErrors, milestonesListError } = validateStreakEditorFormWithListLimits(vals, nameAvailable);
    applyValidationErrors(form, fieldErrors);
    if (milestonesListError) setMilestoneListError(milestonesListError);
    if (Object.keys(fieldErrors).length > 0 || milestonesListError) return;
    const payload = buildProgramPayload(vals, isNew ? undefined : id);
    try {
      const saved = await save.mutateAsync(payload);
      if (thenActivate) await activate.mutateAsync(saved.id);
      nav('/rachas');
    } catch {
      /* toast desde API */
    }
  };

  const canAddMilestone = fields.length < 20;

  return (
    <FormProvider {...form}>
      <PageHeader
        title={isNew ? 'Crear programa de racha' : q.data?.name ?? 'Editar programa'}
        subtitle="Configuración guiada: reset, micro recompensa diaria e hitos sin JSON. El backend sigue siendo la fuente de verdad."
        actions={
          <Button variant="secondary" onClick={() => nav('/rachas')}>
            Volver al listado
          </Button>
        }
      />
      <ConfiguratorScaffold>
        <ConfigSection icon="📛" title="Nombre del programa">
          <input className="field" placeholder="Ej. Racha de login 7 días" {...form.register('name')} />
          <FieldErr path="name" />
          {debouncedName.trim().length >= 3 && nameQ.isFetching ? (
            <p className="mt-1 text-[14px] text-text-tertiary">Comprobando que el nombre esté disponible…</p>
          ) : null}
        </ConfigSection>

        <ConfigSection icon="🎯" title="Tipo de actividad">
          <select className="field" {...form.register('activity_type')}>
            {ACTIVITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldErr path="activity_type" />
          <ActivityConfigFields />
        </ConfigSection>

        <ConfigSection icon="🌐" title="Timezone (IANA)">
          <input className="field" list="streak-tz-list" {...form.register('timezone')} />
          <datalist id="streak-tz-list">
            {TIMEZONE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value} label={t.label} />
            ))}
          </datalist>
          <p className="mt-2 text-[14px] text-text-secondary">{timezoneFriendlyLabel(form.watch('timezone'))}</p>
          <FieldErr path="timezone" />
        </ConfigSection>

        <ConfigSection icon="🔁" title="Política de reset">
          <select className="field" {...form.register('reset_policy')}>
            {RESET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FieldErr path="reset_policy" />
          {resetPolicy === 'grace' ? (
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-[14px] text-text-secondary">Días de gracia permitidos en 30 días rolling</label>
                <input className="field max-w-xs" type="number" min={1} max={10} {...form.register('grace_days_rolling', { valueAsNumber: true })} />
                <FieldErr path="grace_days_rolling" />
              </div>
              <div>
                <p className="mb-2 text-[14px] text-text-secondary">Después de los días de gracia, ¿qué pasa?</p>
                <label className="mr-4 inline-flex items-center gap-2 text-[15px]">
                  <input type="radio" value="reset_to_zero" {...form.register('grace_after_action')} />
                  Reset a 0
                </label>
                <label className="inline-flex items-center gap-2 text-[15px]">
                  <input type="radio" value="lose_days" {...form.register('grace_after_action')} />
                  Pierde X días
                </label>
              </div>
              {form.watch('grace_after_action') === 'lose_days' ? (
                <div>
                  <label className="mb-1 block text-[14px] text-text-secondary">Cuántos días pierde (máx. según tus hitos)</label>
                  <input className="field max-w-xs" type="number" min={1} {...form.register('grace_days_lost', { valueAsNumber: true })} />
                  <FieldErr path="grace_days_lost" />
                </div>
              ) : null}
            </div>
          ) : null}
          {resetPolicy === 'soft_reset' ? (
            <div className="mt-4">
              <label className="mb-1 block text-[14px] text-text-secondary">
                Días que pierde al romper racha
                <FieldHint text="Días de gracia tras romper la racha. Si el jugador retoma dentro de este período, no pierde progreso. 0 = se reinicia inmediatamente al fallar 1 día." />
              </label>
              <input
                className="field max-w-xs"
                type="number"
                min={1}
                max={20}
                title="Si el jugador rompe la racha en día 10, pasa al día 7 (ejemplo con 3 días perdidos)."
                {...form.register('soft_days_lost_on_break', { valueAsNumber: true })}
              />
              <p className="mt-2 text-[13px] text-text-tertiary" title="Ejemplo ilustrativo">
                Tip: si rompe en día 10 y acá ponés 3, el jugador retoma visualmente cerca del día 7.
              </p>
              <FieldErr path="soft_days_lost_on_break" />
            </div>
          ) : null}
          {resetPolicy === 'strict' ? <p className="mt-2 text-[14px] text-text-tertiary">Sin parámetros adicionales.</p> : null}
        </ConfigSection>

        <ConfigSection
          icon="🎁"
          title={
            <>
              Micro recompensa diaria
              <FieldHint text="Premio pequeño que recibe el jugador POR DÍA al completar el objetivo diario. Independiente del premio final de la racha." />
            </>
          }
          description="Se entrega cada día que el jugador cumple el objetivo, sin esperar a terminar toda la racha."
        >
          <DailyRewardFields />
        </ConfigSection>

        <ConfigSection
          icon="🏁"
          title={
            <>
              Milestones
              <FieldHint text="Premios EXTRA al alcanzar días específicos (día 7, día 30, etc). Se suman a las micro recompensas y al premio final." />
            </>
          }
          description="Hasta 20 hitos · días únicos entre 1 y 365 · se ordenan al guardar."
        >
          {milestoneListError ? <p className="mb-2 text-[14px] text-danger">{milestoneListError}</p> : null}
          <div className="space-y-3">
            {milestoneOrder.map((i) => (
              <div key={fields[i]?.id ?? i} className="relative">
                <MilestoneCard index={i} />
                <div className="mt-2 flex justify-end">
                  <Button type="button" size="sm" variant="secondary" onClick={() => remove(i)}>
                    Quitar hito
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button type="button" variant="secondary" disabled={!canAddMilestone} onClick={() => append(emptyMilestoneRow(defaultCoin))}>
              + Agregar milestone
            </Button>
            {!canAddMilestone ? <span className="ml-2 text-[14px] text-text-tertiary">Límite 20 hitos</span> : null}
          </div>
        </ConfigSection>
      </ConfiguratorScaffold>

      <EditorPreviewBridge defTz={defaultTz} defCoin={defaultCoin} />

      <StickyBottomBar
        onCancel={() => nav('/rachas')}
        onSaveDraft={() => void persist(false)}
        onActivate={() => void persist(true)}
        loading={save.isPending || activate.isPending}
      />
    </FormProvider>
  );
}
