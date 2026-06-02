import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import PlayersPage from './PlayersPage';

function wrap() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <PlayersPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('PlayersPage', () => {
  it('lista jugadores y abre detalle con wallet', async () => {
    wrap();
    expect(await screen.findByText('demo_fabricio')).toBeInTheDocument();
    fireEvent.click(screen.getByText('demo_fabricio'));
    expect(await screen.findByText('Wallet')).toBeInTheDocument();
    expect(screen.getByText('12.500')).toBeInTheDocument();
  });

  it('muestra acciones manuales en detalle', async () => {
    wrap();
    fireEvent.click(await screen.findByText('crypto_king_88'));
    expect(await screen.findByRole('button', { name: 'Entregar avatares' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entregar cofres' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cambiar moneda' })).toBeInTheDocument();
  });

  it('abre modal de entrega de avatares', async () => {
    wrap();
    fireEvent.click(await screen.findByText('demo_fabricio'));
    fireEvent.click(await screen.findByRole('button', { name: 'Entregar avatares' }));
    expect(await screen.findByText('Entregar avatares', { selector: 'h2' })).toBeInTheDocument();
  });

  it('muestra botones de dar XP y monedas bajo wallet', async () => {
    wrap();
    fireEvent.click(await screen.findByText('demo_fabricio'));
    expect(await screen.findByRole('button', { name: 'Dar XP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Dar monedas' })).toBeInTheDocument();
  });

  it('abre modal dar XP', async () => {
    wrap();
    fireEvent.click(await screen.findByText('demo_fabricio'));
    fireEvent.click(await screen.findByRole('button', { name: 'Dar XP' }));
    expect(await screen.findByText('Dar XP', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByLabelText(/Cantidad/i)).toBeInTheDocument();
  });

  it('abre modal dar monedas', async () => {
    wrap();
    fireEvent.click(await screen.findByText('demo_fabricio'));
    fireEvent.click(await screen.findByRole('button', { name: 'Dar monedas' }));
    expect(await screen.findByText('Dar monedas', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

describe('PlayersPage refresh hint', () => {
  it('muestra nota de top 20', async () => {
    wrap();
    expect(await screen.findByText('Mostrando los 20 más recientes')).toBeInTheDocument();
  });
});

describe('PlayersPage search', () => {
  it('filtra jugadores por ID externo con debounce', async () => {
    wrap();
    expect(await screen.findByText('demo_fabricio')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Buscar por ID externo del jugador...'), {
      target: { value: 'vip' },
    });

    await waitFor(
      () => {
        expect(screen.getByText('vip_roller')).toBeInTheDocument();
        expect(screen.queryByText('demo_fabricio')).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
    expect(screen.getByText('Mostrando hasta 50 matches')).toBeInTheDocument();
  });

  it('muestra empty state cuando no hay matches', async () => {
    wrap();
    await screen.findByText('demo_fabricio');

    fireEvent.change(screen.getByPlaceholderText('Buscar por ID externo del jugador...'), {
      target: { value: 'zzzz_no_existe' },
    });

    expect(await screen.findByText('No encontramos jugadores con ese ID', {}, { timeout: 2000 })).toBeInTheDocument();
  });

  it('limpia búsqueda con botón ✕', async () => {
    wrap();
    await screen.findByText('demo_fabricio');

    fireEvent.change(screen.getByPlaceholderText('Buscar por ID externo del jugador...'), {
      target: { value: 'vip' },
    });
    await waitFor(() => expect(screen.queryByText('demo_fabricio')).not.toBeInTheDocument(), {
      timeout: 2000,
    });

    fireEvent.click(screen.getByLabelText('Limpiar búsqueda'));

    expect(await screen.findByText('demo_fabricio', {}, { timeout: 2000 })).toBeInTheDocument();
  });
});
