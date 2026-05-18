import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import LandingPage from './LandingPage';

describe('LandingPage', () => {
  it('renderiza hero y CTAs', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /Gamificación \+ CRM para iGaming/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Empezar gratis 14 días/i }).length).toBeGreaterThan(0);
    expect(screen.getByText('Por qué Social2Game')).toBeInTheDocument();
    expect(screen.getByText('Módulos incluidos')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });
});
