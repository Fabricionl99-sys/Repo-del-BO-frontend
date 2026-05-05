import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import FeedPlaceholderPage from './FeedPlaceholderPage';
describe('Feed placeholder',()=>{it('comunica roadmap y CTAs',()=>{render(<MemoryRouter><FeedPlaceholderPage/></MemoryRouter>);expect(screen.getAllByText('Feed Social').length).toBeGreaterThan(0);expect(screen.getByText(/Etapa 9/)).toBeInTheDocument();expect(screen.getByText('Predicciones')).toBeInTheDocument();expect(screen.getByText('Torneos')).toBeInTheDocument();})});
