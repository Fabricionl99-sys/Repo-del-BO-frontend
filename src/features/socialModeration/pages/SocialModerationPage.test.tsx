import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import SocialModerationPage from './SocialModerationPage';
import { useOperatorStore } from '@/stores/operatorStore';

function wrap() {
  cleanup();
  return render(
    <MemoryRouter initialEntries={['/moderacion-social']}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <SocialModerationPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('SocialModerationPage', () => {
  beforeEach(() => {
    useOperatorStore.setState({ activeModuleCodes: ['social', 'missions'] });
  });

  it('muestra cola de reports y tabs de config', async () => {
    wrap();
    expect(await screen.findByText('JugadorX')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Config moderación'));
    expect(await screen.findByText('Guardar configuración')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Perfiles baneados'));
    expect(screen.getByText('Sin perfiles baneados')).toBeInTheDocument();
  });

  it('muestra empty state si social no está activo', () => {
    useOperatorStore.setState({ activeModuleCodes: ['missions'] });
    wrap();
    expect(screen.getByText('Social no está activo')).toBeInTheDocument();
  });
});
