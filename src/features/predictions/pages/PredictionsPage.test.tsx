import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  it('lista prodes y abre modal nuevo', async () => {
    wrap();
    expect(await screen.findByText('Champions Semana 3')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Nuevo prode'));
    expect(screen.getByText('Nuevo prode', { selector: 'h2' })).toBeInTheDocument();
  });

  it('agregar partido en modal', async () => {
    wrap();
    await screen.findByText('Champions Semana 3');
    fireEvent.click(screen.getByText('Nuevo prode'));
    fireEvent.click(screen.getByText('Agregar partido al prode'));
    expect(screen.getAllByText(/Partido \d/).length).toBeGreaterThanOrEqual(2);
  });

  it('prode abierto muestra todas las opciones en solo lectura', async () => {
    wrap();
    await screen.findByText('Champions Semana 3');
    fireEvent.click(screen.getByRole('button', { name: /Champions Semana 3/i }));
    await screen.findByText('Editar prode', { selector: 'h2' });
    await screen.findByDisplayValue('Real Madrid vs Barcelona');
    expect(screen.getAllByDisplayValue('Real Madrid').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByDisplayValue('Barcelona').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole('button', { name: 'Agregar opción' })).not.toBeInTheDocument();
  });

  it('prode en borrador permite agregar opciones', async () => {
    wrap();
    await screen.findByText('Clausura 2026 (borrador)');
    fireEvent.click(screen.getByRole('button', { name: /Clausura 2026/i }));
    await screen.findByText('Editar prode', { selector: 'h2' });
    await waitFor(() =>
      expect(screen.getAllByPlaceholderText('Texto de la opción (requerido)').length).toBeGreaterThan(0),
    );
    const before = screen.getAllByPlaceholderText('Texto de la opción (requerido)').length;
    fireEvent.click(screen.getAllByRole('button', { name: 'Agregar opción' })[0]!);
    await waitFor(() =>
      expect(screen.getAllByPlaceholderText('Texto de la opción (requerido)')).toHaveLength(before + 1),
    );
  });

  it('abrir prode en draft', async () => {
    wrap();
    await screen.findByText('Clausura 2026 (borrador)');
    fireEvent.click(screen.getByText('Abrir'));
    await waitFor(() => expect(screen.queryByText('Abrir')).not.toBeInTheDocument());
  });

  it('resolver prode cerrado', async () => {
    wrap();
    await screen.findByText('Liga Argentina Jornada 5');
    fireEvent.click(screen.getAllByText('Resolver')[0]);
    expect(await screen.findByText(/Resolver prode — Liga Argentina/)).toBeInTheDocument();
    expect(screen.getByText('Partido 1 · Resultado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Boca' }));
    fireEvent.click(screen.getByRole('button', { name: '2-3' }));
    fireEvent.click(screen.getByRole('button', { name: 'Independiente' }));
    fireEvent.click(screen.getByRole('button', { name: '+8.5' }));
    fireEvent.click(screen.getByRole('button', { name: 'Más de 1 gol' }));
    await waitFor(() => expect(screen.getByText(/Preview de resultados/)).toBeInTheDocument());
  });

  it('ver participantes', async () => {
    wrap();
    await screen.findByText('Champions Semana 3');
    fireEvent.click(screen.getAllByText('Participantes')[0]);
    expect(screen.getByText(/Participantes —/)).toBeInTheDocument();
  });

  it('ver ranking', async () => {
    wrap();
    await screen.findByText('Mundial Sub-20 Jornada 1');
    fireEvent.click(screen.getAllByText('Ranking')[0]);
    expect(screen.getByText(/Ranking —/)).toBeInTheDocument();
  });

  it('tab estadísticas', async () => {
    wrap();
    await screen.findByText('Champions Semana 3');
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
    expect(await screen.findByText('Sin prodes')).toBeInTheDocument();
  });

  it('menú ⋮ incluye Archivar para prode en borrador', async () => {
    wrap();
    await screen.findByText('Clausura 2026 (borrador)');
    fireEvent.click(screen.getAllByTitle('Acciones')[0]!);
    expect(screen.getByRole('button', { name: /Archivar/i })).toBeInTheDocument();
    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
  });
});
