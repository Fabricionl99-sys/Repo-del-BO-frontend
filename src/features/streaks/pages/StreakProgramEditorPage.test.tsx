import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import StreakProgramEditorPage from '@/features/streaks/pages/StreakProgramEditorPage';

function wrap(route: string) {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <Routes>
          <Route path="/rachas/nueva" element={<StreakProgramEditorPage />} />
          <Route path="/rachas/:id" element={<StreakProgramEditorPage />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('StreakProgramEditorPage', () => {
  it('crear: muestra formulario', () => {
    wrap('/rachas/nueva');
    expect(screen.getByText('Crear programa de racha')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej. Racha de login 7 días')).toBeInTheDocument();
  });

  it('editar: carga nombre del mock', async () => {
    wrap('/rachas/sp_login_weekly');
    expect(await screen.findByDisplayValue('Racha de login 7 días')).toBeInTheDocument();
  });
});
