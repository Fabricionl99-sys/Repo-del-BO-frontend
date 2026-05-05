import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/server';
import type { RuleListItem, XPRule } from '@/types/rules';
import RulesListPage from './RulesListPage';
import RuleEditorPage from './RuleEditorPage';

function wrap(ui: React.ReactNode, route = '/reglas-xp') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {ui}
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Tier2 reglas', () => {
  it('lista reglas con filtros, acciones y badge de boost activo', async () => {
    wrap(<RulesListPage />);

    expect(await screen.findByText('Apuesta deportiva ganadora')).toBeInTheDocument();
    expect(screen.getByText('x1,5 activo')).toBeInTheDocument();

    fireEvent.click(screen.getByText('pausadas'));
    expect(await screen.findByText('Promo finde Champions League')).toBeInTheDocument();
    fireEvent.click(screen.getAllByTitle('duplicar')[0]);
  });

  it('lista muestra empty forzado', () => {
    wrap(<RulesListPage />, '/reglas-xp?mockState=empty');
    expect(screen.getByText('Todavía no tenés reglas')).toBeInTheDocument();
  });

  it('editor permite agregar condición y cambiar monedas', async () => {
    wrap(
      <Routes>
        <Route path="/reglas-xp/:id" element={<RuleEditorPage />} />
      </Routes>,
      '/reglas-xp/rule_sports_win',
    );

    expect(await screen.findByText('¿qué evento dispara esta regla?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('agregar condición'));
    expect(screen.getAllByTitle('eliminar').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Activar'));
  });

  it('editor permite activar boost, configurar fechas y persistir badge', async () => {
    const createdRules: XPRule[] = [];
    server.use(
      http.post('*/admin/xp-rules', async ({ request }) => {
        const body = (await request.json()) as Partial<XPRule>;
        const rule = {
          id: 'rule_boost_test',
          name: body.name ?? 'Regla boost test',
          description: body.description ?? '',
          status: body.status ?? 'active',
        category: body.trigger?.category ?? 'deportes',
        trigger: body.trigger ?? { event: 'bet_placed', category: 'deportes' },
          conditionsLogic: body.conditionsLogic ?? 'all',
          conditions: body.conditions ?? [],
          action: body.action ?? { xpBase: 50 },
          boost: body.boost,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: { name: 'Test', initials: 'TT' },
        } as XPRule;
        createdRules.unshift(rule);
        return HttpResponse.json(rule, { status: 201 });
      }),
      http.get('*/admin/xp-rules', () =>
        HttpResponse.json(
          createdRules.map(
            (rule): RuleListItem => ({
              id: rule.id,
              name: rule.name,
              description: rule.description,
              category: rule.category,
              xpDisplay: { value: `+${rule.action.xpBase}`, perUnit: 'único' },
              status: rule.status,
              updatedAt: rule.updatedAt,
              active: rule.status === 'active',
              boost: rule.boost,
            }),
          ),
        ),
      ),
    );

    wrap(
      <Routes>
        <Route path="/reglas-xp" element={<RulesListPage />} />
        <Route path="/reglas-xp/nueva" element={<RuleEditorPage />} />
      </Routes>,
      '/reglas-xp/nueva',
    );

    expect(await screen.findByText('multiplicar XP por tiempo limitado')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'activar boost temporal' }));
    fireEvent.click(screen.getByText('1.5x'));
    fireEvent.change(screen.getByLabelText('nombre'), { target: { value: 'Regla boost test' } });
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2000-01-01T00:00' } });
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: '2099-05-11T23:59' } });
    fireEvent.click(screen.getByText('Activar'));

    await waitFor(() => expect(screen.queryByText('Cargando reglas...')).not.toBeInTheDocument());
    expect(await screen.findByText('Regla boost test')).toBeInTheDocument();
    const row = screen.getByText('Regla boost test').closest('tr');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByText('x1,5 activo')).toBeInTheDocument();
  });
});
