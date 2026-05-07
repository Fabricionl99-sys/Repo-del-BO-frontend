import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategorySelector } from './CategorySelector';

describe('CategorySelector', () => {
  it('filtra categorías activas sin granulares ni conflictos', () => {
    const fn = vi.fn();
    render(<CategorySelector value="casino" onChange={fn} enabledCategories={['casino', 'deportes']} />);
    expect(screen.queryByText(/Conflicto/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Slot solo/)).not.toBeInTheDocument();
    const combo = screen.getByRole('combobox');
    expect(combo).toHaveValue('casino');
    fireEvent.change(combo, { target: { value: 'deportes' } });
    expect(fn).toHaveBeenCalledWith('deportes');
  });
});
