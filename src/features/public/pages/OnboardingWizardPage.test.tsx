import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, beforeEach } from 'vitest';

import { useSignupStore } from '@/stores/signupStore';

import OnboardingWizardPage from './OnboardingWizardPage';

beforeEach(() => {
  useSignupStore.setState({ onboardingToken: 'onb_test', onboardingComplete: false });
});

function wrap() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>
        <OnboardingWizardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('OnboardingWizardPage', () => {
  it('carga paso 1 datos legales', async () => {
    wrap();
    expect(await screen.findByRole('heading', { name: /Datos legales/i })).toBeInTheDocument();
  });

  it('persiste progreso al avanzar paso', async () => {
    const user = userEvent.setup();
    wrap();
    await screen.findByRole('heading', { name: /Datos legales/i });
    await user.type(screen.getByPlaceholderText('Razón social'), 'Test S.A.');
    await user.type(screen.getByPlaceholderText(/CUIT/i), '30-71234567-8');
    await user.type(screen.getByPlaceholderText('Dirección física'), 'Calle 123');
    await user.type(screen.getByPlaceholderText('Ciudad'), 'Buenos Aires');
    await user.click(screen.getByRole('button', { name: /Continuar/i }));
    await waitFor(() => expect(screen.getByText(/Tu plataforma iGaming/i)).toBeInTheDocument());
  });
});
