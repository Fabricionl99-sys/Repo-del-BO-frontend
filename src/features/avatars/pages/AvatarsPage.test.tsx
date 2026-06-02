import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import AvatarsPage from './AvatarsPage';

vi.stubGlobal(
  'Image',
  class {
    naturalWidth = 512;
    naturalHeight = 512;
    onload: (() => void) | null = null;
    set src(_: string) {
      this.onload?.();
    }
  },
);

function wrap(route = '/avatares') {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['avatars', 'chests', 'missions', 'shop'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <AvatarsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('AvatarsPage', () => {
  it('muestra catálogo, contador y abre modal nuevo avatar', async () => {
    wrap();
    expect(await screen.findByText('León Dorado')).toBeInTheDocument();
    expect(screen.getByText(/\/ 500 avatares creados/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Nuevo avatar'));
    expect(screen.getByText('Nuevo avatar', { selector: 'h2' })).toBeInTheDocument();
  });

  it('filtra catálogo por búsqueda', async () => {
    wrap();
    await screen.findByText('León Dorado');
    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre o code...'), {
      target: { value: 'Tigre' },
    });
    await waitFor(() => {
      expect(screen.getByText('Tigre Nocturno')).toBeInTheDocument();
      expect(screen.queryByText('León Dorado')).not.toBeInTheDocument();
    });
  });

  it('crea categoría y edita desde tab categorías', async () => {
    wrap();
    await screen.findByText('León Dorado');
    fireEvent.click(screen.getByRole('button', { name: 'Categorías' }));
    fireEvent.click(screen.getByText('Nueva categoría'));
    expect(screen.getByText('Nueva categoría', { selector: 'h2' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('code'), { target: { value: 'test_cat_ui' } });
    fireEvent.change(screen.getByLabelText('nombre'), { target: { value: 'Test UI Cat' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear categoría' }));
    await waitFor(() => {
      expect(screen.getByText('Test UI Cat')).toBeInTheDocument();
    });
  });

  it('tab inventario con filtros', async () => {
    wrap();
    await screen.findByText('León Dorado');
    fireEvent.click(screen.getByRole('button', { name: 'Inventario' }));
    await screen.findAllByText('crypto_king_88');
    fireEvent.change(screen.getByPlaceholderText('handle o id...'), {
      target: { value: 'MariaG' },
    });
    await waitFor(() => {
      expect(screen.getAllByText('MariaG_bet').length).toBeGreaterThan(0);
      expect(screen.queryByText('crypto_king_88')).not.toBeInTheDocument();
    });
  });

  it('asignación manual', async () => {
    wrap();
    await screen.findByText('León Dorado');
    fireEvent.click(screen.getByRole('button', { name: 'Asignación manual' }));
    expect(screen.getByText('Mensaje al jugador (aparece en su notificación)')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('handle o id (mín. 2 chars)...'), {
      target: { value: 'crypto' },
    });
    await waitFor(() => screen.getByText('crypto_king_88'));
    fireEvent.click(screen.getByText('crypto_king_88'));
    const avatarSelect = document.querySelector('select.field') as HTMLSelectElement;
    fireEvent.change(avatarSelect, { target: { value: 'av_leon_dorado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Asignar' }));
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Inventario' })).toBeInTheDocument();
    });
  });

  it('empty state sin categorías', async () => {
    wrap('/avatares?mockState=empty-categories');
    expect(await screen.findByText('Sin categorías')).toBeInTheDocument();
  });

  it('empty state módulo inactivo', () => {
    cleanup();
    useOperatorStore.setState({ activeModuleCodes: ['shop'], billingMode: 'wallet' });
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <AvatarsPage />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Módulo Avatares no activo')).toBeInTheDocument();
  });
});
