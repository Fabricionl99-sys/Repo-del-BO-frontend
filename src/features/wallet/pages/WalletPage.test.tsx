import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';
import WalletPage from './WalletPage';

function wrap(route = '/wallet') {
  cleanup();
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <WalletPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('Mi Wallet', () => {
  it('muestra saldo y transacciones', async () => {
    wrap();
    expect(await screen.findByText('Mi Wallet')).toBeInTheDocument();
    expect(await screen.findByText('Saldo disponible')).toBeInTheDocument();
    expect(await screen.findByText('Recargar saldo')).toBeInTheDocument();
    expect(await screen.findByText('Recarga inicial')).toBeInTheDocument();
  });

  it('tab cripto genera dirección de depósito', async () => {
    const user = userEvent.setup();
    wrap('/wallet?tab=crypto');
    expect(await screen.findByText('Recarga con cripto')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /generar dirección/i }));
    expect(await screen.findByText(/esperando pago|confirmando/i)).toBeInTheDocument();
    expect(screen.getByAltText('QR depósito')).toBeInTheDocument();
  });

  it('tab recargas lista historial cripto', async () => {
    wrap('/wallet?tab=topups');
    expect(await screen.findByText('Historial de recargas cripto')).toBeInTheDocument();
    expect(await screen.findByText('USDT')).toBeInTheDocument();
  });

  it('manual mode muestra mensaje Social2Game', async () => {
    server.use(
      http.get('*/admin/wallet/balance', () =>
        HttpResponse.json({
          data: {
            wallet_balance_usd: 0,
            wallet_low_balance_threshold_usd: 500,
            billing_mode: 'manual',
            status: 'active',
          },
        }),
      ),
    );
    wrap();
    expect(await screen.findByText('Facturación gestionada por Social2Game')).toBeInTheDocument();
  });
});
