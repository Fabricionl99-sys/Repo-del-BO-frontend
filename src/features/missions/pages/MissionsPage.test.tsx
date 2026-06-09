import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import MissionsPage from './MissionsPage';
import MissionEditorPage from './MissionEditorPage';

function wrap(ui: React.ReactNode, route = '/misiones') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {ui}
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('MissionsPage', () => {
  it('lista misiones con resumen de requisitos', async () => {
    wrap(<MissionsPage />);
    expect(await screen.findByText(/Apostá \$500 esta semana/)).toBeInTheDocument();
    expect(screen.getByText(/Apostar monto 500 USD/)).toBeInTheDocument();
    expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Inactivo').length).toBeGreaterThan(0);
  });

  it('filtra por requisito verify_kyc', async () => {
    wrap(<MissionsPage />);
    await screen.findByText(/Apostá \$500 esta semana/);
    fireEvent.click(screen.getByRole('button', { name: 'KYC completado' }));
    await waitFor(() => {
      expect(screen.getByText('Casino + KYC')).toBeInTheDocument();
      expect(screen.queryByText(/Apostá \$500 esta semana/)).not.toBeInTheDocument();
    });
  });

  it('editor permite crear misión con requisitos múltiples', async () => {
    wrap(<MissionsPage />);
    await screen.findByText(/Apostá \$500 esta semana/);
    fireEvent.click(screen.getByText('Nueva misión'));
    wrap(
      <Routes>
        <Route path="/misiones/nueva" element={<MissionEditorPage />} />
      </Routes>,
      '/misiones/nueva',
    );
    expect(screen.getByText('Información básica')).toBeInTheDocument();
    expect(screen.getByText('Combinación de requisitos (AND)')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Nombre de la misión'), {
      target: { value: 'Misión QA KYC' },
    });
    fireEvent.change(screen.getByPlaceholderText('Descripción'), {
      target: { value: 'Completá verificación KYC' },
    });
    fireEvent.click(screen.getByText('Activar'));
  });

  it('empty state', async () => {
    wrap(<MissionsPage />, '/misiones?mockState=empty');
    expect(await screen.findByText('No hay misiones')).toBeInTheDocument();
  });

  it('tab asignación manual con búsqueda de jugador y misiones activas', async () => {
    wrap(<MissionsPage />);
    await screen.findByText(/Apostá \$500 esta semana/);
    fireEvent.click(screen.getByRole('button', { name: 'Asignación manual' }));
    expect(screen.getByText('Mensaje al jugador (aparece en su notificación)')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('handle o id (mín. 2 chars)...'), {
      target: { value: 'crypto' },
    });
    const listbox = await screen.findByRole('listbox');
    fireEvent.click(listbox.querySelector('button')!);
    await waitFor(() => {
      expect(screen.getByDisplayValue('pl_mission')).toBeInTheDocument();
    });
    const missionSelect = document.querySelector('select.field') as HTMLSelectElement;
    fireEvent.change(missionSelect, { target: { value: 'mission_weekly_bet_500' } });
    fireEvent.click(screen.getByRole('button', { name: 'Asignar' }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText('handle o id (mín. 2 chars)...')).toHaveValue('');
    });
  });

  it('modal asignar manualmente desde catálogo', async () => {
    wrap(<MissionsPage />);
    await screen.findByText(/Apostá \$500 esta semana/);
    fireEvent.click(screen.getAllByTitle('acciones')[0]!);
    fireEvent.click(screen.getByRole('button', { name: 'Asignar manualmente' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('handle o id (mín. 2 chars)...'), {
      target: { value: 'crypto' },
    });
    await waitFor(() => expect(screen.getByText('crypto_king_88')).toBeInTheDocument());
    fireEvent.click(screen.getByText('crypto_king_88'));
    fireEvent.click(screen.getByRole('button', { name: 'Asignar' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
