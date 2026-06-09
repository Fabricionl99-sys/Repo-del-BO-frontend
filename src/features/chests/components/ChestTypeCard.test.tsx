import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { ChestType } from '@/types/chests';

import { ChestTypeCard } from './ChestTypeCard';

const baseType: ChestType = {
  id: 'ch_test',
  code: 'test',
  name: 'Cofre Test',
  description: 'Descripción',
  image_url: '',
  color_theme: '#CD7F32',
  visual_style: 'neon',
  is_active: true,
  archived_at: null,
  default_expiration_hours: 72,
  has_pity_system: false,
  pity_threshold: null,
  pity_guaranteed_prize_id: null,
  prizes: [
    {
      id: 'p1',
      reward_type: 'coins',
      reward_config: { amount: 10, currency_code: 'main' },
      probability_percent: 100,
      image_url: '',
      name: '10 monedas',
      is_rare: false,
    },
  ],
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('ChestTypeCard', () => {
  it('muestra conteo de premios', () => {
    render(<ChestTypeCard type={baseType} onEdit={vi.fn()} />);
    expect(screen.getByText('1 premios')).toBeInTheDocument();
  });

  it('no rompe si prizes viene undefined del API', () => {
    const broken = { ...baseType, prizes: undefined as unknown as ChestType['prizes'] };
    render(<ChestTypeCard type={broken} onEdit={vi.fn()} />);
    expect(screen.getByText('0 premios')).toBeInTheDocument();
  });

  it('dispara onEdit', () => {
    const onEdit = vi.fn();
    render(<ChestTypeCard type={baseType} onEdit={onEdit} />);
    fireEvent.click(screen.getByText('editar'));
    expect(onEdit).toHaveBeenCalled();
  });

  it('muestra badge de estado activo', () => {
    render(<ChestTypeCard type={baseType} onEdit={vi.fn()} />);
    expect(screen.getByText('Activo')).toBeInTheDocument();
  });
});
