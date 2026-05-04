import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import DashboardPage from './DashboardPage';

function renderPage(route = '/dashboard') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <DashboardPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  it('muestra KPIs, acciones rápidas y permite cambiar período', async () => {
    renderPage();

    expect(await screen.findByText('jugadores activos')).toBeInTheDocument();
    expect(screen.getByText('Crear regla de XP')).toBeInTheDocument();

    fireEvent.click(screen.getByText('30 días'));
    expect(await screen.findByText('18.321')).toBeInTheDocument();

    fireEvent.click(screen.getByText('detalles →'));
    fireEvent.click(screen.getByText('Crear regla de XP'));
  });

  it('renderiza estado loading forzado', () => {
    renderPage('/dashboard?mockState=loading');
    expect(screen.getByText('Cargando métricas...')).toBeInTheDocument();
  });

  it('renderiza estado error forzado', () => {
    renderPage('/dashboard?mockState=error');
    expect(screen.getAllByText('Algo salió mal').length).toBeGreaterThan(0);
  });

  it('renderiza estado empty forzado', () => {
    renderPage('/dashboard?mockState=empty');
    expect(screen.getByText('Todavía no hay métricas')).toBeInTheDocument();
    expect(screen.getByText('Sin actividad reciente')).toBeInTheDocument();
    expect(screen.getByText('Sin status disponible')).toBeInTheDocument();
  });
});
