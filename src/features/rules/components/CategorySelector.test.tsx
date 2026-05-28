import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategorySelector } from './CategorySelector';

const categories = [
  { id: 1, display_name: 'Deportes', code: 'deportes' },
  { id: 2, display_name: 'Casino', code: 'casino' },
];

describe('CategorySelector', () => {
  it('renderiza categorías del backend por id', () => {
    const fn = vi.fn();
    render(<CategorySelector value={2} onChange={fn} categories={categories} />);
    const combo = screen.getByRole('combobox');
    expect(combo).toHaveValue('2');
    fireEvent.change(combo, { target: { value: '1' } });
    expect(fn).toHaveBeenCalledWith(1);
  });
});
