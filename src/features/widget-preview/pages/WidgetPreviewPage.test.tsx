import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import WidgetPreviewPage from './WidgetPreviewPage';

function wrap() {
  cleanup();
  useOperatorStore.setState({
    current: { id: 'demo', name: 'Demo', slug: 'demo' } as never,
    activeModuleCodes: ['missions', 'chests', 'shop', 'rankings', 'news', 'branding'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <WidgetPreviewPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('WidgetPreviewPage', () => {
  it('renderiza preview con selector de jugadores', async () => {
    wrap();
    expect(await screen.findByText('Preview del Widget del Jugador')).toBeInTheDocument();
    expect(await screen.findByText('Jugador mock')).toBeInTheDocument();
    expect(screen.getByText('Datos del jugador')).toBeInTheDocument();
    expect(screen.getByText('Configuración actual')).toBeInTheDocument();
  });

  it('cambia entre jugadores mock', async () => {
    wrap();
    const select = await screen.findByRole('combobox');
    fireEvent.change(select, { target: { value: 'pl_vip' } });
    await waitFor(() => {
      expect(select).toHaveValue('pl_vip');
      expect(screen.getByText('@vip_roller · Nivel 28')).toBeInTheDocument();
    });
  });

  it('toggle mobile/desktop', async () => {
    wrap();
    await screen.findByText('Preview del Widget del Jugador');
    fireEvent.click(screen.getByRole('button', { name: 'Desktop' }));
    expect(screen.getByText('widget.social2game.com')).toBeInTheDocument();
  });
});
