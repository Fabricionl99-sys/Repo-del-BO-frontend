import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import ChestsPage from './ChestsPage';

function wrap(route = '/cofres') {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['chests', 'coins', 'xp_engine'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ChestsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ChestsPage', () => {
  it('muestra catálogo, filtra y abre modal nuevo tipo', async () => {
    wrap();
    expect(await screen.findByText('Cofre Oro')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Nuevo tipo de cofre'));
    expect(screen.getByText('Nuevo tipo de cofre', { selector: 'h2' })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre o code...'), {
      target: { value: 'Bronce' },
    });
    await waitFor(() => {
      expect(screen.getByText('Cofre Bronce')).toBeInTheDocument();
    });
  });

  it('abre modal editar con premios del tipo', async () => {
    wrap();
    await screen.findByText('Cofre Plata');
    fireEvent.click(screen.getAllByText('editar')[1]);
    expect(await screen.findByText('Editar tipo de cofre', { selector: 'h2' })).toBeInTheDocument();
    expect(await screen.findByText('200 monedas')).toBeInTheDocument();
    expect(screen.getByText('100.00%')).toBeInTheDocument();
  });

  it('tab inventario con detalle', async () => {
    wrap();
    await screen.findByText('Cofre Oro');
    fireEvent.click(screen.getByRole('button', { name: 'Inventario' }));
    await screen.findAllByText('crypto_king_88');
    fireEvent.click((await screen.findAllByText('detalle'))[0]);
    expect(
      await screen.findByRole('heading', { name: 'Detalle de cofre entregado' }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('filtra inventario por jugador', async () => {
    wrap();
    await screen.findByText('Cofre Oro');
    fireEvent.click(screen.getByRole('button', { name: 'Inventario' }));
    await screen.findAllByText('MariaG_bet');
    fireEvent.change(screen.getByPlaceholderText('handle o id...'), {
      target: { value: 'crypto_king' },
    });
    await waitFor(
      () => {
        expect(screen.queryByText('MariaG_bet')).not.toBeInTheDocument();
        expect(screen.getAllByText('crypto_king_88').length).toBeGreaterThan(0);
      },
      { timeout: 5000 },
    );
  });

  it('entrega manual', async () => {
    wrap();
    await screen.findByText('Cofre Oro');
    fireEvent.click(screen.getByRole('button', { name: 'Entregar manual' }));
    fireEvent.change(screen.getByPlaceholderText('handle o id (mín. 2 chars)...'), {
      target: { value: 'crypto' },
    });
    await screen.findByText('crypto_king_88');
    fireEvent.click(screen.getByText('crypto_king_88'));
    const chestSelect = screen.getByText('Tipo de cofre').parentElement?.querySelector('select');
    expect(chestSelect).toBeTruthy();
    fireEvent.change(chestSelect!, { target: { value: 'bronce' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entregar a 1 jugador' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Inventario' })).toBeInTheDocument();
    });
    expect((await screen.findAllByText('manual')).length).toBeGreaterThan(0);
  });

  it('empty state sin tipos', async () => {
    wrap('/cofres?mockState=empty');
    expect(await screen.findByText('Sin tipos de cofre')).toBeInTheDocument();
  });

  it('módulo inactivo muestra CTA a módulos', () => {
    cleanup();
    useOperatorStore.setState({ activeModuleCodes: ['coins'], billingMode: 'wallet' });
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <ChestsPage />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Módulo Cofres no activo')).toBeInTheDocument();
    expect(screen.getByText('Activar módulo Cofres')).toBeInTheDocument();
  });
});
