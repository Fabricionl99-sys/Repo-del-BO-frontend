import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import TeamPage from './TeamPage';

function renderPage(route = '/equipo') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <TeamPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('TeamPage', () => {
  it('renderiza tabla, tabs, filtro y modal de invitación', async () => {
    renderPage();

    expect(await screen.findByText('Fabricio Lasagna')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('buscar por nombre, email o rol...'), { target: { value: 'maria' } });
    expect(await screen.findByText('María López')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Invitar miembro'));
    expect(screen.getByText('Enviar invitación')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancelar'));

    fireEvent.click(screen.getByText('Roles y permisos'));
    expect(screen.getByText('4 roles fijos disponibles')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Historial de acceso'));
    expect(screen.getByText('Fabricio inició sesión desde Lima')).toBeInTheDocument();
  });

  it('renderiza estado empty forzado', async () => {
    renderPage('/equipo?mockState=empty');
    expect(await screen.findByText('No hay miembros')).toBeInTheDocument();
  });
});
