import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { defaultMissionForm, type MissionFormValues } from '@/features/missions/missionForm';

import { MissionActionCurrencySelect } from './MissionActionCurrencySelect';

function wrap(initial?: Partial<MissionFormValues>) {
  cleanup();
  const values = { ...defaultMissionForm(), ...initial };

  function Harness() {
    const form = useForm<MissionFormValues>({ defaultValues: values });
    return (
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <FormProvider {...form}>
          <MissionActionCurrencySelect index={0} />
        </FormProvider>
      </QueryClientProvider>
    );
  }

  return render(<Harness />);
}

describe('MissionActionCurrencySelect', () => {
  it('lists active currencies from /admin/currencies/active', async () => {
    wrap();
    expect(await screen.findByRole('combobox')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/CLP —/)).toBeInTheDocument();
    });
  });

  it('keeps existing currency_code on edit', async () => {
    wrap({
      actions: [{ type: 'bet_amount', amount: 500, currency_code: 'CLP', aggregation_mode: 'cumulative' }],
    });
    const select = await screen.findByRole('combobox');
    await waitFor(() => {
      expect((select as HTMLSelectElement).value).toBe('CLP');
    });
  });
});
