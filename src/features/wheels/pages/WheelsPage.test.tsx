import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import WheelsPage from '@/features/wheels/pages/WheelsPage';
import { useOperatorStore } from '@/stores/operatorStore';

function renderPage(path = '/ruedas') {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <WheelsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('WheelsPage', () => {
  it('renders catalog with seeded wheels when module active', async () => {
    useOperatorStore.setState({
      activeModuleCodes: ['wheels', 'chests', 'shop', 'missions'],
      billingMode: 'wallet',
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText('Rueda Daily').length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText('Rueda VIP').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rueda Welcome').length).toBeGreaterThan(0);
  });

  it('shows module gate when wheels inactive', async () => {
    useOperatorStore.setState({ activeModuleCodes: ['shop'], billingMode: 'wallet' });
    renderPage();
    expect(await screen.findByText('Módulo Ruedas no activo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Activar módulo Ruedas/i })).toHaveAttribute('href', '/modulos');
  });
});
