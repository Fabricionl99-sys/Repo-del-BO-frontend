import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { EventFormModal } from './EventFormModal';

vi.mock('@/features/predictions/predictionsApi', () => ({
  useAddPredictionEvent: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdatePredictionEvent: () => ({ mutateAsync: vi.fn(), isPending: false }),
  buildEventPayload: vi.fn(),
}));

describe('EventFormModal', () => {
  it('usa la clase field en inputs para legibilidad en tema oscuro', () => {
    render(
      <EventFormModal
        open
        programCode="champions-w3"
        closesAt="2026-06-01T18:00:00.000Z"
        event={null}
        onClose={() => undefined}
      />,
    );

    expect(screen.getByPlaceholderText('Ej. Argentina vs Brasil')).toHaveClass('field');
    expect(screen.getByDisplayValue(/2026/)).toHaveClass('field');
    fireEvent.click(screen.getByText('Agregar opción'));
    expect(screen.getAllByPlaceholderText(/Opción \d/)).toHaveLength(3);
    screen.getAllByPlaceholderText(/Opción \d/).forEach((input) => {
      expect(input).toHaveClass('field');
    });
  });
});
