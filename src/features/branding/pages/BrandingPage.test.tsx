import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import BrandingPage from './BrandingPage';

vi.mock('../components/WidgetPreviewIframe', () => ({
  WidgetPreviewIframe: () => <div data-testid="widget-preview-iframe">Widget preview iframe</div>,
}));

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

function wrap(route = '/branding') {
  cleanup();
  useOperatorStore.setState({
    current: { id: 'demo', name: 'Demo', slug: 'demo' } as never,
    activeModuleCodes: ['branding', 'shop', 'missions'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <BrandingPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('BrandingPage', () => {
  it('muestra paletas predefinidas y preview en vivo', async () => {
    wrap();
    expect(await screen.findByText('Dark Neon')).toBeInTheDocument();
    expect(screen.getByText('Preview en vivo')).toBeInTheDocument();
    expect(screen.getByTestId('widget-preview-iframe')).toBeInTheDocument();
  });

  it('cambia paleta predefinida', async () => {
    wrap();
    await screen.findByText('Gold Luxury');
    fireEvent.click(screen.getByText('Gold Luxury'));
    expect(screen.getByText('Gold Luxury').closest('button')).toHaveClass('border-accent');
  });

  it('activa modo custom y edita color', async () => {
    wrap();
    await screen.findByText('Personalizar paleta');
    fireEvent.click(screen.getByText('Personalizar paleta'));
    const hexInputs = screen.getAllByDisplayValue('#0AF784');
    fireEvent.change(hexInputs[0], { target: { value: '#FF0000' } });
    expect(screen.getAllByDisplayValue('#FF0000').length).toBeGreaterThan(0);
  });

  it('cambia tipografía', async () => {
    wrap();
    fireEvent.click(await screen.findByRole('button', { name: /^Tipografía$/i }));
    const poppinsOptions = await screen.findAllByRole('option', { name: 'Poppins' });
    fireEvent.click(poppinsOptions[0]);
    expect(poppinsOptions[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('muestra upload zones en sección marca', async () => {
    wrap();
    fireEvent.click(await screen.findByRole('button', { name: /Marca/i }));
    expect((await screen.findAllByText(/Arrastrá o hacé click para subir/i)).length).toBeGreaterThan(0);
  });

  it('cambia posición y tamaño del widget en behavior', async () => {
    wrap();
    fireEvent.click(await screen.findByRole('button', { name: /Behavior/i }));
    fireEvent.click(screen.getByLabelText(/abajo izquierda/i));
    fireEvent.click(screen.getByLabelText(/^large$/i));
    fireEvent.click(await screen.findByRole('button', { name: /Marca/i }));
    fireEvent.change(screen.getByDisplayValue('Bienvenido a tu experiencia de gamificación'), {
      target: { value: 'Hola Social2Game' },
    });
    expect(screen.getByDisplayValue('Hola Social2Game')).toBeInTheDocument();
  });

  it('abre modal de vista previa ampliada', async () => {
    wrap();
    fireEvent.click(await screen.findByRole('button', { name: /Advanced/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Probar CSS en preview ampliado/i }));
    expect(await screen.findByText('Vista previa del widget', { selector: 'h2' })).toBeInTheDocument();
  });

  it('resetea a defaults', async () => {
    wrap();
    await screen.findByText('Gold Luxury');
    fireEvent.click(screen.getByText('Gold Luxury'));
    fireEvent.click(screen.getByRole('button', { name: 'Resetear a defaults' }));
    expect(screen.getByText('Resetear a defaults', { selector: 'h2' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Resetear' }));
    await waitFor(() => {
      expect(screen.getByText('Dark Neon').closest('button')).toHaveClass('border-accent');
    });
  });

  it('empty state sin configuración', async () => {
    wrap('/branding?mockState=empty');
    expect(await screen.findByText('Empezá personalizando')).toBeInTheDocument();
  });

  it('empty state módulo inactivo', () => {
    cleanup();
    useOperatorStore.setState({ activeModuleCodes: ['shop'], billingMode: 'wallet' });
    render(
      <MemoryRouter>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <BrandingPage />
        </QueryClientProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Módulo Branding no activo')).toBeInTheDocument();
  });
});
