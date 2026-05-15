import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import StreaksPage from '@/features/streaks/pages/StreaksPage';

function wrap(route = '/rachas') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <StreaksPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('StreaksPage', () => {
  it('muestra programas de racha', async () => {
    wrap();
    expect(await screen.findByText('Racha de login 7 días')).toBeInTheDocument();
  });

  it('empty state', () => {
    wrap('/rachas?mockState=empty');
    expect(screen.getByText('Aún no tenés programas de racha')).toBeInTheDocument();
  });

  it('tab jugadores', async () => {
    wrap();
    fireEvent.click(screen.getByRole('button', { name: /Jugadores con racha/i }));
    expect(await screen.findByText('crypto_king_88')).toBeInTheDocument();
  });
});
