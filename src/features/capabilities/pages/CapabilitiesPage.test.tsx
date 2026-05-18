import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import CapabilitiesPage from '@/features/capabilities/pages/CapabilitiesPage';

function renderPage(path = '/capabilities') {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <CapabilitiesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CapabilitiesPage', () => {
  it('renders products tab with seeded capabilities', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Casino')).toBeInTheDocument();
    });
    expect(screen.getByText('Sportsbook')).toBeInTheDocument();
    expect(screen.getByText('Slots')).toBeInTheDocument();
  });

  it('shows unsupported configs tab with examples', async () => {
    const user = userEvent.setup();
    renderPage();
    await waitFor(() => expect(screen.getByText('Casino')).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Configs no soportadas' }));
    await waitFor(() => {
      expect(screen.getAllByText(/horse_racing_bet/).length).toBeGreaterThan(0);
    });
  });

  it('empty state offers first detection', async () => {
    renderPage('/capabilities?mockState=empty');
    expect(await screen.findByText('Sin capabilities detectadas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ejecutar primera detección/i })).toBeInTheDocument();
  });
});
