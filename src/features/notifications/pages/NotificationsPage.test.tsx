import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import NotificationsPage from './NotificationsPage';

function wrap(route = '/notificaciones') {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['notifications', 'shop', 'missions'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <NotificationsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('NotificationsPage', () => {
  it('muestra canales y permite test', async () => {
    wrap();
    expect(await screen.findByText('In-app')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Test')[0]);
    await waitFor(() => expect(screen.getByText('In-app')).toBeInTheDocument());
  });

  it('lista templates y abre modal nuevo', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    expect(await screen.findByText('Bienvenida al casino')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Nuevo template'));
    expect(screen.getByText('Nuevo template', { selector: 'h2' })).toBeInTheDocument();
  });

  it('crea template desde modal', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    await screen.findByText('Bienvenida al casino');
    fireEvent.click(screen.getByText('Nuevo template'));
    const codeInput = document.querySelector('input[name="code"]') as HTMLInputElement;
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(codeInput, { target: { value: 'test_welcome_ui' } });
    fireEvent.change(nameInput, { target: { value: 'Test UI Welcome' } });
    fireEvent.click(screen.getByText('Guardar template'));
    await waitFor(() => {
      expect(screen.getByText('Test UI Welcome')).toBeInTheDocument();
    });
  });

  it('filtra historial por status', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Historial' }));
    expect((await screen.findAllByText('crypto_king_88')).length).toBeGreaterThan(0);
    const statusSelect = screen.getByRole('option', { name: 'failed' }).closest('select') as HTMLSelectElement;
    fireEvent.change(statusSelect, { target: { value: 'failed' } });
    await waitFor(() => {
      const cells = screen.getAllByText('failed');
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  it('envío manual con jugador', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Envío manual' }));
    fireEvent.change(screen.getByPlaceholderText('handle o id (mín. 2 chars)...'), {
      target: { value: 'crypto' },
    });
    await waitFor(() => screen.getByText('crypto_king_88'));
    fireEvent.click(screen.getByText('crypto_king_88'));
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Historial' })).toBeInTheDocument();
    });
  });

  it('muestra estadísticas', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Estadísticas' }));
    expect(await screen.findByText('enviadas hoy')).toBeInTheDocument();
    expect(screen.getByText('envíos últimos 30 días por canal')).toBeInTheDocument();
  });

  it('tab popups al login lista templates', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Popups al Login' }));
    expect(await screen.findByText('Mantén tu racha')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Nuevo popup template'));
    expect(screen.getByText('Nuevo popup template', { selector: 'h2' })).toBeInTheDocument();
  });

  it('tab mensaje manual popup', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Mensaje Manual' }));
    expect(await screen.findByText(/próximo login del jugador/)).toBeInTheDocument();
  });

  it('tab historial popups', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Historial Popups' }));
    expect(await screen.findByText('Mostrados hoy')).toBeInTheDocument();
  });

  it('módulo inactivo', () => {
    cleanup();
    useOperatorStore.setState({ activeModuleCodes: ['shop'], billingMode: 'wallet' });
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <NotificationsPage />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Módulo Notificaciones no activo')).toBeInTheDocument();
  });
});
