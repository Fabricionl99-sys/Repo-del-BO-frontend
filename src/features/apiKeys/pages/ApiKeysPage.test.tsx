import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import ApiKeysPage from './ApiKeysPage';

function renderPage(route = '/api-keys') {
  cleanup();
  const router = createMemoryRouter([{ path: '/api-keys', element: <ApiKeysPage /> }], {
    initialEntries: [route],
  });
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('ApiKeysPage', () => {
  it('muestra keys y navega tabs', async () => {
    renderPage();
    expect(await screen.findByText('Backend Servidor 1')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Logs' }));
    expect(await screen.findByPlaceholderText(/Buscar endpoint/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'IPs conectadas' }));
    expect(await screen.findByText(/52\.84\.122\.18/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quick Start' }));
    expect(await screen.findByText(/paso 1/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'API Reference' }));
    expect(await screen.findByRole('button', { name: 'Events (ingest)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Player' })).toBeInTheDocument();
  });

  it('crea key y muestra plain text una vez', async () => {
    renderPage();
    await screen.findByText('Backend Servidor 1');
    fireEvent.click(screen.getByRole('button', { name: /Generar nueva key \(test\)/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByPlaceholderText('Backend Servidor 1'), {
      target: { value: 'QA Integration' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Generar' }));
    await waitFor(() => {
      expect(within(dialog).getByText(/única vez/i)).toBeInTheDocument();
    });
    expect(within(dialog).getByText(/wgpk_test_/)).toBeInTheDocument();
  });

  it('revoca key con confirmación', async () => {
    renderPage();
    await screen.findByText('CI Pipeline');
    fireEvent.click(screen.getAllByRole('button', { name: 'Revocar' })[0]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/dejarán de funcionar/i)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Revocar key' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('filtra logs y abre detalle', async () => {
    renderPage();
    await screen.findByText('Backend Servidor 1');
    fireEvent.click(screen.getByRole('button', { name: 'Logs' }));
    await waitFor(() => {
      expect(document.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
    });
    fireEvent.click(document.querySelector('tbody tr')!);
    expect(await screen.findByText('Detalle de request')).toBeInTheDocument();
  });

  it('ping de prueba desde quick start', async () => {
    renderPage();
    await screen.findByText('Backend Servidor 1');
    fireEvent.click(screen.getByRole('button', { name: 'Quick Start' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Hacer ping de prueba' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar ping' }));
    await waitFor(() => {
      expect(within(dialog).getByText(/Conexión exitosa/i)).toBeInTheDocument();
    });
  });

  it('empty state', () => {
    renderPage('/api-keys?mockState=empty');
    expect(screen.getByText('Sin API keys')).toBeInTheDocument();
  });
});
