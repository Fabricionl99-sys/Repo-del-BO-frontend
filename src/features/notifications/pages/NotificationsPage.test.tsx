import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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
        <Routes>
          <Route path="/notificaciones" element={<NotificationsPage />} />
          <Route path="/notificaciones/templates/nuevo" element={<NotificationsPage />} />
          <Route path="/notificaciones/templates/:id" element={<NotificationsPage />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('NotificationsPage', () => {
  it('muestra canales y permite test', async () => {
    wrap();
    expect(await screen.findByText('In-app')).toBeInTheDocument();
    fireEvent.click(screen.getAllByText('Probar conexión')[0]);
    await waitFor(() => expect(screen.getByText('In-app')).toBeInTheDocument());
  });

  it('lista templates y abre modal nuevo con combo libre preseleccionado', async () => {
    wrap('/notificaciones/templates/nuevo');
    expect(await screen.findByText('Nuevo template', { selector: 'h2' })).toBeInTheDocument();
    expect(screen.queryByText(/Ya tenés un template para este evento en este idioma/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeEnabled();
  });

  it('crea template desde modal con combo libre', async () => {
    wrap('/notificaciones/templates/nuevo');
    await screen.findByText('Nuevo template', { selector: 'h2' });
    const triggerSelect = document.querySelector('select[name="trigger_event"]') as HTMLSelectElement;
    const languageSelect = document.querySelector('select[name="language"]') as HTMLSelectElement;
    fireEvent.change(triggerSelect, { target: { value: 'wallet_low_balance' } });
    fireEvent.change(languageSelect, { target: { value: 'en' } });
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Test UI Welcome' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() => {
      expect(screen.getByText('Test UI Welcome')).toBeInTheDocument();
    });
  });

  it('muestra link para editar template duplicado', async () => {
    wrap('/notificaciones/templates/nuevo');
    await screen.findByText('Nuevo template', { selector: 'h2' });
    const triggerSelect = document.querySelector('select[name="trigger_event"]') as HTMLSelectElement;
    const languageSelect = document.querySelector('select[name="language"]') as HTMLSelectElement;
    fireEvent.change(triggerSelect, { target: { value: 'welcome' } });
    fireEvent.change(languageSelect, { target: { value: 'es' } });
    expect(await screen.findByText(/Ya tenés un template para este evento/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Editar el existente/i })).toHaveAttribute(
      'href',
      '/notificaciones/templates/ntpl_welcome',
    );
  });

  it('carga body in_app desde content_by_channel al editar', async () => {
    wrap('/notificaciones/templates/ntpl_manual');
    expect(
      await screen.findByDisplayValue('Te entregamos un avatar de regalo. Revisá tu colección.'),
    ).toBeInTheDocument();
  });

  it('muestra botones Editar y Archivar inline en filas activas', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    await screen.findByText('Bienvenida al casino');
    expect(screen.getAllByRole('button', { name: 'Editar' }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: 'Archivar' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Eliminar definitivo' })).not.toBeInTheDocument();
  });

  it('tab archivados muestra Eliminar definitivo y no Archivar', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    await screen.findByText('Bienvenida al casino');
    fireEvent.click(screen.getByRole('button', { name: 'archived' }));
    await screen.findByText('Promo legacy archivada');
    expect(screen.getByRole('button', { name: 'Eliminar definitivo' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Archivar' })).not.toBeInTheDocument();
  });

  it('filtra templates archivados con status=archived', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    await screen.findByText('Bienvenida al casino');
    fireEvent.click(screen.getByRole('button', { name: 'archived' }));
    expect(await screen.findByText('Promo legacy archivada')).toBeInTheDocument();
    expect(screen.queryByText('Bienvenida al casino')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Eliminar definitivo' })).toBeInTheDocument();
  });

  it('no muestra menú ⋮ en templates', async () => {
    wrap();
    await screen.findByText('In-app');
    fireEvent.click(screen.getByRole('button', { name: 'Templates' }));
    await screen.findByText('Bienvenida al casino');
    expect(screen.queryByTitle('Acciones')).not.toBeInTheDocument();
  });

  it('permite editar template existente sin campo code', async () => {
    wrap('/notificaciones/templates/ntpl_welcome');
    expect(await screen.findByDisplayValue('Bienvenida al casino')).toBeInTheDocument();
    expect(screen.getByText('Editar template', { selector: 'h2' })).toBeInTheDocument();
    expect(document.querySelector('input[name="code"]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Guardar template' })).toBeEnabled();
  });

  it('muestra error visible al guardar con body vacío', async () => {
    wrap('/notificaciones/templates/ntpl_welcome');
    await screen.findByDisplayValue('Bienvenida al casino');
    const body = document.querySelector('textarea[name="body"]') as HTMLTextAreaElement;
    fireEvent.change(body, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar template' }));
    expect(await screen.findByText(/Revisá los campos marcados en rojo/i)).toBeInTheDocument();
    expect(await screen.findByText(/El mensaje es obligatorio/i)).toBeInTheDocument();
  });

  it('muestra sección audiencia y disclaimer de filtros AND', async () => {
    wrap('/notificaciones/templates/nuevo');
    await screen.findByText('Nuevo template', { selector: 'h2' });
    expect(screen.getByText('Limitar audiencia')).toBeInTheDocument();
    expect(screen.queryByText(/usá el módulo Noticias/i)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Limitar audiencia' }));
    expect(
      await screen.findByText(/SOLO se envía a jugadores que cumplan TODAS las condiciones/i),
    ).toBeInTheDocument();
  });

  it('carga audience_filter al editar template existente', async () => {
    wrap('/notificaciones/templates/ntpl_level_up');
    await screen.findByDisplayValue('Subiste de nivel');
    const vipCheckbox = await screen.findByRole('checkbox', { name: /Solo jugadores VIP/i });
    expect(vipCheckbox).toBeChecked();
    const minLevel = document.querySelector('input[name="player_level_min"]') as HTMLInputElement;
    expect(minLevel.value).toBe('5');
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
    const triggerSelect = document.querySelector('select[name="trigger_event"]') as HTMLSelectElement;
    expect(triggerSelect).toBeTruthy();
    expect(Array.from(triggerSelect.options).map((o) => o.value)).toEqual([
      'on_login',
      'on_login_daily_first',
    ]);
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
      <MemoryRouter initialEntries={['/notificaciones']}>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <Routes>
            <Route path="/notificaciones" element={<NotificationsPage />} />
          </Routes>
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Módulo Notificaciones no activo')).toBeInTheDocument();
  });
});
