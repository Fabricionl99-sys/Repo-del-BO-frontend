import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { useRule, useSaveRule } from '@/features/rulesApi';
import { useEnabledCategories } from '@/features/settingsApi';
import type { GameCategory } from '@/types/expandedTier5';
import type { XPRule } from '@/types/rules';
import { Block, StickyBottomBar } from '../components/RuleBlocks';
import { RuleBoostSection, RuleCategoryField, RuleUsdPerXpField } from '../components/RuleXpFormSections';
import { buildRulePayload, fromRuleToFormValues, type RuleXpFormValues } from '../ruleXpForm';

const fallbackCategories: GameCategory[] = ['deportes', 'casino', 'casino_vivo', 'virtuales', 'poker'];

export default function RuleEditorPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const q = useRule(id!);
  const enabledCategories = useEnabledCategories();
  const save = useSaveRule();
  const form = useForm<RuleXpFormValues>({
    values: q.data ? fromRuleToFormValues(q.data) : undefined,
    defaultValues: {
      category: 'deportes',
      usd_per_xp: 10,
      boost: undefined,
    },
  });

  if (q.isLoading) return <Loading label="Cargando regla..." />;
  if (q.isError || !q.data) return <ErrorState onRetry={() => q.refetch()} />;

  const cats = enabledCategories.length ? enabledCategories : fallbackCategories;

  const submit = async (status: 'draft' | 'active') => {
    const values = form.getValues();
    const boost = values.boost;
    if (boost?.enabled && boost.scope === 'category' && !boost.category_code) {
      form.setError('boost.category_code', { message: 'Debés elegir una categoría' });
      return;
    }
    const existing: Pick<XPRule, 'name' | 'description'> = { name: q.data.name, description: q.data.description };
    const payload = buildRulePayload(values, { status, existingRule: existing });
    await save.mutateAsync({ id: q.data.id, values: payload });
    nav('/reglas-xp');
  };

  return (
    <FormProvider {...form}>
      <PageHeader
        title={q.data.name}
        subtitle="Categoría, USD por XP y boost opcional. El evento siempre es bet_placed."
        actions={
          <>
            <Button size="sm" variant="ghost">
              Duplicar
            </Button>
            <Button size="sm">Archivar</Button>
          </>
        }
      />
      <div className="mx-auto max-w-2xl space-y-6">
        <Block num={1} kind="trigger" kindLabel="regla" title="Categoría" active>
          <RuleCategoryField enabledCategories={cats} />
        </Block>
        <Block num={2} kind="action" kindLabel="economía" title="Cuánto se apuesta para 1 XP" active>
          <RuleUsdPerXpField />
        </Block>
        <Block num={3} kind="multiplier" kindLabel="boost" title="Boost temporal" active>
          <RuleBoostSection enabledCategories={cats} />
        </Block>
      </div>
      <StickyBottomBar
        onCancel={() => nav('/reglas-xp')}
        onSaveDraft={() => submit('draft')}
        onActivate={() => submit('active')}
        loading={save.isPending}
      />
    </FormProvider>
  );
}
