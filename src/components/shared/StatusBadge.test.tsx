import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { resolveCatalogStatus } from './catalogStatus';
import { StatusBadge } from './StatusBadge';

describe('resolveCatalogStatus', () => {
  it('prioriza archivado sobre activo', () => {
    expect(resolveCatalogStatus({ is_active: true, archived_at: '2024-01-01', status: 'active' })).toBe(
      'archived',
    );
    expect(resolveCatalogStatus({ is_active: true, status: 'archived' })).toBe('archived');
    expect(resolveCatalogStatus({ is_active: true, status: 'cancelled' })).toBe('archived');
  });

  it('distingue activo e inactivo', () => {
    expect(resolveCatalogStatus({ is_active: true })).toBe('active');
    expect(resolveCatalogStatus({ is_active: false })).toBe('inactive');
  });
});

describe('StatusBadge', () => {
  it('muestra labels distintos para activo e inactivo', () => {
    const { rerender } = render(<StatusBadge status="active" />);
    expect(screen.getByText('Activo')).toBeInTheDocument();

    rerender(<StatusBadge status="inactive" />);
    expect(screen.getByText('Inactivo')).toBeInTheDocument();

    rerender(<StatusBadge status="archived" />);
    expect(screen.getByText('Archivado')).toBeInTheDocument();
  });

  it('dispara onActivate al click en inactivo', () => {
    const onActivate = vi.fn();
    render(<StatusBadge status="inactive" onActivate={onActivate} />);
    fireEvent.click(screen.getByRole('button', { name: /inactivo/i }));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('no activa desde badge activo', () => {
    const onActivate = vi.fn();
    render(<StatusBadge status="active" onActivate={onActivate} />);
    fireEvent.click(screen.getByText('Activo'));
    expect(onActivate).not.toHaveBeenCalled();
  });
});
