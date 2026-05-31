import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import PredictionsPage from './PredictionsPage';
import PredictionsStatsPage from './PredictionsStatsPage';
import PredictionResultsPage from './PredictionResultsPage';

function wrap(route = '/predicciones') {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['predictions', 'missions', 'shop'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <Routes>
          <Route path="/predicciones" element={<PredictionsPage />} />
          <Route path="/predicciones/estadisticas" element={<PredictionsStatsPage />} />
          <Route path="/predicciones/resultados" element={<PredictionResultsPage />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('PredictionsPage', () => {
  it('lista programas y abre modal nuevo', async () => {
    wrap();
    expect(await screen.findByText('Champions Semana 3')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Nuevo programa'));
    expect(screen.getByText('Nuevo prode', { selector: 'h2' })).toBeInTheDocument();
  });

  it('agregar partido en modal', async () => {
    wrap();
    await screen.findByText('Champions Semana 3');
    fireEvent.click(screen.getByText('Nuevo programa'));
    fireEvent.click(screen.getByText('Agregar partido al prode'));
    expect(screen.getAllByText(/Partido \d/).length).toBeGreaterThanOrEqual(2);
  });

  it('programa abierto muestra eventos en detalle', async () => {
    wrap();
    await screen.findByText('Champions Semana 3');
    fireEvent.click(screen.getByRole('button', { name: /Ver detalle Champions Semana 3/i }));
    expect(await screen.findByText('Real Madrid vs Barcelona')).toBeInTheDocument();
  });

  it('programa en borrador permite agregar opciones', async () => {
    wrap();
    await screen.findByText('Clausura 2026 (borrador)');
    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));
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

  it('publicar programa en draft', async () => {
    wrap();
    await screen.findByText('Clausura 2026 (borrador)');
    window.confirm = () => true;
    fireEvent.click(screen.getByText('Publicar'));
    await waitFor(() => expect(screen.queryByText('Publicar')).not.toBeInTheDocument());
  });

  it('resolver evento pendiente en resultados', async () => {
    wrap('/predicciones/resultados');
    expect(await screen.findByText('Boca vs Racing', {}, { timeout: 5000 })).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Resolver')[0]!);
    expect(await screen.findByText('Marcar resultado')).toBeInTheDocument();
  });

  it('ver ranking desde detalle', async () => {
    wrap();
    await screen.findByText('Mundial Sub-20 Jornada 1');
    fireEvent.click(screen.getByRole('button', { name: /Ver detalle Mundial Sub-20/i }));
    fireEvent.click(await screen.findByText('Ver ranking'));
    expect(screen.getByText(/Ranking —/)).toBeInTheDocument();
  });

  it('tab estadísticas', async () => {
    wrap();
    await screen.findByText('Champions Semana 3');
    fireEvent.click(screen.getByRole('link', { name: 'Estadísticas' }));
    expect(await screen.findByText('Prodes creados')).toBeInTheDocument();
  });

  it('tab resultados visible', async () => {
    wrap();
    await screen.findByText('Champions Semana 3');
    expect(screen.getByRole('link', { name: 'Resultados' })).toBeInTheDocument();
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
    expect(await screen.findByText('Sin programas')).toBeInTheDocument();
  });

  it('programa activo muestra archivar', async () => {
    wrap();
    await screen.findByText('Champions Semana 3');
    expect(screen.getByText('Archivar')).toBeInTheDocument();
  });
});
