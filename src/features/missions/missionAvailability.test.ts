import { describe, expect, it } from 'vitest';

import {
  availabilityWindowToIso,
  dateTimePartsToIso,
  isoToAvailabilityWindow,
  validateAvailabilityWindow,
} from '@/features/missions/missionAvailability';

describe('missionAvailability', () => {
  it('convierte date+time local a ISO UTC', () => {
    const iso = dateTimePartsToIso('2026-06-01', '12:30');
    expect(iso).toMatch(/^2026-06-01T/);
    expect(iso).toMatch(/Z$/);
  });

  it('devuelve null si la fecha está vacía', () => {
    expect(dateTimePartsToIso('', '12:00')).toBeNull();
  });

  it('usa fin de día por default para until sin hora', () => {
    const iso = dateTimePartsToIso('2026-06-30', '', { endOfDayDefault: true });
    expect(iso).toBeTruthy();
    const d = new Date(iso!);
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(59);
  });

  it('valida from < until', () => {
    expect(
      validateAvailabilityWindow({
        from_date: '2026-06-10',
        from_time: '',
        until_date: '2026-06-01',
        until_time: '',
      }),
    ).toMatch(/anterior/);
  });

  it('restaura ISO desde backend', () => {
    const window = isoToAvailabilityWindow('2026-06-01T00:00:00.000Z', null);
    expect(window.from_date).toBeTruthy();
    expect(window.until_date).toBe('');
  });
});

describe('form availability payload', () => {
  it('mapea ventana a available_from/until o null', () => {
    const empty = availabilityWindowToIso({
      from_date: '',
      from_time: '',
      until_date: '',
      until_time: '',
    });
    expect(empty.available_from).toBeNull();
    expect(empty.available_until).toBeNull();

    const filled = availabilityWindowToIso({
      from_date: '2026-06-01',
      from_time: '00:00',
      until_date: '2026-06-30',
      until_time: '23:59',
    });
    expect(filled.available_from).toMatch(/Z$/);
    expect(filled.available_until).toMatch(/Z$/);
  });
});
