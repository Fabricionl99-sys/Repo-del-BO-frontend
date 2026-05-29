import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { BO_LOCAL_STORAGE_KEYS } from '@/lib/boLocalStorage';
import { useOperatorStore } from '@/stores/operatorStore';

import SettingsPage from './SettingsPage';

function wrap(route = '/configuracion') {
  cleanup();
  localStorage.removeItem(BO_LOCAL_STORAGE_KEYS.operatorConfig);
  localStorage.removeItem(BO_LOCAL_STORAGE_KEYS.operatorConfigLegacy);
  localStorage.removeItem(BO_LOCAL_STORAGE_KEYS.brandingConfig);
  localStorage.removeItem(BO_LOCAL_STORAGE_KEYS.brandingConfigLegacy);
  useOperatorStore.setState({
    current: { id: 'demo', name: 'Demo', slug: 'demo' } as never,
    activeModuleCodes: ['coins'],
    billingMode: 'wallet',
  });
  const router = createMemoryRouter([{ path: '/configuracion', element: <SettingsPage /> }], {
    initialEntries: [route],
  });
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  it('carga preferencias persistidas y muestra tabs', async () => {
    wrap();
    expect(await screen.findByText('preferencias')).toBeInTheDocument();
    expect(screen.getByDisplayValue('admin@casinoastral.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cofre bienvenida' })).toBeInTheDocument();
  });

  it('guarda email de notificaciones', async () => {
    wrap();
    await screen.findByText('preferencias');
    fireEvent.change(screen.getByDisplayValue('admin@casinoastral.com'), {
      target: { value: 'ops@casinoastral.com' },
    });
    expect(screen.getByText('Tenés cambios sin guardar')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Guardar cambios'));
    await waitFor(() => {
      expect(screen.queryByText('Tenés cambios sin guardar')).not.toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('ops@casinoastral.com')).toBeInTheDocument();
  });

  it('navega al tab cofre de bienvenida', async () => {
    wrap();
    await screen.findByText('preferencias');
    fireEvent.click(screen.getByRole('button', { name: 'Cofre bienvenida' }));
    expect(await screen.findByText('Cofre de bienvenida')).toBeInTheDocument();
  });

  it('descarta cambios con confirmación', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    wrap();
    await screen.findByText('preferencias');
    const emailInput = screen.getByRole('textbox', { name: /email de notificaciones/i }) as HTMLInputElement;
    const original = emailInput.value;
    fireEvent.change(emailInput, { target: { value: 'otro@test.com' } });
    fireEvent.click(screen.getByText('Descartar'));
    expect(confirm).toHaveBeenCalled();
    expect((screen.getByRole('textbox', { name: /email de notificaciones/i }) as HTMLInputElement).value).toBe(
      original,
    );
    confirm.mockRestore();
  });

  it('empty state', () => {
    wrap('/configuracion?mockState=empty');
    expect(screen.getByText('Sin configuración')).toBeInTheDocument();
  });
});
