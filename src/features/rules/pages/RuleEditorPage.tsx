import { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Loading } from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import {
  categorySlugForId,
  FALLBACK_GAME_CATEGORIES,
  useGameCategories,
} from '@/features/gameCategories/gameCategoriesApi';
import {
  isPublishedLikeStatus,
  useDeleteRule,
  useRule,
  useSaveRule,
} from '@/features/rulesApi';
import type { RuleStatus, XPRule } from '@/types/rules';
import { Block, StickyBottomBar } from '../components/RuleBlocks';
import { RuleBoostSection, RuleCategoryField, RuleUsdPerXpField } from '../components/RuleXpFormSections';
import { buildRulePayload, fromRuleToFormValues, validateBoostFormValues, type RuleXpFormValues } from '../ruleXpForm';

const defaultFormValues: RuleXpFormValues = {
  category_id: 1,
  usd_per_xp: 10,
  boost: undefined,
};

export default function RuleEditorPage() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const copyFrom = searchParams.get('copyFrom');
  const isNew = routeId === 'nueva';
  const editId = isNew ? null : (routeId ?? null);
  const fetchId = isNew ? copyFrom : editId;

  const nav = useNavigate();
  const ruleQ = useRule(fetchId);
  const categoriesQ = useGameCategories();
  const save = useSaveRule();
  const del = useDeleteRule();

  const sourceRule = ruleQ.data;
  const editingPublished = !isNew && sourceRule && isPublishedLikeStatus(sourceRule.status);

  const initialFormValues = useMemo((): RuleXpFormValues => {
    if (sourceRule) return fromRuleToFormValues(sourceRule);
    return defaultFormValues;
  }, [sourceRule]);

  const form = useForm<RuleXpFormValues>({
    values: initialFormValues,
    defaultValues: defaultFormValues,
  });

  if (fetchId && ruleQ.isLoading) return <Loading label="Cargando regla..." />;
  if (fetchId && (ruleQ.isError || !sourceRule)) return <ErrorState onRetry={() => ruleQ.refetch()} />;

  const pageTitle = isNew
    ? copyFrom && sourceRule
      ? `${sourceRule.name} (copia)`
      : 'Nueva regla XP'
    : (sourceRule?.name ?? 'Regla XP');

  const resolveSaveStatus = (): RuleStatus => {
    if (isNew) return 'active';
    if (!sourceRule) return 'active';
    if (isPublishedLikeStatus(sourceRule.status)) return sourceRule.status;
    return sourceRule.status === 'draft' ? 'draft' : 'active';
  };

  const submit = async (targetStatus: 'draft' | 'active') => {
    const values = form.getValues();
    const categories = categoriesQ.data ?? FALLBACK_GAME_CATEGORIES;
    const categorySlug = categorySlugForId(categories, values.category_id);
    const boost = values.boost;
    if (boost?.enabled && boost !== null && !boost.category_code) {
      form.setValue('boost.category_code', categorySlug, { shouldDirty: true });
    }
    const refreshed = form.getValues();
    if (refreshed.boost?.enabled && refreshed.boost !== null && !refreshed.boost.category_code) {
      form.setError('boost.category_code', { message: 'Debés elegir una categoría' });
      return;
    }

    const boostError = validateBoostFormValues(refreshed.boost);
    if (boostError) {
      form.setError(`boost.${boostError.field}`, { message: boostError.message });
      return;
    }

    const existing: Pick<XPRule, 'name' | 'description'> | null = sourceRule
      ? { name: sourceRule.name, description: sourceRule.description }
      : null;

    const payload = buildRulePayload(refreshed, {
      status: isNew ? targetStatus : resolveSaveStatus() === 'draft' ? 'draft' : 'active',
      existingRule: existing,
      nameOverride: isNew && copyFrom && sourceRule ? `${sourceRule.name} (copia)` : undefined,
    }, categorySlug);

    await save.mutateAsync({ id: isNew ? null : sourceRule!.id, values: payload });
    nav('/reglas-xp');
  };

  return (
    <FormProvider {...form}>
      <PageHeader
        title={pageTitle}
        subtitle="Categoría, USD por XP y boost opcional. El evento siempre es bet_placed."
        actions={
          !isNew && sourceRule ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => nav(`/reglas-xp/nueva?copyFrom=${encodeURIComponent(sourceRule.id)}`)}
              >
                Copiar
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={del.isPending}
                onClick={() => {
                  if (window.confirm(`¿Archivar la regla "${sourceRule.name}"? Libera el slot único de la categoría.`)) {
                    del.mutate(sourceRule.id, { onSuccess: () => nav('/reglas-xp') });
                  }
                }}
              >
                Archivar
              </Button>
            </>
          ) : undefined
        }
      />

      {editingPublished && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-[14px] text-warning">
          Estás editando una regla publicada. Los cambios aplican a futuros eventos desde ya.
        </div>
      )}

      <div className="mx-auto max-w-2xl space-y-6">
        <Block num={1} kind="trigger" kindLabel="regla" title="Categoría" active>
          <RuleCategoryField />
        </Block>
        <Block num={2} kind="action" kindLabel="economía" title="Cuánto se apuesta para 1 XP" active>
          <RuleUsdPerXpField />
        </Block>
        <Block num={3} kind="multiplier" kindLabel="boost" title="Boost temporal" active>
          <RuleBoostSection />
        </Block>
      </div>

      <StickyBottomBar
        onCancel={() => nav('/reglas-xp')}
        onSaveDraft={isNew || sourceRule?.status === 'draft' ? () => void submit('draft') : undefined}
        onActivate={isNew || sourceRule?.status === 'draft' ? () => void submit('active') : undefined}
        onSaveChanges={!isNew && sourceRule && sourceRule.status !== 'draft' ? () => void submit('active') : undefined}
        saveChangesLabel={editingPublished ? 'Guardar cambios' : 'Guardar'}
        loading={save.isPending}
      />
    </FormProvider>
  );
}
