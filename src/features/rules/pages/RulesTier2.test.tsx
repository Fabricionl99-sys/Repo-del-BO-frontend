import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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
  it('lista reglas con filtros, acciones y columna boost', async () => {
    wrap(<RulesListPage />);

    expect(await screen.findByText('Apuesta deportiva ganadora')).toBeInTheDocument();
    expect(screen.getByText('boost')).toBeInTheDocument();
    expect(screen.getByText('1,5x ACTIVO')).toBeInTheDocument();
    expect(screen.queryByText('Importar')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('pausadas'));
    expect(await screen.findByText('Promo finde Champions League')).toBeInTheDocument();
    fireEvent.click(screen.getAllByTitle('copiar')[0]);
  });

  it('lista muestra empty forzado', () => {
    wrap(<RulesListPage />, '/reglas-xp?mockState=empty');
    expect(screen.getByText('Todavía no tenés reglas')).toBeInTheDocument();
  });

  it('editor muestra USD por XP y permite guardar', async () => {
    wrap(
      <Routes>
        <Route path="/reglas-xp/:id" element={<RuleEditorPage />} />
      </Routes>,
      '/reglas-xp/rule_sports_win',
    );

    expect((await screen.findAllByText('Cuánto se apuesta para 1 XP')).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Guardar cambios'));
  });

  it('modal nueva regla activa boost y persiste', async () => {
    const createdRules: XPRule[] = [];
    server.use(
      http.post('*/admin/rules', async ({ request }) => {
        const body = (await request.json()) as Partial<XPRule>;
        const rule = {
          id: 'rule_boost_test',
          name: body.name ?? 'Apuestas · Deportes',
          description: body.description ?? '',
          status: body.status ?? 'active',
          category: body.category ?? 'deportes',
          usd_per_xp: body.usd_per_xp ?? 10,
          trigger: body.trigger ?? { event: 'bet_placed', category: 'deportes' },
          conditionsLogic: body.conditionsLogic ?? 'all',
          conditions: body.conditions ?? [],
          action: body.action ?? { xpBase: 1, xpPerAmount: { xp: 1, amount: 10, currency: 'USD' } },
          boost: body.boost,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: { name: 'Test', initials: 'TT' },
        } as XPRule;
        createdRules.unshift(rule);
        return HttpResponse.json({ data: rule }, { status: 201 });
      }),
      http.get('*/admin/rules', () =>
        HttpResponse.json({
          data: createdRules.map((rule) => ({
            id: rule.id,
            name: rule.name,
            description: rule.description,
            category_id: 1,
            category: rule.category,
            status: rule.status,
            is_active: true,
            currency: 'USD',
            xp_per_unit: String(rule.usd_per_xp ?? 10),
            unit_field: 'amount',
            boost: rule.boost ?? null,
            created_at: rule.createdAt,
            updated_at: rule.updatedAt,
          })),
        }),
      ),
    );

    wrap(
      <Routes>
        <Route path="/reglas-xp" element={<RulesListPage />} />
      </Routes>,
      '/reglas-xp',
    );

    fireEvent.click(screen.getByText('Nueva regla'));
    expect(await screen.findByRole('heading', { name: /Nueva regla XP/i })).toBeInTheDocument();
    expect(screen.getByText('Boost temporal')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'activar boost temporal' }));
    fireEvent.click(screen.getByText('1.5x'));
    const start = new Date();
    start.setMinutes(start.getMinutes() + 1);
    start.setSeconds(0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setHours(23, 59, 0, 0);
    const localDateTime = (d: Date) =>
      new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: localDateTime(start) } });
    fireEvent.change(screen.getByLabelText('Hasta'), { target: { value: localDateTime(end) } });
    fireEvent.click(screen.getByText('Guardar regla'));

    await waitFor(() => expect(screen.queryByRole('heading', { name: /Nueva regla XP/i })).not.toBeInTheDocument());
    expect(await screen.findByText('Apuestas · Deportes')).toBeInTheDocument();
  });
});
