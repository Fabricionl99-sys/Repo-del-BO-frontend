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
  it('lista misiones con trigger en español', async () => {
    wrap(<MissionsPage />);
    expect(await screen.findByText(/Apostá \$500/)).toBeInTheDocument();
    expect((await screen.findAllByText(/Apuesta realizada/)).length).toBeGreaterThan(0);
  });

  it('filtra por trigger deposit_first', async () => {
    wrap(<MissionsPage />);
    await screen.findByText(/Apostá \$500/);
    fireEvent.click(screen.getByText('Primer depósito'));
    await waitFor(() => {
      expect(screen.getByText('Primer depósito')).toBeInTheDocument();
      expect(screen.queryByText(/Apostá \$500/)).not.toBeInTheDocument();
    });
  });

  it('editor permite crear misión con trigger nuevo', async () => {
    wrap(<MissionsPage />);
    await screen.findByText(/Apostá \$500/);
    fireEvent.click(screen.getByText('Nueva misión'));
    wrap(
      <Routes>
        <Route path="/misiones/nueva" element={<MissionEditorPage />} />
      </Routes>,
      '/misiones/nueva',
    );
    expect(screen.getByText('Información básica')).toBeInTheDocument();
    expect(screen.getByText('Apuesta realizada')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Nombre de la misión'), {
      target: { value: 'Misión QA KYC' },
    });
    fireEvent.change(screen.getByPlaceholderText('Descripción'), {
      target: { value: 'Completá verificación KYC' },
    });
    const triggerSelect = screen.getByLabelText('trigger') ?? screen.getAllByRole('combobox')[0];
    fireEvent.change(triggerSelect, { target: { value: 'kyc_completed' } });
    fireEvent.click(screen.getByText('Activar'));
  });

  it('empty state', async () => {
    wrap(<MissionsPage />, '/misiones?mockState=empty');
    expect(await screen.findByText('No hay misiones')).toBeInTheDocument();
  });
});
