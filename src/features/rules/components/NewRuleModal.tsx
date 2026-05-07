import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useSaveRule } from '@/features/rulesApi';
import { useEnabledCategories } from '@/features/settingsApi';
import type { GameCategory } from '@/types/expandedTier5';
import { buildRulePayload, type RuleXpFormValues } from '@/features/rules/ruleXpForm';
import { RuleBoostSection, RuleCategoryField, RuleUsdPerXpField } from './RuleXpFormSections';

const fallbackCategories: GameCategory[] = ['deportes', 'casino', 'casino_vivo', 'virtuales', 'poker'];

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NewRuleModal({ open, onClose }: Props) {
  const save = useSaveRule();
  const enabledCategories = useEnabledCategories();
  const cats = enabledCategories.length ? enabledCategories : fallbackCategories;

  const form = useForm<RuleXpFormValues>({
    defaultValues: {
      category: 'deportes',
      usd_per_xp: 10,
      boost: undefined,
    },
  });

  useEffect(() => {
    if (open) form.reset({ category: 'deportes', usd_per_xp: 10, boost: undefined });
  }, [open, form]);

  const submit = async () => {
    const values = form.getValues();
    const boost = values.boost;
    if (boost?.enabled && boost.scope === 'category' && !boost.category_code) {
      form.setError('boost.category_code', { message: 'Debés elegir una categoría' });
      return;
    }
    const payload = buildRulePayload(values, { status: 'active', existingRule: null });
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
          <RuleCategoryField enabledCategories={cats} />
          <div className="border-t border-border-subtle pt-4">
            <RuleUsdPerXpField />
          </div>
          <div className="border-t border-border-subtle pt-4">
            <h3 className="mb-3 text-[13px] font-semibold text-text-primary">Boost temporal</h3>
            <RuleBoostSection enabledCategories={cats} />
          </div>
        </div>
      </FormProvider>
    </Modal>
  );
}
