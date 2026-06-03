import { Controller, useFormContext } from 'react-hook-form';

import { useActiveCurrencies } from '@/features/currencies/useCurrencies';
import type { MissionFormValues } from '@/features/missions/missionForm';

export function MissionActionCurrencySelect({ index }: { index: number }) {
  const { control } = useFormContext<MissionFormValues>();
  const currenciesQ = useActiveCurrencies();
  const currencies = currenciesQ.data ?? [];
  const fallbackCode = currencies.find((c) => c.code === 'USD')?.code ?? currencies[0]?.code ?? 'USD';

  return (
    <div>
      <label className="mb-1 block text-[13px] text-text-secondary">Moneda</label>
      <Controller
        control={control}
        name={`actions.${index}.currency_code`}
        render={({ field }) => (
          <select className="field" {...field} value={field.value || fallbackCode}>
            {currencies.map((currency) => (
              <option key={currency.id || currency.code} value={currency.code}>
                {currency.code} — {currency.name}
              </option>
            ))}
          </select>
        )}
      />
      {!currenciesQ.isLoading && currencies.length <= 1 ? (
        <p className="mt-1 text-[12px] text-text-tertiary">
          Solo {currencies[0]?.code ?? 'USD'} activa. Activá más en Monedas.
        </p>
      ) : null}
    </div>
  );
}
