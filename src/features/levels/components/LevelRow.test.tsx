import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LevelRow } from './LevelRow';
import type { LevelEntry } from '@/types/levels';

const baseRow: LevelEntry = {
  level: 9,
  xpRequired: 250000,
  milestoneEnabled: false,
  milestoneUnlock: null,
};

describe('LevelRow XP input', () => {
  it('reemplaza valor al pegar, sin concatenar', () => {
    const onChange = vi.fn();
    cleanup();
    render(
      <table>
        <tbody>
          <LevelRow
            displayLevel={9}
            row={baseRow}
            prevXp={20000}
            canDelete
            onChange={onChange}
            onDelete={() => undefined}
            onPickBadge={async () => 'https://example.com/badge.png'}
          />
        </tbody>
      </table>,
    );

    const input = screen.getByLabelText('XP nivel 9') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '999999999' } });

    expect(onChange).toHaveBeenCalledWith({
      ...baseRow,
      xpRequired: 999999999,
    });
    expect(String(onChange.mock.calls[0][0].xpRequired)).not.toContain('250000999');
  });

  it('no muestra error cuando XP string es mayor que el anterior', () => {
    cleanup();
    render(
      <table>
        <tbody>
          <LevelRow
            displayLevel={8}
            row={{ ...baseRow, level: 8, xpRequired: '10000' as unknown as number }}
            prevXp={'5000' as unknown as number}
            canDelete
            onChange={() => undefined}
            onDelete={() => undefined}
            onPickBadge={async () => 'https://example.com/badge.png'}
          />
        </tbody>
      </table>,
    );

    expect(screen.queryByText('Debe ser mayor que el nivel anterior')).not.toBeInTheDocument();
  });
});
