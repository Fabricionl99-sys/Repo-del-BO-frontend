import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import ShopPage from './ShopPage';

function wrap(route = '/tienda') {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['shop', 'coins', 'xp_engine'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ShopPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ShopPage', () => {
  it('muestra catálogo, filtra y abre modal nuevo producto', async () => {
    wrap();
    expect(await screen.findByText('25 Free Spins · Book of Dead')).toBeInTheDocument();
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Nuevo producto'));
    expect(screen.getByText('Nuevo producto', { selector: 'h2' })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre o code...'), {
      target: { value: 'Book of Dead' },
    });
    await waitFor(() => {
      expect(screen.getByText('25 Free Spins · Book of Dead')).toBeInTheDocument();
    });
  });

  it('muestra tab compras y detalle', async () => {
    wrap();
    await screen.findByText('25 Free Spins · Book of Dead');
    fireEvent.click(screen.getByRole('button', { name: 'Compras' }));
    expect((await screen.findAllByText('crypto_king_88')).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByText('detalle')[0]);
    expect(await screen.findByText('Detalle de compra')).toBeInTheDocument();
  });

  it('empty state sin productos', async () => {
    wrap('/tienda?mockState=empty');
    expect(await screen.findByText('Sin productos')).toBeInTheDocument();
  });

  it('módulo inactivo muestra CTA a módulos', () => {
    cleanup();
    useOperatorStore.setState({ activeModuleCodes: ['coins'], billingMode: 'wallet' });
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <ShopPage />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Módulo Tienda no activo')).toBeInTheDocument();
    expect(screen.getByText('Ir a Módulos')).toBeInTheDocument();
  });
});
