import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import PredictionsPage from './PredictionsPage';

function wrap(route = '/predicciones') {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['predictions', 'missions', 'shop'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <PredictionsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('PredictionsPage', () => {
  it('lista eventos y abre modal nuevo', async () => {
    wrap();
    expect(await screen.findByText('River vs Boca - Resultado final')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Nuevo evento'));
    expect(screen.getByText('Nuevo evento', { selector: 'h2' })).toBeInTheDocument();
  });

  it('agregar opción en modal', async () => {
    wrap();
    await screen.findByText('River vs Boca - Resultado final');
    fireEvent.click(screen.getByText('Nuevo evento'));
    fireEvent.click(screen.getByText('Agregar opción'));
    expect(screen.getAllByText(/Opción \d/).length).toBeGreaterThanOrEqual(3);
  });

  it('abrir predicciones en draft', async () => {
    wrap();
    await screen.findByText('Evento especial - Draft');
    fireEvent.click(screen.getByText('Abrir'));
    await waitFor(() => expect(screen.queryByText('Abrir')).not.toBeInTheDocument());
  });

  it('resolver evento cerrado', async () => {
    wrap();
    await screen.findByText('River vs Boca - Corners totales');
    const row = screen.getByText('River vs Boca - Corners totales').closest('tr');
    fireEvent.click(within(row!).getByText('Resolver'));
    expect(await screen.findByText('Resolver evento', { selector: 'h2' })).toBeInTheDocument();
    fireEvent.click(screen.getByText('Menos de 8.5'));
    expect(screen.getByText(/acertaron/)).toBeInTheDocument();
  });

  it('ver participantes', async () => {
    wrap();
    await screen.findByText('River vs Boca - Resultado final');
    fireEvent.click(screen.getAllByText('Participantes')[0]);
    expect(screen.getByText('Participantes', { selector: 'h2' })).toBeInTheDocument();
  });

  it('cancelar evento cerrado', async () => {
    wrap();
    await screen.findByText('River vs Boca - Corners totales');
    const row = screen.getByText('River vs Boca - Corners totales').closest('tr');
    expect(row).toBeTruthy();
    fireEvent.click(within(row!).getByText('Cancelar'));
    await waitFor(() => {
      expect(within(row!).getByText('Cancelado')).toBeInTheDocument();
    });
  });

  it('tab estadísticas', async () => {
    wrap();
    await screen.findByText('River vs Boca - Resultado final');
    fireEvent.click(screen.getByRole('button', { name: 'Estadísticas' }));
    expect(await screen.findByText('Top categorías')).toBeInTheDocument();
  });

  it('módulo inactivo muestra CTA', () => {
    cleanup();
    useOperatorStore.setState({ activeModuleCodes: ['shop'], billingMode: 'wallet' });
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <PredictionsPage />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Módulo Predicciones no activo')).toBeInTheDocument();
  });

  it('empty state forzado', async () => {
    wrap('/predicciones?mockState=empty');
    expect(await screen.findByText('Sin eventos')).toBeInTheDocument();
  });
});
