import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { useOperatorStore } from '@/stores/operatorStore';

function wrap() {
  cleanup();
  useAuthStore.setState({
    user: {
      id: 'u1',
      name: 'Admin',
      email: 'admin@test.com',
      role: 'admin',
      initials: 'AD',
      operators: [],
    },
    accessToken: 'token',
  });
  useOperatorStore.setState({
    activeModuleCodes: ['xp_engine', 'coins'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <Sidebar />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Sidebar billing', () => {
  it('oculta módulos inactivos y muestra sección Disponibles', () => {
    wrap();
    expect(screen.queryByText('Misiones')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Disponibles'));
    expect(screen.getByText('Misiones')).toBeInTheDocument();
    expect(screen.getByText('Ver catálogo completo →')).toBeInTheDocument();
  });

  it('muestra Mi Wallet y Módulos en configuración', () => {
    wrap();
    expect(screen.getByText('Mi Wallet')).toBeInTheDocument();
    expect(screen.getByText('Módulos')).toBeInTheDocument();
  });
});
