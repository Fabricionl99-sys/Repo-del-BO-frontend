import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import SettingsPage from './SettingsPage';

vi.stubGlobal(
  'Image',
  class {
    naturalWidth = 512;
    naturalHeight = 512;
    onload: (() => void) | null = null;
    set src(_: string) {
      this.onload?.();
    }
  },
);

function wrap(route = '/configuracion') {
  cleanup();
  localStorage.removeItem('niveles_operator_config_v2');
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
  it('carga datos de empresa y muestra tabs', async () => {
    wrap();
    expect(await screen.findByText('datos de la empresa')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Casino Astral S.A.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Contacto' })).toBeInTheDocument();
  });

  it('navega tabs y guarda cambios de contacto', async () => {
    wrap();
    await screen.findByText('datos de la empresa');
    fireEvent.click(screen.getByRole('button', { name: 'Contacto' }));
    expect(await screen.findByText('contacto')).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('admin@casinoastral.com'), { target: { value: 'ops@casinoastral.com' } });
    expect(screen.getByText('Tenés cambios sin guardar')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Guardar cambios'));
    await waitFor(() => {
      expect(screen.queryByText('Tenés cambios sin guardar')).not.toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('ops@casinoastral.com')).toBeInTheDocument();
  });

  it('cambia localización y formato fecha', async () => {
    wrap();
    await screen.findByText('datos de la empresa');
    fireEvent.click(screen.getByRole('button', { name: 'Localización' }));
    await screen.findByText('localización');
    fireEvent.click(screen.getByText('05/16/2026'));
    fireEvent.click(screen.getByText('1,000.00'));
    fireEvent.click(screen.getByText('Guardar cambios'));
    await waitFor(() => {
      expect(screen.getByText('05/16/2026').closest('button')).toHaveClass('border-accent');
    });
  });

  it('sube logo desde modal', async () => {
    wrap();
    await screen.findByText('Subir logo');
    fireEvent.click(screen.getByText('Subir logo'));
    await screen.findByRole('dialog');
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('agrega feriado en tab horarios', async () => {
    wrap();
    await screen.findByText('datos de la empresa');
    fireEvent.click(screen.getByRole('button', { name: 'Horarios' }));
    await screen.findByText('días festivos');
    fireEvent.click(screen.getByText('Agregar feriado'));
    const dialog = await screen.findByRole('dialog');
    const dateInput = dialog.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2026-07-09' } });
    const descInput = dialog.querySelectorAll('input.field')[1] as HTMLInputElement;
    fireEvent.change(descInput, { target: { value: 'Día de la Independencia' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Guardar' }));
    await waitFor(() => {
      expect(screen.getByText('Día de la Independencia')).toBeInTheDocument();
    });
  });

  it('envía test de notificaciones', async () => {
    wrap();
    await screen.findByText('datos de la empresa');
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    await screen.findByText('notificaciones del equipo');
    fireEvent.click(screen.getByRole('button', { name: 'Enviar test' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Enviar test' }));
    await waitFor(() => {
      expect(within(dialog).getByText(/Test enviado a/i)).toBeInTheDocument();
    });
  });

  it('descarta cambios con confirmación', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    wrap();
    await screen.findByDisplayValue('Casino Astral S.A.');
    fireEvent.change(screen.getByDisplayValue('Casino Astral S.A.'), { target: { value: 'Otro nombre' } });
    fireEvent.click(screen.getByText('Descartar'));
    expect(confirm).toHaveBeenCalled();
    expect(screen.getByDisplayValue('Casino Astral S.A.')).toBeInTheDocument();
    confirm.mockRestore();
  });

  it('empty state', () => {
    wrap('/configuracion?mockState=empty');
    expect(screen.getByText('Sin configuración')).toBeInTheDocument();
  });
});
