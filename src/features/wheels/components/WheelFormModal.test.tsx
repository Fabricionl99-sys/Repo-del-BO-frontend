import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { WheelFormModal } from '@/features/wheels/components/WheelFormModal';
import { useOperatorStore } from '@/stores/operatorStore';

function renderModal(wheelCode: string | null) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <WheelFormModal open wheelCode={wheelCode} existingCodes={[]} onClose={() => {}} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('WheelFormModal edit', () => {
  it('carga todos los premios del GET detail (8 en rueda daily mock)', async () => {
    useOperatorStore.setState({ activeModuleCodes: ['wheels'], billingMode: 'wallet' });
    renderModal('daily');
    await waitFor(() => {
      expect(screen.getByText('Editar rueda')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('25 monedas')).toBeInTheDocument();
      expect(screen.getByText('Jackpot diario')).toBeInTheDocument();
    });
    expect(screen.getByText('50 monedas')).toBeInTheDocument();
    expect(screen.getByText('100 XP')).toBeInTheDocument();
  });
});

describe('WheelFormModal create', () => {
  it('inicia sin premios default hardcoded', async () => {
    renderModal(null);
    expect(await screen.findByText('Nueva rueda')).toBeInTheDocument();
    expect(screen.getByText(/Agregá al menos 2 premios/)).toBeInTheDocument();
    expect(screen.queryByText('Premio 1')).not.toBeInTheDocument();
  });
});
