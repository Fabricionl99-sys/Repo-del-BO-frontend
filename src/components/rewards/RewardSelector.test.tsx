import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { useOperatorStore } from '@/stores/operatorStore';
import type { RewardValue } from '@/types/rewards';

import { RewardSelector } from './RewardSelector';

function wrap(ui: React.ReactNode) {
  cleanup();
  useOperatorStore.setState({
    activeModuleCodes: ['chests', 'avatars', 'shop', 'missions'],
    billingMode: 'wallet',
  });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {ui}
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('RewardSelector', () => {
  it('muestra dropdown de bonos filtrados por tipo freespin', async () => {
    const onChange = vi.fn();
    const value: RewardValue = { reward_type: 'freespin', reward_config: {}, currency_mode: 'auto_usd' };
    wrap(<RewardSelector moduleKey="shop" value={value} onChange={onChange} />);
    expect(await screen.findByText(/Bono del catálogo/i)).toBeInTheDocument();
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      const bonusSelect = selects[selects.length - 1];
      expect(bonusSelect.querySelector('option[value="ob_fs_book_dead"]')).toBeTruthy();
    });
    const bonusSelect = screen.getAllByRole('combobox').at(-1)!;
    fireEvent.change(bonusSelect, { target: { value: 'ob_fs_book_dead' } });
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0] as RewardValue;
    expect(last.reward_config.bonus_id).toBe('ob_fs_book_dead');
  });

  it('muestra link a /bonos si no hay bonos del tipo', async () => {
    wrap(
      <RewardSelector
        moduleKey="shop"
        value={{ reward_type: 'freebet', reward_config: {} }}
        onChange={() => {}}
        operatorContext={{
          operator_bonuses: [],
          available_chests: [],
          available_wheels: [],
          available_avatars: [],
          available_coins: [{ id: '1', code: 'main', name: 'Main' }],
          active_currencies: ['USD'],
          activeModuleCodes: ['shop'],
        }}
      />,
    );
    expect(await screen.findByText(/Cargá tus bonos primero/i)).toBeInTheDocument();
  });

  it('muestra gating para ruleta si módulo inactivo', () => {
    useOperatorStore.setState({ activeModuleCodes: ['shop'], billingMode: 'wallet' });
    wrap(
      <RewardSelector
        moduleKey="missions"
        value={{ reward_type: 'coins', reward_config: { amount: 100, currency_code: 'main' } }}
        onChange={() => {}}
        availableRewardTypes={['coins', 'wheel_spin']}
        operatorContext={{
          operator_bonuses: [],
          available_chests: [],
          available_wheels: [],
          available_avatars: [],
          available_coins: [],
          active_currencies: ['USD'],
          activeModuleCodes: ['shop'],
        }}
      />,
    );
    expect(screen.getByText(/Activar módulo/i)).toBeInTheDocument();
  });
});
