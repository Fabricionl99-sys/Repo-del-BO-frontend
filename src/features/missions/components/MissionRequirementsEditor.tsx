import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/Button';
import { FieldHint } from '@/components/ui/FieldHint';
import {
  FALLBACK_GAME_CATEGORIES,
  useGameCategories,
} from '@/features/gameCategories/gameCategoriesApi';
import {
  actionIsBinaryFlag,
  actionNeedsCategory,
  actionNeedsCountField,
  actionNeedsNumericField,
  actionTypeLabel,
  actionValueLabel,
  MISSION_ACTION_TYPES,
  newMissionAction,
  type MissionActionType,
} from '@/features/missions/missionActions';
import type { MissionFormValues } from '@/features/missions/missionForm';

import { MissionActionCurrencySelect } from './MissionActionCurrencySelect';

export function MissionRequirementsEditor() {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<MissionFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'actions' });
  const categoriesQ = useGameCategories();
  const categories = categoriesQ.data ?? FALLBACK_GAME_CATEGORIES;

  const usedTypes = new Set(watch('actions').map((a) => a.type));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <p className="text-[14px] font-medium text-text-primary">Combinación de requisitos (AND)</p>
        <FieldHint text="El jugador debe cumplir TODOS los requisitos del step para completar la misión." />
      </div>

      {fields.map((field, index) => {
        const type = watch(`actions.${index}.type`) as MissionActionType;
        const valueLabel = actionValueLabel(type);
        const actionErrors = errors.actions?.[index];

        return (
          <div key={field.id} className="rounded-lg border border-border-subtle bg-bg-secondary p-4">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-[200px] flex-1">
                <label className="mb-1 block text-[13px] text-text-secondary">
                  Requisito {index + 1} · tipo
                </label>
                <select
                  className="field"
                  {...register(`actions.${index}.type`)}
                  onChange={(e) => {
                    const next = e.target.value as MissionActionType;
                    setValue(`actions.${index}`, newMissionAction(next), { shouldDirty: true });
                  }}
                >
                  {MISSION_ACTION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {actionTypeLabel(t)}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="mt-6 text-danger"
                disabled={fields.length <= 1}
                onClick={() => remove(index)}
              >
                Quitar
              </Button>
            </div>

            <p className="mb-3 text-[12px] font-mono text-text-tertiary">type: {type}</p>

            {actionNeedsNumericField(type) && valueLabel && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[13px] text-text-secondary">{valueLabel}</label>
                  <input
                    className="field"
                    type="number"
                    min={0.01}
                    step={0.01}
                    {...register(`actions.${index}.amount`, { valueAsNumber: true })}
                  />
                  {actionErrors?.amount && (
                    <p className="mt-1 text-[13px] text-danger">{String(actionErrors.amount.message)}</p>
                  )}
                </div>
                {(type === 'bet_amount' || type === 'deposit_amount') && (
                  <MissionActionCurrencySelect index={index} />
                )}
                {type === 'bet_amount' && (
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-[13px] text-text-secondary">Modo de agregación</label>
                    <select className="field" {...register(`actions.${index}.aggregation_mode`)}>
                      <option value="cumulative">Acumulado (total del período)</option>
                      <option value="individual">Por apuesta individual</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {actionNeedsCountField(type) && valueLabel && (
              <div className="max-w-xs">
                <label className="mb-1 block text-[13px] text-text-secondary">{valueLabel}</label>
                <input
                  className="field"
                  type="number"
                  min={1}
                  {...register(`actions.${index}.count`, { valueAsNumber: true })}
                />
                {actionErrors?.count && (
                  <p className="mt-1 text-[13px] text-danger">{String(actionErrors.count.message)}</p>
                )}
              </div>
            )}

            {actionNeedsCategory(type) && (
              <div className="max-w-md">
                <label className="mb-1 block text-[13px] text-text-secondary">
                  {valueLabel}
                  <FieldHint text="Categorías reales del catálogo (casino incluye slots, mesa y vivo). No existe categoría 'slots' separada." />
                </label>
                <select className="field" {...register(`actions.${index}.category_slug`)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.display_name}
                    </option>
                  ))}
                </select>
                {actionErrors?.category_slug && (
                  <p className="mt-1 text-[13px] text-danger">{String(actionErrors.category_slug.message)}</p>
                )}
                <div className="mt-3">
                  <label className="mb-1 block text-[13px] text-text-secondary">
                    Monto en categoría (opcional)
                  </label>
                  <input
                    className="field"
                    type="number"
                    min={0}
                    step={0.01}
                    {...register(`actions.${index}.amount`, { valueAsNumber: true })}
                  />
                </div>
                <div className="mt-3">
                  <MissionActionCurrencySelect index={index} />
                </div>
              </div>
            )}

            {type === 'first_deposit' && (
              <div className="max-w-xs">
                <label className="mb-1 block text-[13px] text-text-secondary">{valueLabel}</label>
                <input
                  className="field"
                  type="number"
                  min={0}
                  step={0.01}
                  {...register(`actions.${index}.min_amount`, { valueAsNumber: true })}
                />
              </div>
            )}

            {actionIsBinaryFlag(type) && (
              <p className="text-[13px] text-text-tertiary">
                Requisito binario — el jugador debe completar {actionTypeLabel(type).toLowerCase()}.
              </p>
            )}
          </div>
        );
      })}

      {typeof errors.actions?.message === 'string' && (
        <p className="text-[13px] text-danger">{errors.actions.message}</p>
      )}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={fields.length >= 8}
        onClick={() => {
          const next = MISSION_ACTION_TYPES.find((t) => !usedTypes.has(t)) ?? 'verify_kyc';
          append(newMissionAction(next));
        }}
      >
        + Agregar requisito
      </Button>
    </div>
  );
}
