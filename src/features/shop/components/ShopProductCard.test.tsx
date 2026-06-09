import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ShopProduct } from '@/types/shop';

import { ShopProductCard } from './ShopProductCard';

const activeProduct: ShopProduct = {
  id: 'shop_active',
  code: 'active_prod',
  name: 'Producto activo',
  description: 'Visible en tienda',
  image_url: null,
  cost_in_coins: 100,
  currency_code: 'main',
  stock: 10,
  reward_type: 'coins',
  reward_config: { bonus_id: 'x' },
  min_level: null,
  vip_only: false,
  max_per_player: null,
  valid_from: null,
  valid_until: null,
  is_active: true,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const inactiveProduct: ShopProduct = {
  ...activeProduct,
  id: 'shop_inactive',
  code: 'inactive_prod',
  name: 'Producto inactivo',
  is_active: false,
};

describe('ShopProductCard', () => {
  it('muestra badges distintos para activo e inactivo', () => {
    const { rerender } = render(<ShopProductCard product={activeProduct} onEdit={vi.fn()} />);
    expect(screen.getByText('Activo')).toBeInTheDocument();

    rerender(<ShopProductCard product={inactiveProduct} onEdit={vi.fn()} />);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();
  });

  it('activa producto inactivo al click en badge', () => {
    const onActivate = vi.fn();
    render(<ShopProductCard product={inactiveProduct} onEdit={vi.fn()} onActivate={onActivate} />);
    fireEvent.click(screen.getByRole('button', { name: /inactivo/i }));
    expect(onActivate).toHaveBeenCalled();
  });
});
