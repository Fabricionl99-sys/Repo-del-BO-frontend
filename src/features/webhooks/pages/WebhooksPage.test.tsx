import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import WebhooksPage from './WebhooksPage';

function renderPage(route = '/webhooks') {
  cleanup();
  const router = createMemoryRouter([{ path: '/webhooks', element: <WebhooksPage /> }], {
    initialEntries: [route],
  });
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('WebhooksPage', () => {
  it('muestra endpoints y navega tabs', async () => {
    renderPage();
    expect(await screen.findByText('Backend Producción')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Deliveries' }));
    expect(await screen.findByPlaceholderText(/player_id/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Estadísticas' }));
    expect(await screen.findByText('Deliveries por hora')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guía de integración' }));
    expect(await screen.findByText(/Verificar firma HMAC/i)).toBeInTheDocument();
  });

  it('crea endpoint y muestra HMAC una vez', async () => {
    renderPage();
    await screen.findByText('Backend Producción');
    fireEvent.click(screen.getByRole('button', { name: /Nuevo endpoint/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByDisplayValue('https://'), {
      target: { value: 'https://hooks.example.com/niveles' },
    });
    const inputs = within(dialog).getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'QA Hook' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /Crear y generar secret/i }));
    await waitFor(() => {
      expect(within(dialog).getByText(/única vez/i)).toBeInTheDocument();
    });
    expect(within(dialog).getByText(/whsec_/)).toBeInTheDocument();
  });

  it('rota HMAC con confirmación', async () => {
    renderPage();
    await screen.findByText('Backend Testing');
    fireEvent.click(screen.getAllByRole('button', { name: 'Rotar HMAC' })[0]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/24 horas/i)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: /Generar nuevo secret/i }));
    await waitFor(() => {
      expect(within(dialog).getByText(/whsec_/)).toBeInTheDocument();
    });
  });

  it('test ping desde modal', async () => {
    renderPage();
    await screen.findByText('Backend Producción');
    fireEvent.click(screen.getAllByRole('button', { name: 'Test' })[0]);
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar' }));
    await waitFor(() => {
      expect(within(dialog).getByText(/Ping exitoso|HTTP/i)).toBeInTheDocument();
    });
  });

  it('filtra deliveries y abre detalle', async () => {
    renderPage();
    await screen.findByText('Backend Producción');
    fireEvent.click(screen.getByRole('button', { name: 'Deliveries' }));
    const row = await waitFor(() => {
      const tr = document.querySelector('tbody tr');
      if (!tr) throw new Error('no rows');
      return tr;
    });
    fireEvent.click(row);
    expect(await screen.findByText('Detalle de delivery')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Payload' }));
    expect(within(screen.getByRole('dialog')).getAllByText(/reward\.granted/)[0]).toBeInTheDocument();
  });

  it('force retry en delivery fallido', async () => {
    renderPage();
    await screen.findByText('Backend Producción');
    fireEvent.click(screen.getByRole('button', { name: 'Deliveries' }));
    await waitFor(() => expect(document.querySelectorAll('tbody tr').length).toBeGreaterThan(0));
    const retryBtn = screen.queryAllByRole('button', { name: 'Retry' })[0];
    if (!retryBtn) return;
    fireEvent.click(retryBtn);
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('empty state', () => {
    renderPage('/webhooks?mockState=empty');
    expect(screen.getByText('Sin endpoints')).toBeInTheDocument();
  });
});
