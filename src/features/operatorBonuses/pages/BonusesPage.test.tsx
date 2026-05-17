import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import BonusesPage from './BonusesPage';

function wrap(route = '/bonos') {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['shop', 'missions', 'chests'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <BonusesPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('BonusesPage', () => {
  it('muestra catálogo con stats y abre modal nuevo bono', async () => {
    wrap();
    expect(await screen.findByText('50 Free Spins Book of Dead')).toBeInTheDocument();
    expect(screen.getByText('Activos')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Bono manual'));
    expect(screen.getByText('Nuevo bono manual', { selector: 'h2' })).toBeInTheDocument();
  });

  it('navega tab configuración API', async () => {
    wrap();
    await screen.findByText('50 Free Spins Book of Dead');
    fireEvent.click(screen.getByRole('button', { name: 'Configuración API' }));
    expect(await screen.findByText(/¿Tu plataforma soporta API de bonos?/)).toBeInTheDocument();
  });

  it('muestra historial de entregas', async () => {
    wrap();
    await screen.findByText('50 Free Spins Book of Dead');
    fireEvent.click(screen.getByRole('button', { name: 'Historial de Entregas' }));
    expect(await screen.findByText('Intentos')).toBeInTheDocument();
    expect((await screen.findAllByText(/crypto_king_88|MariaG_bet/)).length).toBeGreaterThan(0);
  });

  it('empty state sin bonos', async () => {
    wrap('/bonos?mockState=empty');
    expect(await screen.findByText('Sin bonos en el catálogo')).toBeInTheDocument();
    expect(screen.getByText('Cargar manualmente')).toBeInTheDocument();
  });
});
