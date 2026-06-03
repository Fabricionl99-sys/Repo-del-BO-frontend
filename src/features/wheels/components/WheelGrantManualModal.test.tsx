import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { WheelGrantManualModal } from '@/features/wheels/components/WheelGrantManualModal';

function wrap(props: Partial<ComponentProps<typeof WheelGrantManualModal>> = {}) {
  cleanup();
  const onClose = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <WheelGrantManualModal
        open
        wheel={{ code: 'DAILY', name: 'Rueda Daily' }}
        onClose={onClose}
        {...props}
      />
    </QueryClientProvider>,
  );
  return { onClose };
}

describe('WheelGrantManualModal', () => {
  it('selects a player from PlayerSearchPicker', async () => {
    const user = userEvent.setup();
    wrap();

    const search = screen.getByRole('textbox', { name: 'Buscar jugador' });
    await user.type(search, 'crypto');

    const result = await screen.findByRole('button', { name: /crypto_king_88/i });
    await user.click(result);

    await waitFor(() => {
      const idField = screen.getByDisplayValue('pl_mission');
      expect(idField).toBeInTheDocument();
    });
  });
});
