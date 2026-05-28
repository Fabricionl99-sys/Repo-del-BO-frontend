import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { MediaValue } from '@/types/media';

import { MediaUploader } from './MediaUploader';

function wrap(ui: ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );
}

describe('MediaUploader', () => {
  it('muestra modo upload por defecto', () => {
    wrap(
      <MediaUploader
        value={null}
        onChange={() => undefined}
        context={{ module: 'shop', purpose: 'main_image' }}
      />,
    );
    expect(screen.getByText('Cargar archivo')).toBeInTheDocument();
    expect(screen.getByText(/Máximo 2 MB/)).toBeInTheDocument();
  });

  it('cambia a modo URL externa', () => {
    wrap(
      <MediaUploader
        value={null}
        onChange={() => undefined}
        context={{ module: 'bonuses', purpose: 'thumbnail' }}
      />,
    );
    fireEvent.click(screen.getByText('Usar URL externa'));
    expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument();
  });

  it('detecta valor legacy externo', () => {
    const value: MediaValue = {
      url: 'https://images.example.com/pic.png',
      source: 'external',
    };
    wrap(
      <MediaUploader value={value} onChange={() => undefined} context={{ module: 'shop', purpose: 'main_image' }} />,
    );
    expect(screen.getByDisplayValue('https://images.example.com/pic.png')).toBeInTheDocument();
  });

  it('rechaza archivo demasiado grande', async () => {
    const onChange = vi.fn();
    wrap(
      <MediaUploader
        value={null}
        onChange={onChange}
        context={{ module: 'bonuses', purpose: 'thumbnail' }}
        maxSizeKB={1}
      />,
    );

    const big = new File([new Uint8Array(2048)], 'big.png', { type: 'image/png' });
    Object.defineProperty(big, 'size', { value: 2048 });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [big] } });

    await waitFor(() => {
      expect(screen.getByText(/Máximo 1 KB/)).toBeInTheDocument();
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('abre file picker desde modo URL externa', () => {
    wrap(
      <MediaUploader
        value={{ url: 'https://images.example.com/pic.png', source: 'external' }}
        onChange={() => undefined}
        context={{ module: 'chests', purpose: 'main_image' }}
      />,
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');

    fireEvent.click(screen.getByText('Cargar archivo'));

    expect(clickSpy).toHaveBeenCalled();
  });
});
