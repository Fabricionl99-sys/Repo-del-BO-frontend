import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import ApiKeysPage from './ApiKeysPage';

function renderPage(route = '/api-keys') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ApiKeysPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('ApiKeysPage', () => {
  it('renderiza credenciales, tabs y acciones principales', async () => {
    renderPage();

    expect(await screen.findByText(/credenciales de producción/i)).toBeInTheDocument();
    expect(screen.getByText(/consumo y límites/i)).toBeInTheDocument();

    fireEvent.click(screen.getAllByTitle('ver completo')[0]);
    expect(await screen.findByText(/nv_prod_live/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('rotar credenciales'));
    expect(screen.getByText('¿Rotar credenciales?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancelar'));

    fireEvent.click(screen.getByText('sandbox'));
    expect(await screen.findByText(/credenciales de sandbox/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText('webhooks'));
    expect(screen.getByText('Webhooks')).toBeInTheDocument();
    fireEvent.click(screen.getByText('logs de requests'));
    expect((await screen.findAllByText('/v1/events')).length).toBeGreaterThan(0);
  });

  it('renderiza estados forzados', async () => {
    renderPage('/api-keys?mockState=empty');
    expect(await screen.findByText('Sin credenciales')).toBeInTheDocument();
    expect(screen.getByText('No hay IPs permitidas')).toBeInTheDocument();
    expect(screen.getByText('Sin requests recientes')).toBeInTheDocument();
  });
});
