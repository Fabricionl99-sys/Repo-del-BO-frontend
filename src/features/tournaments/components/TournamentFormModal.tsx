import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { MediaUploaderRhf } from '@/components/media/MediaUploaderRhf';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Switch } from '@/components/ui/Switch';
import { ConfigSection, ConfiguratorScaffold } from '@/components/configurator/ConfiguratorScaffold';
import { RewardSelectorRhf } from '@/components/rewards/RewardSelectorRhf';
import { useOperatorGames, useSaveTournament } from '@/features/tournaments/tournamentsApi';
import {
  ACTIVITY_LABELS,
  AUDIENCE_LABELS,
  COMPETITION_LABELS,
  defaultTournamentForm,
  formToPayload,
  formatPositionRange,
  PERIOD_LABELS,
  REGISTRATION_LABELS,
  summarizePrizeReward,
  TOURNAMENT_ACTIVITY_TYPES,
  TOURNAMENT_COMPETITION_TYPES,
  TOURNAMENT_PERIOD_TYPES,
  TOURNAMENT_REGISTRATION_TYPES,
  tournamentFormSchema,
  tournamentToForm,
  type TournamentFormValues,
} from '@/features/tournaments/tournamentForm';
import { cn } from '@/lib/cn';
import type { Tournament } from '@/types/tournaments';

export function TournamentFormModal({
  open,
  tournament,
  existingCodes,
  onClose,
}: {
  open: boolean;
  tournament: Tournament | null;
  existingCodes: string[];
  onClose: () => void;
}) {
  const save = useSaveTournament();
  const gamesQ = useOperatorGames();
  const games = gamesQ.data ?? [];

  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: defaultTournamentForm(),
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

  const { fields: prizeFields, append: appendPrize, remove: removePrize } = useFieldArray({
    control,
    name: 'prizes',
  });

  const activityTypes = useWatch({ control, name: 'activity_types' }) ?? [];
  const audienceType = useWatch({ control, name: 'audience_type' });
  const registrationType = useWatch({ control, name: 'registration_type' });
  const specificGames = useWatch({ control, name: 'specific_games_only' }) ?? [];
  const isActive = watch('is_active');

  useEffect(() => {
    if (!open) return;
    reset(tournament ? tournamentToForm(tournament) : defaultTournamentForm());
  }, [open, tournament, reset]);

  const toggleActivity = (type: (typeof TOURNAMENT_ACTIVITY_TYPES)[number]) => {
    const next = activityTypes.includes(type)
      ? activityTypes.filter((t) => t !== type)
      : [...activityTypes, type];
    setValue('activity_types', next, { shouldValidate: true });
  };

  const toggleGame = (gameId: string) => {
    const next = specificGames.includes(gameId)
      ? specificGames.filter((g) => g !== gameId)
      : [...specificGames, gameId];
    setValue('specific_games_only', next);
  };

  const submit = handleSubmit(async (values) => {
    if (existingCodes.includes(values.code.trim()) && values.code.trim() !== tournament?.code) {
      form.setError('code', { message: 'El code ya existe' });
      return;
    }
    await save.mutateAsync({ id: tournament?.id, ...formToPayload(values) });
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tournament ? 'Editar torneo' : 'Nuevo torneo'}
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
        <ConfigSection icon="🏆" title="Datos básicos">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">code</label>
              <input className="field" {...register('code')} />
              {errors.code && <p className="mt-1 text-[13px] text-danger">{errors.code.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Nombre</label>
              <input className="field" {...register('name')} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Descripción</label>
            <textarea className="field min-h-[80px]" {...register('description')} />
          </div>
          <div>
            <label className="mb-1.5 block text-[14px] text-text-secondary">Banner del torneo</label>
            <MediaUploaderRhf
              control={control}
              name="image_url"
              context={{ module: 'tournaments', purpose: 'banner' }}
              error={errors.image_url?.message}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Inicio</label>
              <input type="datetime-local" className="field" {...register('period_starts_at')} />
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Fin</label>
              <input type="datetime-local" className="field" {...register('period_ends_at')} />
              {errors.period_ends_at && (
                <p className="mt-1 text-[13px] text-danger">{errors.period_ends_at.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">Tipo de período</label>
              <select className="field" {...register('period_type')}>
                {TOURNAMENT_PERIOD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PERIOD_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon="🎮" title="Tipo de actividad">
          <div className="flex flex-wrap gap-2">
            {TOURNAMENT_ACTIVITY_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleActivity(type)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[13px] font-semibold transition-colors',
                  activityTypes.includes(type)
                    ? 'border-accent bg-accent-subtle text-accent'
                    : 'border-border-default text-text-secondary hover:border-accent/40',
                )}
              >
                {ACTIVITY_LABELS[type]}
              </button>
            ))}
          </div>
          {errors.activity_types && (
            <p className="mt-2 text-[13px] text-danger">{errors.activity_types.message}</p>
          )}
        </ConfigSection>

        <ConfigSection icon="📊" title="Tipo de competencia">
          <div className="space-y-2">
            {TOURNAMENT_COMPETITION_TYPES.map((type) => (
              <label key={type} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle p-3 hover:border-accent/30">
                <input type="radio" value={type} {...register('competition_type')} className="mt-1" />
                <div>
                  <span className="text-[14px] font-semibold">{COMPETITION_LABELS[type]}</span>
                  <p className="text-[13px] text-text-tertiary">{type}</p>
                </div>
              </label>
            ))}
          </div>
        </ConfigSection>

        <ConfigSection icon="🔍" title="Filtros (opcional)">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[14px] text-text-secondary">min_bet_amount_usd</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="field"
                placeholder="Sin mínimo"
                {...register('min_bet_amount_usd', {
                  setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                })}
              />
            </div>
            {activityTypes.includes('sports') && (
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">min_odds</label>
                <input
                  type="number"
                  min={1}
                  step="0.01"
                  className="field"
                  placeholder="Sin mínimo"
                  {...register('min_odds', {
                    setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                  })}
                />
              </div>
            )}
          </div>
          <div className="mt-3">
            <label className="mb-2 block text-[14px] text-text-secondary">Juegos específicos</label>
            <div className="flex flex-wrap gap-2">
              {games.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGame(g.id)}
                  className={cn(
                    'rounded-lg border px-2 py-1 text-[13px]',
                    specificGames.includes(g.id)
                      ? 'border-accent bg-accent-subtle text-accent'
                      : 'border-border-default text-text-secondary',
                  )}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </ConfigSection>

        <ConfigSection icon="👥" title="Quiénes participan">
          <div className="space-y-2">
            {(['all_players', 'vip_only', 'new_players', 'by_level', 'by_country', 'manual_invite'] as const).map(
              (type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-subtle p-3"
                >
                  <input type="radio" value={type} {...register('audience_type')} />
                  <span className="text-[14px]">{AUDIENCE_LABELS[type]}</span>
                </label>
              ),
            )}
          </div>
          {audienceType === 'by_level' && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">Nivel mínimo</label>
                <input type="number" min={1} className="field" {...register('min_level', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="mb-1.5 block text-[14px] text-text-secondary">Nivel máximo</label>
                <input type="number" min={1} className="field" {...register('max_level', { valueAsNumber: true })} />
              </div>
            </div>
          )}
          {audienceType === 'by_country' && (
            <div className="mt-3">
              <label className="mb-1.5 block text-[14px] text-text-secondary">Países (códigos ISO)</label>
              <input className="field" placeholder="AR, BR, MX" {...register('countries')} />
            </div>
          )}
          {audienceType === 'manual_invite' && (
            <div className="mt-3">
              <label className="mb-1.5 block text-[14px] text-text-secondary">player_ids</label>
              <textarea className="field min-h-[80px]" placeholder="player_1, player_2" {...register('player_ids')} />
            </div>
          )}
        </ConfigSection>

        <ConfigSection icon="📝" title="Inscripción">
          <div className="space-y-2">
            {TOURNAMENT_REGISTRATION_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-3 text-[14px]">
                <input type="radio" value={type} {...register('registration_type')} />
                {REGISTRATION_LABELS[type]}
              </label>
            ))}
          </div>
          {registrationType === 'opt_in_paid' && (
            <div className="mt-3 max-w-xs">
              <label className="mb-1.5 block text-[14px] text-text-secondary">cost_in_coins</label>
              <input type="number" min={1} className="field" {...register('cost_in_coins', { valueAsNumber: true })} />
            </div>
          )}
        </ConfigSection>

        <ConfigSection icon="🎁" title="Premios">
          {errors.prizes?.message && (
            <p className="mb-2 text-[13px] text-danger">{String(errors.prizes.message)}</p>
          )}
          <div className="space-y-4">
            {prizeFields.map((field, index) => {
              return (
                <div key={field.id} className="card p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-semibold">
                      {formatPositionRange(
                        watch(`prizes.${index}.position_from`),
                        watch(`prizes.${index}.position_to`),
                      )}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={prizeFields.length <= 1}
                      icon={<Trash2 size={14} />}
                      onClick={() => removePrize(index)}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-[14px] text-text-secondary">Desde</label>
                      <input
                        type="number"
                        min={1}
                        className="field"
                        {...register(`prizes.${index}.position_from`, { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[14px] text-text-secondary">Hasta</label>
                      <input
                        type="number"
                        min={1}
                        className="field"
                        {...register(`prizes.${index}.position_to`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                  <div className="mt-3">
                    <RewardSelectorRhf
                      moduleKey="tournaments"
                      control={control}
                      name={`prizes.${index}.reward`}
                    />
                  </div>
                  <p className="mt-2 text-[13px] text-text-tertiary">
                    {summarizePrizeReward(watch(`prizes.${index}`))}
                  </p>
                </div>
              );
            })}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            icon={<Plus size={14} />}
            onClick={() =>
              appendPrize({
                position_from: prizeFields.length + 1,
                position_to: prizeFields.length + 1,
                reward: { reward_type: 'coins', reward_config: { amount: 1000, currency_code: 'main' }, currency_mode: 'auto_usd' },
              })
            }
          >
            Agregar premio
          </Button>
        </ConfigSection>

        <div className="flex items-center justify-between rounded-lg border border-border-subtle p-4">
          <span className="text-[14px] text-text-secondary">Torneo activo</span>
          <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
        </div>
      </ConfiguratorScaffold>
    </Modal>
  );
}
