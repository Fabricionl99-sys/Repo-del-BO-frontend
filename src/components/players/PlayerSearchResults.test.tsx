import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PlayerSearchResults } from './PlayerSearchResults';

describe('PlayerSearchResults', () => {
  it('renders player handle and id with readable text colors', () => {
    render(
      <PlayerSearchResults
        results={[{ player_id: 'uuid-1', player_handle: 'crypto_king_88' }]}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('option', { name: /crypto_king_88/i })).toBeInTheDocument();
    expect(screen.getByText('uuid-1')).toHaveClass('text-text-secondary');
    expect(screen.getByText('crypto_king_88')).toHaveClass('text-text-primary');
  });

  it('calls onSelect when a result is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const player = { player_id: 'uuid-2', player_handle: 'vip_roller' };

    render(<PlayerSearchResults results={[player]} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /vip_roller/i }));

    expect(onSelect).toHaveBeenCalledWith(player);
  });
});
