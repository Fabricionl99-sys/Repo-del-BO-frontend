import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategorySelector } from './CategorySelector';
describe('CategorySelector',()=>{it('filtra categorías activas y muestra conflicto granular',()=>{const fn=vi.fn(); render(<CategorySelector value="slot_only" onChange={fn} enabledCategories={['casino','slot_only']} existingRules={[{id:'r1',name:'Casino genérico',description:'',status:'active',category:'casino'} as never]}/>);expect(screen.getByText(/Conflicto de categorías/)).toBeInTheDocument();expect(screen.getAllByText(/Casino/).length).toBeGreaterThan(0);fireEvent.change(screen.getByRole('combobox'),{target:{value:'casino'}});expect(fn).toHaveBeenCalledWith('casino')})});
