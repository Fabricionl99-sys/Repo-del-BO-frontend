import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PlayerSearchResults } from './PlayerSearchResults';

const sample = {
  player_id: 'pl_mission',
  external_player_id: 'crypto_king_88',
  level: 14,
  coins: '2400',
  currency_code: 'main',
};

describe('PlayerSearchResults', () => {
  it('renders external_player_id, level and coins with readable text colors', () => {
    render(<PlayerSearchResults results={[sample]} onSelect={vi.fn()} />);

    expect(screen.getByText('crypto_king_88')).toHaveClass('text-text-primary');
    expect(screen.getByText(/Nivel 14/)).toHaveClass('text-text-secondary');
    expect(screen.getByText('pl_mission')).toHaveClass('text-text-tertiary');
  });

  it('calls onSelect with normalized player when a result is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<PlayerSearchResults results={[sample]} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /crypto_king_88/i }));

    expect(onSelect).toHaveBeenCalledWith(sample);
  });
});
