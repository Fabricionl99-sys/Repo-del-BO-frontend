import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import ModulesPage from './ModulesPage';

function wrap(route = '/modulos') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ModulesPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Módulos', () => {
  it('muestra catálogo de 14 módulos', async () => {
    wrap();
    expect(await screen.findByText('Módulos')).toBeInTheDocument();
    expect(await screen.findByText('Motor de XP')).toBeInTheDocument();
    expect(await screen.findByText('Multi-moneda')).toBeInTheDocument();
    expect(await screen.findByText('Avatares')).toBeInTheDocument();
  });

  it('muestra indicador de desactivación pendiente', async () => {
    wrap();
    expect(await screen.findByText('Notificaciones', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(await screen.findByText(/Desactivación programada/, {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
