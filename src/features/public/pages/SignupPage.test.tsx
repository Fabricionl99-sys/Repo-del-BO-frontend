import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import EmailSentPage from './EmailSentPage';
import SignupPage from './SignupPage';

function wrap() {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup/email-sent" element={<EmailSentPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SignupPage', () => {
  it('renderiza formulario de registro', () => {
    wrap();
    expect(screen.getByRole('heading', { name: /Crea tu cuenta gratis/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Crear cuenta gratis/i })).toBeInTheDocument();
  });

  it('flujo signup muestra pantalla de email enviado', async () => {
    const user = userEvent.setup();
    wrap();
    const inputs = screen.getAllByRole('textbox');
    const passwords = document.querySelectorAll<HTMLInputElement>('input[type="password"]');
    await user.type(inputs[0], 'nuevo@operador.com');
    await user.type(passwords[0], 'Wingoat123');
    await user.type(passwords[1], 'Wingoat123');
    await user.type(inputs[1], 'Nuevo Casino');
    await user.selectOptions(screen.getByRole('combobox'), 'AR');
    await user.click(screen.getByRole('checkbox', { name: /Acepto términos/i }));
    await user.click(screen.getByRole('button', { name: /Crear cuenta gratis/i }));
    await waitFor(() => expect(screen.getByText(/Te enviamos un email/i)).toBeInTheDocument());
  });
});
