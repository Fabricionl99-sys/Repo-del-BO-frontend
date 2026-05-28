import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import CoinsPage from './CoinsPage';

function wrap(route = '/monedas') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <CoinsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Monedas', () => {
  it('muestra tabla de monedas y abre editor', async () => {
    wrap();
    expect(await screen.findByText('Monedas oro')).toBeInTheDocument();
    expect(screen.getByText('Ícono')).toBeInTheDocument();
    fireEvent.click(screen.getByText('nueva moneda'));
    expect(screen.getByText('Nueva moneda')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Ruby, Esmeralda…'), { target: { value: 'Estrellas VIP' } });
    fireEvent.click(screen.getByText('Crear moneda'));
    expect(await screen.findByText('Estrellas VIP', {}, { timeout: 5000 })).toBeInTheDocument();
  });

  it('empty forzado', () => {
    wrap('/monedas?mockState=empty');
    expect(screen.getByText('No hay monedas configuradas')).toBeInTheDocument();
  });
});
