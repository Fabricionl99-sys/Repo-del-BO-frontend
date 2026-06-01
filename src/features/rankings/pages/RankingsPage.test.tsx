import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import RankingsPage from './RankingsPage';

function wrap(route = '/rankings') {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['rankings', 'coins', 'xp_engine'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <RankingsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('RankingsPage', () => {
  it('muestra catálogo, filtra y abre modal nuevo ranking', async () => {
    wrap();
    expect(await screen.findByText('Top XP Diario')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Nuevo ranking'));
    expect(screen.getByText('Nuevo ranking', { selector: 'h2' })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre o code...'), {
      target: { value: 'Semanales' },
    });
    await waitFor(() => {
      expect(screen.getByText('Apostadores Semanales')).toBeInTheDocument();
    });
  });

  it('abre modal editar con premios', async () => {
    wrap();
    await screen.findByText('Top XP Diario');
    fireEvent.click(screen.getAllByText('editar')[0]);
    expect(await screen.findByText('Editar ranking', { selector: 'h2' })).toBeInTheDocument();
    expect(await screen.findByText('Premios actuales (3)')).toBeInTheDocument();
    expect(await screen.findByText(/\[#2-3\]/)).toBeInTheDocument();
  });

  it('tab leaderboard y recalcular', async () => {
    wrap();
    await screen.findByText('Top XP Diario');
    fireEvent.click(screen.getByRole('button', { name: 'Leaderboards en vivo' }));
    await waitFor(() => {
      expect(screen.getAllByText('crypto_king_88').length).toBeGreaterThan(0);
    });
    fireEvent.click(screen.getByText('Recalcular ahora'));
    await waitFor(() => {
      expect(screen.getByText(/Última actualización/i)).toBeInTheDocument();
    });
  });

  it('empty state sin rankings', async () => {
    wrap('/rankings?mockState=empty');
    expect(await screen.findByText('Sin rankings')).toBeInTheDocument();
  });

  it('módulo inactivo muestra CTA a módulos', () => {
    cleanup();
    useOperatorStore.setState({ activeModuleCodes: ['coins'], billingMode: 'wallet' });
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <RankingsPage />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Módulo Rankings no activo')).toBeInTheDocument();
    expect(screen.getByText('Activar módulo Rankings')).toBeInTheDocument();
  });
});
