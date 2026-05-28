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
});
