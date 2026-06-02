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
});

describe('PlayersPage refresh hint', () => {
  it('muestra nota de top 20', async () => {
    wrap();
    expect(await screen.findByText('Mostrando los 20 más recientes')).toBeInTheDocument();
  });
});
