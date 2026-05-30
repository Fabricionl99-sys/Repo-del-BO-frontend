import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LevelsPage from './LevelsPage';

function wrap(route = '/curva-niveles') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <LevelsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Curva de niveles', () => {
  it('muestra tabla editable y acciones', async () => {
    wrap();
    expect(await screen.findByText('Curva de niveles')).toBeInTheDocument();
    expect(screen.getByText('Nivel')).toBeInTheDocument();
    expect(screen.getByText('+ Agregar nivel 16')).toBeInTheDocument();
    expect(screen.getByText('Nivel 1')).toBeInTheDocument();
    expect(screen.queryByText('Exportar JSON')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Guardar curva'));
  });

  it('empty forzado', () => {
    wrap('/curva-niveles?mockState=empty');
    expect(screen.getByText('No hay curva configurada')).toBeInTheDocument();
  });
});
