import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import type { RewardModuleKey, RewardOperatorContext, RewardTypeCode, RewardValue } from '@/types/rewards';
import type { RewardFormFields } from '@/features/rewards/rewardForm';

import { RewardSelector } from './RewardSelector';

export function RewardSelectorRhf<T extends FieldValues>({
  moduleKey,
  control,
  name,
  availableRewardTypes,
  operatorContext,
  disabled,
  fieldErrors,
  currencyModeAutoUsdOnly,
}: {
  moduleKey: RewardModuleKey;
  control: Control<T>;
  name: Path<T>;
  availableRewardTypes?: RewardTypeCode[];
  operatorContext?: RewardOperatorContext;
  disabled?: boolean;
  fieldErrors?: Partial<Record<keyof RewardFormFields, { message?: string }>>;
  currencyModeAutoUsdOnly?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <RewardSelector
          moduleKey={moduleKey}
          value={(field.value as RewardValue) ?? { reward_type: 'coins', reward_config: { amount: 0, currency_code: 'main' } }}
          onChange={field.onChange}
          availableRewardTypes={availableRewardTypes}
          operatorContext={operatorContext}
          disabled={disabled}
          fieldErrors={fieldErrors}
          currencyModeAutoUsdOnly={currencyModeAutoUsdOnly}
        />
      )}
    />
  );
}
