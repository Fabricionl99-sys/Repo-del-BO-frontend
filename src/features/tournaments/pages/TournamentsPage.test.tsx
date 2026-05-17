import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import TournamentsPage from './TournamentsPage';

function wrap(route = '/torneos') {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['tournaments', 'missions', 'shop'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <TournamentsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('TournamentsPage', () => {
  it('muestra catálogo de torneos', async () => {
    wrap();
    expect(await screen.findByText(/Wagering Madness/)).toBeInTheDocument();
    expect(screen.getByText(/XP Sports Master/)).toBeInTheDocument();
  });

  it('abre modal nuevo torneo', async () => {
    wrap();
    await screen.findByText(/Wagering Madness/);
    fireEvent.click(screen.getByText('Nuevo torneo'));
    expect(screen.getByText('Nuevo torneo', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByText('Tipo de actividad')).toBeInTheDocument();
  });

  it('filtra por status activo', async () => {
    wrap();
    await screen.findByText(/Wagering Madness/);
    fireEvent.click(screen.getByRole('button', { name: 'Activo' }));
    await waitFor(() => {
      expect(screen.getByText(/Wagering Madness/)).toBeInTheDocument();
    });
  });

  it('leaderboard en vivo', async () => {
    wrap();
    await screen.findByText(/Wagering Madness/);
    fireEvent.click(screen.getByRole('button', { name: 'Leaderboard en vivo' }));
    expect(await screen.findByText(/@crypto_king_88/)).toBeInTheDocument();
  });

  it('inscripciones cross-torneos', async () => {
    wrap();
    await screen.findByText(/Wagering Madness/);
    fireEvent.click(screen.getByRole('button', { name: 'Inscripciones' }));
    const table = await screen.findByRole('table');
    expect(within(table).getAllByText(/@crypto_king_88/).length).toBeGreaterThan(0);
  });

  it('módulo inactivo muestra CTA', () => {
    cleanup();
    useOperatorStore.setState({ activeModuleCodes: ['shop'], billingMode: 'wallet' });
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <TournamentsPage />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Módulo Torneos no activo')).toBeInTheDocument();
  });

  it('empty state forzado', async () => {
    wrap('/torneos?mockState=empty');
    expect(await screen.findByText('Sin torneos')).toBeInTheDocument();
  });
});
