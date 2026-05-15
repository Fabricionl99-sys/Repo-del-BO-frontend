import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { ConfiguratorScaffold, ConfigSection } from '@/components/configurator/ConfiguratorScaffold';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { StickyBottomBar } from '@/features/rules/components/RuleBlocks';
import { useActivateStreakProgram, useSaveStreakProgram, useStreakProgram } from '@/features/streakProgramsApi';
import { toast } from '@/stores/toastStore';
import type { StreakActivityType, StreakProgram, StreakResetPolicy } from '@/types/streakPrograms';

const ACTIVITY_OPTIONS: { value: StreakActivityType; label: string }[] = [
  { value: 'login', label: 'Login diario' },
  { value: 'deposit_individual', label: 'Depósito individual' },
  { value: 'deposit_cumulative', label: 'Depósitos acumulados' },
  { value: 'bet_individual', label: 'Apuesta individual' },
  { value: 'bet_cumulative', label: 'Apuestas acumuladas' },
];

const RESET_OPTIONS: { value: StreakResetPolicy; label: string }[] = [
  { value: 'strict', label: 'Estricto (sin gracia)' },
  { value: 'grace', label: 'Gracia (horas extra)' },
  { value: 'soft_reset', label: 'Soft reset (JSON avanzado)' },
];

const MILESTONE_REWARD_TYPES = ['coins', 'xp', 'chest', 'freespin', 'freebet', 'cashback', 'bonus_deposit'] as const;

const TIMEZONE_HINTS = [
  'America/Argentina/Buenos_Aires',
  'America/Mexico_City',
  'America/Santiago',
  'Europe/Madrid',
  'UTC',
];

type DailyKind = 'xp' | 'coins' | 'json';

type StreakEditorForm = {
  name: string;
  activity_type: StreakActivityType;
  timezone: string;
  reset_policy: StreakResetPolicy;
  grace_hours: number;
  soft_reset_config_json: string;
  daily_kind: DailyKind;
  daily_amount: number;
  daily_coin_id: string;
  daily_json: string;
  milestones: { day_number: number; reward_type: string; reward_config_json: string }[];
};

const defaultForm = (): StreakEditorForm => ({
  name: '',
  activity_type: 'login',
  timezone: 'America/Argentina/Buenos_Aires',
  reset_policy: 'strict',
  grace_hours: 36,
  soft_reset_config_json: '{}',
  daily_kind: 'xp',
  daily_amount: 25,
  daily_coin_id: 'coin_oro',
  daily_json: '{"type":"xp","amount":25}',
  milestones: [{ day_number: 7, reward_type: 'coins', reward_config_json: '{"amount":500,"coin_id":"coin_oro"}' }],
});

function programToForm(p: StreakProgram): StreakEditorForm {
  const dr = p.daily_micro_reward;
  let daily_kind: DailyKind = 'json';
  let daily_amount = 0;
  let daily_coin_id = '';
  const daily_json = JSON.stringify(dr ?? {}, null, 2);
  if (dr && typeof dr === 'object' && !Array.isArray(dr)) {
    const t = dr.type;
    if (t === 'xp') {
      daily_kind = 'xp';
      daily_amount = Number(dr.amount ?? 0);
    } else if (t === 'coins') {
      daily_kind = 'coins';
      daily_amount = Number(dr.amount ?? 0);
      daily_coin_id = String(dr.coin_id ?? '');
    }
  }
  let grace_hours = 36;
  let soft_reset_config_json = '{}';
  if (p.reset_policy === 'grace') {
    grace_hours = Number(p.reset_policy_config?.grace_hours ?? 36);
  } else if (p.reset_policy === 'soft_reset') {
    soft_reset_config_json = JSON.stringify(p.reset_policy_config ?? {}, null, 2);
  }
  return {
    name: p.name,
    activity_type: p.activity_type,
    timezone: p.timezone,
    reset_policy: p.reset_policy,
    grace_hours,
    soft_reset_config_json,
    daily_kind,
    daily_amount,
    daily_coin_id,
    daily_json,
    milestones: (p.milestones ?? []).map((m) => ({
      day_number: m.day_number,
      reward_type: m.reward_type,
      reward_config_json: JSON.stringify(m.reward_config ?? {}, null, 2),
    })),
  };
}

function buildPayload(f: StreakEditorForm, id?: string): Partial<StreakProgram> & { id?: string } {
  let reset_policy_config: Record<string, unknown> = {};
  if (f.reset_policy === 'grace') {
    reset_policy_config = { grace_hours: Math.max(1, Math.round(f.grace_hours)) };
  } else if (f.reset_policy === 'soft_reset') {
    try {
      reset_policy_config = JSON.parse(f.soft_reset_config_json.trim() || '{}') as Record<string, unknown>;
      if (typeof reset_policy_config !== 'object' || reset_policy_config === null || Array.isArray(reset_policy_config)) {
        throw new Error('Debe ser un objeto JSON');
      }
    } catch {
      throw new Error('Config de soft reset: JSON inválido');
    }
  }

  let daily_micro_reward: Record<string, unknown>;
  if (f.daily_kind === 'xp') {
    daily_micro_reward = { type: 'xp', amount: f.daily_amount };
  } else if (f.daily_kind === 'coins') {
    daily_micro_reward = { type: 'coins', amount: f.daily_amount, coin_id: f.daily_coin_id.trim() || 'coin_oro' };
  } else {
    try {
      daily_micro_reward = JSON.parse(f.daily_json.trim() || '{}') as Record<string, unknown>;
      if (typeof daily_micro_reward !== 'object' || daily_micro_reward === null || Array.isArray(daily_micro_reward)) {
        throw new Error('Debe ser un objeto JSON');
      }
    } catch {
      throw new Error('Micro recompensa diaria: JSON inválido');
    }
  }

  const milestones = f.milestones.map((m) => {
    let reward_config: Record<string, unknown>;
    try {
      reward_config = JSON.parse(m.reward_config_json.trim() || '{}') as Record<string, unknown>;
      if (typeof reward_config !== 'object' || reward_config === null || Array.isArray(reward_config)) {
        throw new Error('Debe ser un objeto');
      }
    } catch {
      throw new Error(`Milestone día ${m.day_number}: JSON de reward_config inválido`);
    }
    return {
      day_number: Math.max(1, Math.round(m.day_number)),
      reward_type: m.reward_type,
      reward_config,
    };
  });

  milestones.sort((a, b) => a.day_number - b.day_number);

  const base: Partial<StreakProgram> & { id?: string } = {
    name: f.name.trim(),
    activity_type: f.activity_type,
    timezone: f.timezone.trim(),
    reset_policy: f.reset_policy,
    reset_policy_config,
    daily_micro_reward,
    milestones,
  };
  if (id) base.id = id;
  return base;
}

export default function StreakProgramEditorPage() {
  const { id } = useParams();
  const isNew = !id;
  const nav = useNavigate();
  const q = useStreakProgram(isNew ? null : id!);
  const save = useSaveStreakProgram();
  const activate = useActivateStreakProgram();

  const form = useForm<StreakEditorForm>({ defaultValues: defaultForm() });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'milestones' });

  useEffect(() => {
    if (!isNew && q.data) {
      form.reset(programToForm(q.data));
    }
  }, [isNew, q.data, form]);

  const resetPolicy = form.watch('reset_policy');
  const dailyKind = form.watch('daily_kind');

  if (!isNew && q.isLoading) return <Loading label="Cargando programa..." />;
  if (!isNew && q.isError) return <ErrorState onRetry={() => q.refetch()} />;

  const persist = async (thenActivate: boolean) => {
    if (!form.getValues('name').trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    let payload: Partial<StreakProgram> & { id?: string };
    try {
      payload = buildPayload(form.getValues(), isNew ? undefined : id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Revisá los datos del formulario');
      return;
    }
    try {
      const saved = await save.mutateAsync(payload);
      if (thenActivate) {
        await activate.mutateAsync(saved.id);
      }
      nav('/rachas');
    } catch {
      /* toast desde mutation si aplica */
    }
  };

  return (
    <FormProvider {...form}>
      <PageHeader
        title={isNew ? 'Crear programa de racha' : q.data?.name ?? 'Editar programa'}
        subtitle="Actividad, timezone, política de reset, micro recompensa diaria e hitos (milestones). Los JSON deben ser objetos válidos."
        actions={
          <Button variant="secondary" onClick={() => nav('/rachas')}>
            Volver al listado
          </Button>
        }
      />
      <ConfiguratorScaffold>
        <ConfigSection icon="📛" title="Nombre">
          <input className="field" placeholder="Ej. Racha de login 7 días" {...form.register('name', { required: true })} />
        </ConfigSection>

        <ConfigSection icon="🎯" title="Tipo de actividad">
          <select className="field" {...form.register('activity_type')}>
            {ACTIVITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </ConfigSection>

        <ConfigSection icon="🌐" title="Timezone (IANA)">
          <input className="field" list="streak-timezones" {...form.register('timezone')} />
          <datalist id="streak-timezones">
            {TIMEZONE_HINTS.map((tz) => (
              <option key={tz} value={tz} />
            ))}
          </datalist>
          <p className="mt-2 text-[11px] text-text-tertiary">Usá un timezone IANA válido; el backend calcula cortes de día en esa zona.</p>
        </ConfigSection>

        <ConfigSection icon="🔁" title="Política de reset">
          <select className="field" {...form.register('reset_policy')}>
            {RESET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {resetPolicy === 'grace' ? (
            <div className="mt-3">
              <label className="mb-1 block text-[12px] text-text-secondary">Horas de gracia</label>
              <input className="field" type="number" min={1} max={168} {...form.register('grace_hours', { valueAsNumber: true })} />
            </div>
          ) : null}
          {resetPolicy === 'soft_reset' ? (
            <div className="mt-3">
              <label className="mb-1 block text-[12px] text-text-secondary">reset_policy_config (JSON)</label>
              <textarea className="field min-h-28 font-mono text-[12px]" {...form.register('soft_reset_config_json')} />
            </div>
          ) : null}
          {resetPolicy === 'strict' ? <p className="mt-2 text-[12px] text-text-tertiary">Sin parámetros adicionales en reset_policy_config.</p> : null}
        </ConfigSection>

        <ConfigSection icon="🎁" title="Micro recompensa diaria (JSONB)">
          <select className="field" {...form.register('daily_kind')}>
            <option value="xp">XP fija</option>
            <option value="coins">Monedas</option>
            <option value="json">JSON libre</option>
          </select>
          {dailyKind === 'xp' ? (
            <div className="mt-3 grid max-w-xs grid-cols-1 gap-3">
              <div>
                <label className="mb-1 block text-[12px] text-text-secondary">Cantidad XP</label>
                <input className="field" type="number" min={0} {...form.register('daily_amount', { valueAsNumber: true })} />
              </div>
            </div>
          ) : null}
          {dailyKind === 'coins' ? (
            <div className="mt-3 grid max-w-md grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12px] text-text-secondary">Cantidad</label>
                <input className="field" type="number" min={0} {...form.register('daily_amount', { valueAsNumber: true })} />
              </div>
              <div>
                <label className="mb-1 block text-[12px] text-text-secondary">coin_id</label>
                <input className="field" {...form.register('daily_coin_id')} />
              </div>
            </div>
          ) : null}
          {dailyKind === 'json' ? (
            <div className="mt-3">
              <textarea className="field min-h-32 font-mono text-[12px]" {...form.register('daily_json')} />
            </div>
          ) : null}
        </ConfigSection>

        <ConfigSection icon="🏁" title="Milestones">
          <p className="mb-3 text-[12px] text-text-tertiary">
            Cada hito define el día del programa y la recompensa. reward_config debe ser un objeto JSON (ej. monto, coin_id, chest_id).
          </p>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
                <div className="mb-3 flex flex-wrap items-end gap-3">
                  <div className="w-24">
                    <label className="mb-1 block text-[11px] text-text-secondary">Día</label>
                    <input className="field" type="number" min={1} {...form.register(`milestones.${index}.day_number`, { valueAsNumber: true })} />
                  </div>
                  <div className="min-w-[160px] flex-1">
                    <label className="mb-1 block text-[11px] text-text-secondary">reward_type</label>
                    <select className="field" {...form.register(`milestones.${index}.reward_type`)}>
                      {MILESTONE_REWARD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="button" size="sm" variant="secondary" onClick={() => remove(index)}>
                    Quitar
                  </Button>
                </div>
                <label className="mb-1 block text-[11px] text-text-secondary">reward_config (JSON)</label>
                <textarea className="field min-h-24 font-mono text-[11px]" {...form.register(`milestones.${index}.reward_config_json`)} />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => append({ day_number: 1, reward_type: 'coins', reward_config_json: '{"amount":100,"coin_id":"coin_oro"}' })}
            >
              + Agregar milestone
            </Button>
          </div>
        </ConfigSection>
      </ConfiguratorScaffold>

      <StickyBottomBar
        onCancel={() => nav('/rachas')}
        onSaveDraft={() => void persist(false)}
        onActivate={() => void persist(true)}
        loading={save.isPending || activate.isPending}
      />
    </FormProvider>
  );
}
