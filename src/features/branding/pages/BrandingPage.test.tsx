import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';

import BrandingPage from './BrandingPage';

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
    expect(await screen.findByText('paletas predefinidas')).toBeInTheDocument();
    expect(screen.getByText('Dark Neon')).toBeInTheDocument();
    expect(screen.getByText('preview en vivo')).toBeInTheDocument();
    expect(screen.getAllByText('Niveles Widget').length).toBeGreaterThan(0);
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
    expect(screen.getByText('modo custom')).toBeInTheDocument();
    const hexInputs = screen.getAllByDisplayValue('#0AF784');
    fireEvent.change(hexInputs[0], { target: { value: '#FF0000' } });
    expect(screen.getAllByDisplayValue('#FF0000').length).toBeGreaterThan(0);
  });

  it('cambia tipografía', async () => {
    wrap();
    await screen.findByText('Tipografía');
    fireEvent.click(screen.getByRole('button', { name: 'Tipografía' }));
    const fontSelect = screen.getByDisplayValue('Inter');
    fireEvent.change(fontSelect, { target: { value: 'Poppins' } });
    expect(screen.getByDisplayValue('Poppins')).toBeInTheDocument();
    expect(screen.getByText('Título del widget')).toBeInTheDocument();
  });

  it('sube logo válido', async () => {
    wrap();
    await screen.findByText('Logo e imágenes');
    fireEvent.click(screen.getByRole('button', { name: 'Logo e imágenes' }));
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      const logoPreview = Array.from(document.querySelectorAll('img')).find((img) =>
        img.className.includes('h-24 w-24'),
      );
      expect(logoPreview).toHaveAttribute(
        'src',
        'https://dummyimage.com/256x256/0AF784/0E1116&text=Logo',
      );
    });
  });

  it('cambia posición y tamaño del widget', async () => {
    wrap();
    await screen.findByText('Configuración del widget');
    fireEvent.click(screen.getByRole('button', { name: 'Configuración del widget' }));
    fireEvent.click(screen.getByLabelText(/abajo izquierda/i));
    fireEvent.click(screen.getByLabelText(/^large$/i));
    fireEvent.change(screen.getByDisplayValue('Bienvenido a tu experiencia de gamificación'), {
      target: { value: 'Hola WINGOAT' },
    });
    expect(screen.getByDisplayValue('Hola WINGOAT')).toBeInTheDocument();
  });

  it('abre modal de vista previa', async () => {
    wrap();
    await screen.findByText('Vista previa');
    fireEvent.click(screen.getByRole('button', { name: 'Vista previa' }));
    expect(await screen.findByText('Vista previa del widget', { selector: 'h2' })).toBeInTheDocument();
    fireEvent.click(screen.getByTitle('Desktop'));
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
