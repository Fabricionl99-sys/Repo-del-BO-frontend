import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';

import { PoolMatchOptionsEditor } from '@/features/predictions/components/PoolMatchOptionsEditor';
import { defaultPoolForm, poolFormSchema, type PoolFormValues } from '@/features/predictions/poolForm';

function Harness({ readOnly = false }: { readOnly?: boolean }) {
  const form = useForm<PoolFormValues>({
    resolver: zodResolver(poolFormSchema),
    defaultValues: defaultPoolForm(),
  });
  const { control, register, formState } = form;
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <FormProvider {...form}>
        <PoolMatchOptionsEditor
          control={control}
          register={register}
          matchIndex={0}
          readOnly={readOnly}
          errors={formState.errors}
        />
      </FormProvider>
    </QueryClientProvider>
  );
}

describe('PoolMatchOptionsEditor', () => {
  it('muestra Agregar opción y suma filas al hacer click', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByText('Opciones de predicción')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Texto de la opción (requerido)')).toHaveLength(2);
    await user.click(screen.getByRole('button', { name: 'Agregar opción' }));
    expect(screen.getAllByPlaceholderText('Texto de la opción (requerido)')).toHaveLength(3);
  });

  it('no muestra Agregar opción en solo lectura', () => {
    render(<Harness readOnly />);
    expect(screen.queryByRole('button', { name: 'Agregar opción' })).not.toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('Texto de la opción (requerido)')).toHaveLength(2);
  });
});
