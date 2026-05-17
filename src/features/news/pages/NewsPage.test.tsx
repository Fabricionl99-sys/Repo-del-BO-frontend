import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import NewsPage from './NewsPage';

function wrap(route = '/noticias') {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['news', 'missions', 'shop'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <NewsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('NewsPage', () => {
  it('muestra catálogo y abre modal nueva noticia', async () => {
    wrap();
    expect(await screen.findByText(/Festival de Primavera/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Nueva noticia'));
    expect(screen.getByText('Nueva noticia', { selector: 'h2' })).toBeInTheDocument();
  });

  it('filtra por categoría promo', async () => {
    wrap();
    await screen.findByText(/Festival de Primavera/);
    fireEvent.click(screen.getByRole('button', { name: 'Promo' }));
    await waitFor(() => {
      expect(screen.getByText(/Bonus 50%/)).toBeInTheDocument();
    });
  });

  it('crear noticia abre modal con campos', async () => {
    wrap();
    await screen.findByText(/Festival de Primavera/);
    fireEvent.click(screen.getByText('Nueva noticia'));
    expect(screen.getByPlaceholderText('festival_mayo_2026')).toBeInTheDocument();
    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('tab estadísticas muestra métricas', async () => {
    wrap();
    await screen.findByText(/Festival de Primavera/);
    fireEvent.click(screen.getByRole('button', { name: 'Estadísticas' }));
    expect(await screen.findByText('top 5 por visualizaciones')).toBeInTheDocument();
  });

  it('módulo inactivo muestra CTA', () => {
    cleanup();
    useOperatorStore.setState({ activeModuleCodes: ['shop'], billingMode: 'wallet' });
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <NewsPage />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Módulo Noticias no activo')).toBeInTheDocument();
  });

  it('empty state forzado', async () => {
    wrap('/noticias?mockState=empty');
    expect(await screen.findByText('Sin noticias')).toBeInTheDocument();
  });
});
