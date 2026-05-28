import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  categorySlugForId,
  FALLBACK_GAME_CATEGORIES,
  useGameCategories,
} from '@/features/gameCategories/gameCategoriesApi';
import { useSaveRule } from '@/features/rulesApi';
import { buildRulePayload, type RuleXpFormValues } from '@/features/rules/ruleXpForm';
import { RuleBoostSection, RuleCategoryField, RuleUsdPerXpField } from './RuleXpFormSections';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NewRuleModal({ open, onClose }: Props) {
  const save = useSaveRule();
  const categoriesQ = useGameCategories();

  const form = useForm<RuleXpFormValues>({
    defaultValues: {
      category_id: 1,
      usd_per_xp: 10,
      boost: undefined,
    },
  });

  useEffect(() => {
    if (open) form.reset({ category_id: 1, usd_per_xp: 10, boost: undefined });
  }, [open, form]);

  const submit = async () => {
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
    const payload = buildRulePayload(refreshed, { status: 'active', existingRule: null }, categorySlug);
    await save.mutateAsync({ id: null, values: payload });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Nueva regla XP"
      description="Evento siempre bet_placed. Elegí categoría, USD por XP y un boost opcional."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" loading={save.isPending} onClick={() => void submit()}>
            Guardar regla
          </Button>
        </>
      }
    >
      <FormProvider {...form}>
        <div className="space-y-6">
          <RuleCategoryField />
          <div className="border-t border-border-subtle pt-4">
            <RuleUsdPerXpField />
          </div>
          <div className="border-t border-border-subtle pt-4">
            <h3 className="mb-3 text-[15px] font-semibold text-text-primary">Boost temporal</h3>
            <RuleBoostSection />
          </div>
        </div>
      </FormProvider>
    </Modal>
  );
}
