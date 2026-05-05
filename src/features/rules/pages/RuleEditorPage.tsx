import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Switch } from '@/components/ui/Switch';
import { useRule, useSaveRule } from '@/features/rulesApi';
import { useEnabledCategories } from '@/features/settingsApi';
import { EVENTS_BY_CATEGORY, UNIVERSAL_EVENTS, type RuleBoost, type TriggerEvent } from '@/types/rules';
import { CATEGORIES, type GameCategory } from '@/types/expandedTier5';
import { CategorySelector } from '../components/CategorySelector';
import type { XPRule } from '@/types/rules';
import { BlockConditions } from '../components/BlockConditions';
import { Block, BlockConnector, StickyBottomBar } from '../components/RuleBlocks';

type Values = {
  name: string;
  description: string;
  trigger: { event: TriggerEvent; category: GameCategory };
  conditionsLogic: 'all' | 'any';
  conditions: { field: string; operator: string; value: string | number | boolean | string[] }[];
  action: { xpBase: number; xpMaxPerEvent?: number | null };
  boost?: RuleBoost;
};

const fallbackCategories: GameCategory[] = ['deportes', 'casino', 'casino_vivo', 'virtuales', 'poker'];
const localDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const boostDefaults = (category: GameCategory): RuleBoost => {
  const starts = new Date();
  const ends = new Date(starts);
  ends.setDate(starts.getDate() + 7);
  ends.setHours(23, 59, 0, 0);
  return {
    enabled: true,
    multiplier: 2,
    starts_at: localDateTime(starts),
    ends_at: localDateTime(ends),
    scope: 'category',
    category_code: category,
  };
};
const normalizeBoostForForm = (rule?: XPRule): Values | undefined =>
  rule
    ? {
        ...rule,
        trigger: { event: rule.trigger.event, category: rule.trigger.category ?? rule.category },
        boost: rule.boost
          ? {
              ...rule.boost,
              starts_at: localDateTime(new Date(rule.boost.starts_at)),
              ends_at: localDateTime(new Date(rule.boost.ends_at)),
            }
          : undefined,
      }
    : undefined;
const toIsoBoost = (boost?: RuleBoost) =>
  boost?.enabled
    ? {
        ...boost,
        category_code: boost.scope === 'category' ? boost.category_code : undefined,
        starts_at: new Date(boost.starts_at).toISOString(),
        ends_at: new Date(boost.ends_at).toISOString(),
      }
    : undefined;

export default function RuleEditorPage() {
  const { id } = useParams();
  const isNew = !id || id === 'nueva';
  const nav = useNavigate();
  const q = useRule(isNew ? null : id!);
  const enabledCategories = useEnabledCategories();
  const save = useSaveRule();
  const form = useForm<Values>({
    values: normalizeBoostForForm(q.data),
    defaultValues: {
      name: 'Nueva regla de XP',
      description: 'configurá el trigger, condiciones, acción y boost temporal',
      trigger: { event: 'bet_placed', category: 'deportes' },
      conditionsLogic: 'all',
      conditions: [{ field: 'amount', operator: 'gte', value: '5' }],
      action: { xpBase: 50, xpMaxPerEvent: 2000 },
      boost: undefined,
    },
  });

  if (!isNew && q.isLoading) return <Loading label="Cargando regla..." />;
  if (q.isError) return <ErrorState onRetry={() => q.refetch()} />;

  const submit = async (status: 'draft' | 'active') => {
    const values = form.getValues();
    const boost = toIsoBoost(values.boost);
    if (boost?.scope === 'category' && !boost.category_code) {
      form.setError('boost.category_code', { message: 'Debés elegir una categoría' });
      return;
    }
    await save.mutateAsync({ id: isNew ? null : id!, values: { ...(values as Partial<XPRule>), boost, status } });
    nav('/reglas-xp');
  };

  return (
    <FormProvider {...form}>
      <PageHeader title={isNew ? 'Nueva regla de XP' : q.data?.name ?? 'Regla de XP'} subtitle="configurá el trigger, condiciones, acción y boost temporal" actions={<><Button size="sm" variant="ghost">Duplicar</Button><Button size="sm">Archivar</Button></>} />
      <div className="grid grid-cols-[1fr_320px] gap-6 max-[1400px]:grid-cols-1">
        <div>
          <BlockTrigger enabledCategories={enabledCategories} existingRules={q.data ? [q.data] : []} />
          <BlockConnector />
          <BlockConditions />
          <BlockConnector />
          <BlockAction />
          <BlockConnector />
          <BlockBoost enabledCategories={enabledCategories.length ? enabledCategories : fallbackCategories} />
        </div>
        <aside className="space-y-4 max-[1400px]:hidden"><PreviewPanel /></aside>
      </div>
      <StickyBottomBar onCancel={() => nav('/reglas-xp')} onSaveDraft={() => submit('draft')} onActivate={() => submit('active')} loading={save.isPending} />
    </FormProvider>
  );
}

function Field({ name, label }: { name: keyof Values | 'description'; label: string }) {
  const { register } = useFormContext<Values>();
  return <label className="block"><span className="mb-1.5 block text-[12px] text-text-secondary">{label}</span><input aria-label={label} className="field" {...register(name as keyof Values)} /></label>;
}
function BlockTrigger({ enabledCategories }: { enabledCategories: GameCategory[]; existingRules: XPRule[] }) {
  return <Block num={1} kind="trigger" kindLabel="cuando · trigger" title="¿qué evento dispara esta regla?"><div className="grid gap-4"><Field name="name" label="nombre" /><Field name="description" label="descripción" /><CategoryEventFields enabledCategories={enabledCategories} /></div></Block>;
}
function CategoryEventFields({ enabledCategories }: { enabledCategories: GameCategory[] }) {
  const { watch, setValue, register } = useFormContext<Values>();
  const category = watch('trigger.category');
  const events = EVENTS_BY_CATEGORY[category] ?? UNIVERSAL_EVENTS;
  return <><CategorySelector value={category} onChange={(value) => { setValue('trigger.category', value); const allowed = EVENTS_BY_CATEGORY[value] ?? UNIVERSAL_EVENTS; if (!allowed.includes(watch('trigger.event'))) setValue('trigger.event', allowed[0]); }} enabledCategories={enabledCategories.length ? enabledCategories : fallbackCategories} /><label><span className="mb-1.5 block text-[12px] text-text-secondary">tipo de evento</span><select className="field" {...register('trigger.event')}>{events.map((event) => <option key={event} value={event}>{event}</option>)}</select></label></>;
}
function BlockAction() {
  const { register } = useFormContext<Values>();
  return <Block num={3} kind="action" kindLabel="entonces · acción" title="¿qué XP otorgar?" active><div className="grid gap-4"><label><span className="mb-1.5 block text-[12px] text-text-secondary">XP base</span><input type="number" className="field" {...register('action.xpBase')} /></label><label><span className="mb-1.5 block text-[12px] text-text-secondary">XP máxima por evento</span><input type="number" className="field" {...register('action.xpMaxPerEvent')} /></label><p className="rounded-lg border border-info/25 bg-info/10 p-3 text-[12px] text-text-secondary">Los coins ya no se configuran por regla. Se calculan globalmente desde Economía.</p></div></Block>;
}
function BlockBoost({ enabledCategories }: { enabledCategories: GameCategory[] }) {
  const { register, watch, setValue, formState: { errors } } = useFormContext<Values>();
  const boost = watch('boost');
  const ruleCategory = watch('trigger.category');
  const enabled = !!boost?.enabled;
  const multiplier = boost?.multiplier ?? 2;
  const scope = boost?.scope ?? 'category';
  return <Block num={4} kind="multiplier" kindLabel="boost temporal" title="multiplicar XP por tiempo limitado"><div className="space-y-4"><div className="flex items-center gap-3"><Switch aria-label="activar boost temporal" checked={enabled} onChange={(checked) => setValue('boost', checked ? boostDefaults(ruleCategory) : undefined, { shouldDirty: true })} /><div><div className="text-[13px] font-medium">activar boost</div><p className="text-[11px] text-text-tertiary">sumá una ventana simple de XP extra para esta regla.</p></div></div>{enabled && <div className="space-y-4 rounded-lg border border-border-subtle bg-bg-tertiary p-4"><div><span className="mb-2 block text-[12px] text-text-secondary">Multiplicador</span><div className="flex gap-2">{([1.5, 2, 3, 5] as const).map((value) => <button key={value} type="button" onClick={() => setValue('boost.multiplier', value, { shouldDirty: true })} className={`rounded-full border px-3 py-1 text-[12px] font-semibold transition ${multiplier === value ? 'border-accent bg-accent text-bg-primary' : 'border-border-default bg-bg-elevated text-text-secondary hover:text-text-primary'}`}>{value}x</button>)}</div></div><div><span className="mb-2 block text-[12px] text-text-secondary">Aplica a</span><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setValue('boost.scope', 'all', { shouldDirty: true }); setValue('boost.category_code', undefined, { shouldDirty: true }); }} className={`rounded-lg border px-3 py-2 text-[12px] ${scope === 'all' ? 'border-accent bg-accent-subtle text-accent' : 'border-border-subtle bg-bg-elevated text-text-secondary'}`}>Todas las categorías</button><button type="button" onClick={() => { setValue('boost.scope', 'category', { shouldDirty: true }); setValue('boost.category_code', boost?.category_code ?? ruleCategory, { shouldDirty: true }); }} className={`rounded-lg border px-3 py-2 text-[12px] ${scope === 'category' ? 'border-accent bg-accent-subtle text-accent' : 'border-border-subtle bg-bg-elevated text-text-secondary'}`}>Una específica</button></div>{scope === 'category' && <label className="mt-3 block"><span className="mb-1.5 block text-[12px] text-text-secondary">categoría del boost</span><select aria-label="categoría del boost" className="field" {...register('boost.category_code')}><option value="">Elegí una categoría</option>{enabledCategories.map((category) => <option key={category} value={category}>{CATEGORIES.find((item) => item.value === category)?.label ?? category}</option>)}</select></label>}{errors.boost?.category_code?.message && <p className="mt-2 text-[11px] text-danger">{errors.boost.category_code.message}</p>}</div><div className="grid gap-3 md:grid-cols-2"><label><span className="mb-1.5 block text-[12px] text-text-secondary">Desde</span><input aria-label="Desde" type="datetime-local" className="field" {...register('boost.starts_at')} /></label><label><span className="mb-1.5 block text-[12px] text-text-secondary">Hasta</span><input aria-label="Hasta" type="datetime-local" className="field" {...register('boost.ends_at')} /></label></div><p className="text-[12px] font-light italic text-text-tertiary">durante este período, esta regla otorga {multiplier}x el XP base. Fuera del período vuelve al valor normal.</p></div>}</div></Block>;
}
function PreviewPanel() {
  const { watch } = useFormContext<Values>();
  const values = watch();
  return <><div className="card p-5"><h3 className="section-title mb-3">vista previa</h3><p className="text-[13px] leading-6 text-text-secondary"><b className="text-accent">Cuando</b> ocurre <b>{values.trigger.event}</b> en <b>{values.trigger.category}</b>, otorgar <b className="text-accent">+{values.action.xpBase} XP</b>{values.boost?.enabled && <span> · boost <b className="text-purple">x{values.boost.multiplier}</b> {values.boost.scope === 'all' ? 'en todas las categorías' : `en ${values.boost.category_code ?? values.trigger.category}`}</span>}.</p></div><div className="card p-5"><h3 className="section-title mb-3">últimos 7 días</h3><div className="grid grid-cols-2 gap-3 text-[12px]"><div><span className="text-text-tertiary">veces aplicada</span><div className="text-[20px] font-semibold">14.238</div></div><div><span className="text-text-tertiary">XP otorgada</span><div className="text-[20px] font-semibold text-accent">847k</div></div></div></div></>;
}
