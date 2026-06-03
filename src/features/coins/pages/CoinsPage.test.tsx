import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { globalCurrencyCatalog, resetOperatorActiveCurrencies } from '@/mocks/data/currencyCatalog';

import CoinsPage from './CoinsPage';

function wrap(route = '/monedas') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <CoinsPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

function cardForCurrency(code: string) {
  const heading = screen.getByRole('heading', { name: new RegExp(`^${code} —`) });
  return heading.closest('.card') as HTMLElement;
}

describe('Configuración de Monedas', () => {
  beforeEach(() => {
    resetOperatorActiveCurrencies();
  });

  it('abre con Tab Reales seleccionada', async () => {
    wrap();
    expect(await screen.findByRole('tab', { name: 'Monedas Reales', selected: true })).toBeInTheDocument();
    expect(
      await screen.findByText(/Activá las monedas que usás en tu casino/i),
    ).toBeInTheDocument();
  });

  it('lista las 33 del catálogo y permite filtrar', async () => {
    wrap();
    await screen.findByText('USD — US Dollar');
    expect(globalCurrencyCatalog).toHaveLength(33);
    for (const item of ['USD — US Dollar', 'CLP — Chilean Peso', 'USDT — Tether USD']) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole('button', { name: 'Stablecoin' }));
    await waitFor(() => {
      expect(screen.queryByText('USD — US Dollar')).not.toBeInTheDocument();
      expect(screen.getByText('USDT — Tether USD')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Todas' }));
    fireEvent.change(screen.getByPlaceholderText('Buscar por código o nombre...'), { target: { value: 'chile' } });
    await waitFor(() => {
      expect(screen.getByText('CLP — Chilean Peso')).toBeInTheDocument();
      expect(screen.queryByText('USDT — Tether USD')).not.toBeInTheDocument();
    });
  });

  it('activar USD muestra XP por unidad editable', async () => {
    wrap();
    await screen.findByText('USD — US Dollar');
    const usdCard = cardForCurrency('USD');
    fireEvent.click(within(usdCard).getByRole('button', { name: 'Activar' }));

    await waitFor(() => {
      expect(within(usdCard).getByLabelText(/XP por unidad/i)).toBeInTheDocument();
    });
    const xpInput = within(usdCard).getByRole('spinbutton');
    fireEvent.change(xpInput, { target: { value: '0.25' } });
    fireEvent.blur(xpInput);
    await waitFor(() => {
      expect(xpInput).toHaveValue(0.25);
    });
  });

  it('set default USD muestra badge DEFAULT', async () => {
    wrap();
    await screen.findByText('USD — US Dollar');
    const usdCard = cardForCurrency('USD');
    fireEvent.click(within(usdCard).getByRole('button', { name: 'Activar' }));
    await waitFor(() => {
      expect(within(usdCard).getByRole('button', { name: 'Set Default' })).toBeInTheDocument();
    });
    fireEvent.click(within(usdCard).getByRole('button', { name: 'Set Default' }));
    await waitFor(() => {
      expect(within(usdCard).getByText('DEFAULT')).toBeInTheDocument();
    });
  });

  it('no permite desactivar la moneda default', async () => {
    wrap();
    await screen.findByText('CLP — Chilean Peso');
    const clpCard = cardForCurrency('CLP');
    const deactivateBtn = within(clpCard).getByRole('button', { name: 'Desactivar' });
    expect(deactivateBtn).toBeDisabled();
    expect(deactivateBtn).toHaveAttribute('title', 'Cambiá el default primero');
  });

  it('cambiar default a CLP permite desactivar USD', async () => {
    wrap();
    await screen.findByText('USD — US Dollar');

    const usdCard = cardForCurrency('USD');
    fireEvent.click(within(usdCard).getByRole('button', { name: 'Activar' }));
    await waitFor(() => {
      expect(within(usdCard).getByRole('button', { name: 'Set Default' })).toBeInTheDocument();
    });
    fireEvent.click(within(usdCard).getByRole('button', { name: 'Set Default' }));
    await waitFor(() => {
      expect(within(usdCard).getByText('DEFAULT')).toBeInTheDocument();
    });

    const clpCard = cardForCurrency('CLP');
    fireEvent.click(within(clpCard).getByRole('button', { name: 'Set Default' }));

    await waitFor(() => {
      expect(within(usdCard).queryByText('DEFAULT')).not.toBeInTheDocument();
      expect(within(usdCard).getByRole('button', { name: 'Desactivar' })).not.toBeDisabled();
    });
  });

  it('tab Virtuales muestra RD y monedas legacy intactas', async () => {
    wrap();
    await screen.findByText('USD — US Dollar');
    fireEvent.click(screen.getByRole('tab', { name: 'Monedas Virtuales del Juego' }));

    expect(await screen.findByText('Peso Dominicano Demo')).toBeInTheDocument();
    expect(screen.getAllByText('RD').length).toBeGreaterThan(0);
    expect(screen.getByText('Monedas oro')).toBeInTheDocument();
    expect(screen.getAllByText('GLD').length).toBeGreaterThan(0);
  });

  it('empty forzado solo en tab virtuales', async () => {
    wrap('/monedas?mockState=empty');
    await screen.findByText('USD — US Dollar');
    fireEvent.click(screen.getByRole('tab', { name: 'Monedas Virtuales del Juego' }));
    expect(await screen.findByText('No hay monedas virtuales')).toBeInTheDocument();
  });
});

describe('Monedas virtuales — editor', () => {
  beforeEach(() => {
    resetOperatorActiveCurrencies();
  });

  it('abre editor desde tab virtuales', async () => {
    wrap();
    await screen.findByText('USD — US Dollar');
    fireEvent.click(screen.getByRole('tab', { name: 'Monedas Virtuales del Juego' }));
    await screen.findByText('Monedas oro');
    fireEvent.click(screen.getByRole('button', { name: 'Nueva Moneda Virtual' }));
    expect(screen.getByText('Nueva moneda')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Ruby, Esmeralda…'), { target: { value: 'Estrellas VIP' } });
    fireEvent.click(screen.getByText('Crear moneda'));
    expect(await screen.findByText('Estrellas VIP', {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
