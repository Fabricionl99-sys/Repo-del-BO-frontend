import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import { DayOfWeekSelector } from '@/components/ui/DayOfWeekSelector';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfiguratorScaffold, ConfigSection } from '@/components/configurator/ConfiguratorScaffold';
import { RewardSelectorRhf } from '@/components/rewards/RewardSelectorRhf';
import { StickyBottomBar } from '@/features/rules/components/RuleBlocks';
import {
  defaultMissionForm,
  formToMissionPayload,
  missionFormSchema,
  missionToForm,
  type MissionFormValues,
} from '@/features/missions/missionForm';
import {
  getTriggerDef,
  getTriggerLabel,
  MISSION_TRIGGER_GROUPS,
  TRIGGER_CONFIG_LABELS,
  type TriggerConfigField,
} from '@/features/missions/missionTriggers';
import { useCapabilityChecks } from '@/features/capabilities/useCapabilityChecks';
import { trackEvent } from '@/lib/analytics';
import { useMission, useSaveMission } from '@/features/tier3Api';

const ICONS = ['🎯', '💰', '🎰', '🃏', '⚡', '🔥', '🏦', '⚽', '🤝', '👤'];

export default function MissionEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === 'nueva';
  const q = useMission(isNew ? null : id!);
  const save = useSaveMission();
  const nav = useNavigate();
  const [days, setDays] = useState([1, 2, 3, 4, 5, 6, 0]);

  const form = useForm<MissionFormValues>({
    resolver: zodResolver(missionFormSchema),
    defaultValues: defaultMissionForm(),
  });

  const { register, handleSubmit, reset, setValue, control, watch, formState: { errors } } = form;
  const { isEventActive, capabilityDisabledTooltip } = useCapabilityChecks();
  const trigger = useWatch({ control, name: 'trigger' });
  const triggerDef = getTriggerDef(trigger);
  const name = watch('name');
  const targetValue = watch('targetValue');

  useEffect(() => {
    if (q.data) {
      reset(missionToForm(q.data));
      if (q.data.availability.daysOfWeek) setDays(q.data.availability.daysOfWeek);
    }
  }, [q.data, reset]);

  if (!isNew && q.isLoading) return <Loading label="Cargando misión..." />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} />;

  const submit = async (status: 'draft' | 'active') => {
    await handleSubmit(async (values) => {
      await save.mutateAsync(
        formToMissionPayload(values, { id: isNew ? undefined : id, status, daysOfWeek: days }),
      );
      if (isNew) trackEvent('mission_created');
      nav('/misiones');
    })();
  };

  return (
    <FormProvider {...form}>
      <PageHeader
        title={isNew ? 'Crear misión' : q.data?.name ?? 'Misión'}
        subtitle="Configurá un objetivo con recompensas para tus jugadores"
      />
      <div className="grid grid-cols-[1fr_320px] gap-6 max-[1400px]:grid-cols-1">
        <ConfiguratorScaffold>
          <ConfigSection icon="📋" title="Información básica">
            <input className="field" placeholder="Nombre de la misión" {...register('name')} />
            {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
            <textarea className="field min-h-24" placeholder="Descripción" {...register('description')} />
            {errors.description && <p className="mt-1 text-[13px] text-danger">{errors.description.message}</p>}
            <div className="flex flex-wrap gap-2">
              {ICONS.map((e) => (
                <button
                  type="button"
                  key={e}
                  className={`rounded-lg border p-3 text-lg ${watch('iconKey') === e ? 'border-accent bg-accent-subtle' : 'border-border-subtle bg-bg-tertiary'}`}
                  onClick={() => setValue('iconKey', e)}
                >
                  {e}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">tipo</label>
                <select className="field" {...register('type')}>
                  <option value="daily">diaria</option>
                  <option value="weekly">semanal</option>
                  <option value="monthly">mensual</option>
                  <option value="one_time">única</option>
                  <option value="event">evento</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">categoría</label>
                <input className="field" {...register('category')} />
              </div>
            </div>
          </ConfigSection>

          <ConfigSection icon="🎯" title="Objetivo">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary" htmlFor="mission-trigger">
                trigger
              </label>
              <select id="mission-trigger" className="field" {...register('trigger')}>
                {MISSION_TRIGGER_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.triggers.map((t) => {
                      const eventDisabled = !isEventActive(t.code);
                      return (
                        <option
                          key={t.code}
                          value={t.code}
                          disabled={eventDisabled}
                          title={eventDisabled ? capabilityDisabledTooltip : undefined}
                        >
                          {t.label}
                          {eventDisabled ? ' (no habilitado)' : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </select>
              {!isEventActive(trigger) && (
                <p className="mt-2 text-[13px] text-text-tertiary">
                  {capabilityDisabledTooltip}{' '}
                  <Link to="/capabilities" className="text-accent hover:underline">
                    Ir a Capacidades
                  </Link>
                </p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">valor objetivo</label>
              <input className="field" type="number" min={1} {...register('targetValue', { valueAsNumber: true })} />
              {errors.targetValue && <p className="mt-1 text-[13px] text-danger">{errors.targetValue.message}</p>}
            </div>
            {triggerDef && triggerDef.configFields.length > 0 && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-border-subtle bg-bg-tertiary/50 p-3">
                {triggerDef.configFields.map((field: TriggerConfigField) => (
                  <div key={field}>
                    <label className="mb-1.5 block text-[14px] text-text-secondary">
                      {TRIGGER_CONFIG_LABELS[field]}
                    </label>
                    <input
                      className="field"
                      type="number"
                      min={1}
                      {...register(`trigger_config.${field}`, { valueAsNumber: true })}
                    />
                    {errors.trigger_config?.[field] && (
                      <p className="mt-1 text-[13px] text-danger">
                        {(errors.trigger_config[field] as { message?: string })?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ConfigSection>

          <ConfigSection icon="🎁" title="Recompensas">
            <RewardSelectorRhf moduleKey="missions" control={control} name="primaryReward" />
          </ConfigSection>

          <ConfigSection icon="⏰" title="Disponibilidad">
            <DayOfWeekSelector value={days} onChange={setDays} />
            <label className="mt-3 flex items-center gap-2 text-[14px]">
              <input type="checkbox" {...register('allPlayers')} />
              todos los jugadores
            </label>
          </ConfigSection>
        </ConfiguratorScaffold>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="section-title mb-3">preview</h3>
            <div className="rounded-xl bg-bg-tertiary p-4">
              <div className="text-2xl">{watch('iconKey')}</div>
              <h4 className="font-semibold">{name || 'Nueva misión'}</h4>
              <p className="text-[14px] text-text-tertiary">
                {getTriggerLabel(trigger)} · progreso 0/{targetValue}
              </p>
              <div className="mt-3 h-2 rounded-full bg-bg-elevated">
                <div className="h-full w-1/4 rounded-full bg-accent" />
              </div>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="section-title mb-2">tips</h3>
            <p className="text-[14px] text-text-tertiary">
              Las misiones weekly se renuevan cada lunes 00:00 UTC del operador.
            </p>
          </div>
        </aside>
      </div>
      <StickyBottomBar
        onCancel={() => nav('/misiones')}
        onSaveDraft={() => void submit('draft')}
        onActivate={() => void submit('active')}
        loading={save.isPending}
      />
    </FormProvider>
  );
}
