import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';

import { FieldHint } from '@/components/ui/FieldHint';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfiguratorScaffold, ConfigSection } from '@/components/configurator/ConfiguratorScaffold';
import { RewardSelectorRhf } from '@/components/rewards/RewardSelectorRhf';
import { MissionRequirementsEditor } from '@/features/missions/components/MissionRequirementsEditor';
import { MissionAvailabilityWindowEditor } from '@/features/missions/components/MissionAvailabilityWindowEditor';
import { summarizeActions } from '@/features/missions/missionActions';
import { availabilityWindowToIso } from '@/features/missions/missionAvailability';
import {
  defaultMissionForm,
  missionFormSchema,
  slugifyMissionCode,
  type MissionFormValues,
} from '@/features/missions/missionForm';
import { StickyBottomBar } from '@/features/rules/components/RuleBlocks';
import { useMission, useSaveMission } from '@/features/missionsApi';
import { trackEvent } from '@/lib/analytics';

export default function MissionEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === 'nueva';
  const q = useMission(isNew ? null : id!);
  const save = useSaveMission();
  const nav = useNavigate();

  const form = useForm<MissionFormValues>({
    resolver: zodResolver(missionFormSchema) as Resolver<MissionFormValues>,
    defaultValues: defaultMissionForm(),
  });

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = form;
  const name = watch('name');
  const code = watch('code');
  const actions = watch('actions');
  const dailyHours = watch('daily_validity_hours');
  const availabilityWindow = watch('availability_window');
  const availabilityIso = availabilityWindowToIso(availabilityWindow ?? defaultMissionForm().availability_window);

  useEffect(() => {
    if (q.data) reset(q.data);
  }, [q.data, reset]);

  useEffect(() => {
    if (!isNew || !name.trim()) return;
    const slug = slugifyMissionCode(name);
    if (slug !== code) setValue('code', slug, { shouldDirty: true });
  }, [isNew, name, code, setValue]);

  if (!isNew && q.isLoading) return <Loading label="Cargando misión..." />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} />;

  const submit = async (activate: boolean) => {
    await handleSubmit(async (values) => {
      await save.mutateAsync({
        id: isNew ? undefined : id,
        values,
        activate,
      });
      if (isNew) trackEvent('mission_created');
      nav('/misiones');
    })();
  };

  return (
    <FormProvider {...form}>
      <PageHeader
        title={isNew ? 'Crear misión' : q.data?.name ?? 'Misión'}
        subtitle="Configurá requisitos y recompensas para tus jugadores"
      />
      <div className="grid grid-cols-[1fr_320px] gap-6 max-[1400px]:grid-cols-1">
        <ConfiguratorScaffold>
          <ConfigSection icon="📋" title="Información básica">
            <input className="field" placeholder="Nombre de la misión" {...register('name')} />
            {errors.name && <p className="mt-1 text-[13px] text-danger">{errors.name.message}</p>}
            <textarea className="field min-h-24" placeholder="Descripción" {...register('description')} />
            {errors.description && (
              <p className="mt-1 text-[13px] text-danger">{errors.description.message}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">Tipo</label>
                <select className="field" {...register('type')}>
                  <option value="daily">Diaria</option>
                  <option value="escalonada">Escalonada</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">
                  Código (slug)
                  <FieldHint text="Se genera automáticamente del nombre (minúsculas, números, _ o -). Podés ajustarlo antes de guardar." />
                </label>
                <input
                  className="field font-mono text-[13px]"
                  placeholder="ej: mision_vip_casino"
                  readOnly={isNew}
                  {...register('code', {
                    onBlur: (e) => {
                      const slug = slugifyMissionCode(e.target.value || name);
                      if (slug) setValue('code', slug, { shouldDirty: true });
                    },
                  })}
                />
              </div>
            </div>
          </ConfigSection>

          <ConfigSection icon="🎯" title="Requisitos">
            <MissionRequirementsEditor />
          </ConfigSection>

          <ConfigSection icon="🎁" title="Recompensas">
            <RewardSelectorRhf moduleKey="missions" control={control} name="primaryReward" />
          </ConfigSection>

          <ConfigSection icon="⏰" title="Vigencia">
            <div className="max-w-md">
              <label className="mb-1.5 block text-[14px] text-text-secondary">
                Horas de validez desde asignación
                <FieldHint text="Cuántas horas vive la misión para el jugador una vez asignada (1–168). Daily suele ser 24h." />
              </label>
              <input
                className="field"
                type="number"
                min={1}
                max={168}
                {...register('daily_validity_hours', { valueAsNumber: true })}
              />
              {errors.daily_validity_hours && (
                <p className="mt-1 text-[13px] text-danger">{errors.daily_validity_hours.message}</p>
              )}
            </div>
            <input type="hidden" {...register('timezone')} />
          </ConfigSection>

          <ConfigSection icon="📅" title="Ventana de disponibilidad">
            <MissionAvailabilityWindowEditor />
          </ConfigSection>
        </ConfiguratorScaffold>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="section-title mb-3">Preview</h3>
            <div className="rounded-xl bg-bg-tertiary p-4">
              <h4 className="font-semibold">{name || 'Nueva misión'}</h4>
              <p className="mt-2 text-[14px] text-text-tertiary">{summarizeActions(actions)}</p>
              <p className="mt-2 text-[12px] text-text-tertiary">
                Vigencia: {dailyHours}h desde asignación
              </p>
              {(availabilityIso.available_from || availabilityIso.available_until) && (
                <p className="mt-1 text-[12px] text-text-tertiary">
                  Disponible{' '}
                  {availabilityIso.available_from
                    ? `desde ${new Date(availabilityIso.available_from).toLocaleString('es-AR')}`
                    : 'sin inicio'}
                  {' · '}
                  {availabilityIso.available_until
                    ? `hasta ${new Date(availabilityIso.available_until).toLocaleString('es-AR')}`
                    : 'sin cierre'}
                </p>
              )}
              <div className="mt-3 h-2 rounded-full bg-bg-elevated">
                <div className="h-full w-1/4 rounded-full bg-accent" />
              </div>
            </div>
          </div>
        </aside>
      </div>
      <StickyBottomBar
        onCancel={() => nav('/misiones')}
        onSaveDraft={() => void submit(false)}
        onActivate={() => void submit(true)}
        loading={save.isPending}
      />
    </FormProvider>
  );
}
