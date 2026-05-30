import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Coin } from '@/types/coins';
import { CurrencyIcon } from './CurrencyIcon';

const baseCoin: Coin = {
  id: '1',
  name: 'Rutsa',
  symbol: 'RUTSA',
  deliveryMode: 'auto_xp',
  caps: {},
  p2p: { enabled: false },
  isDefault: false,
  active: true,
  totalInCirculation: 0,
  emittedThisWeek: 0,
  redeemedThisWeek: 0,
};

describe('CurrencyIcon', () => {
  it('renderiza imagen cuando hay icon_url HTTPS válido', () => {
    render(
      <CurrencyIcon
        coin={{
          ...baseCoin,
          imageUrl: 'https://cdn.social2game.com/currencies/rutsa.png',
        }}
      />,
    );
    const img = screen.getByRole('img', { name: 'Rutsa' });
    expect(img).toHaveAttribute('src', 'https://cdn.social2game.com/currencies/rutsa.png');
  });

  it('muestra iniciales si no hay icon_url', () => {
    render(<CurrencyIcon coin={baseCoin} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText('RU')).toBeInTheDocument();
  });
});
