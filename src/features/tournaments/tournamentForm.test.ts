import { describe, expect, it } from 'vitest';

import {
  defaultTournamentForm,
  findPrizeOverlapInList,
  rangesOverlap,
  tournamentFormSchema,
} from './tournamentForm';

describe('rangesOverlap', () => {
  it('detecta superposición', () => {
    expect(rangesOverlap({ position_from: 1, position_to: 5 }, { position_from: 3, position_to: 10 })).toBe(true);
  });

  it('permite rangos adyacentes', () => {
    expect(rangesOverlap({ position_from: 1, position_to: 5 }, { position_from: 6, position_to: 10 })).toBe(false);
  });
});

describe('findPrizeOverlapInList', () => {
  it('encuentra overlap en lista de premios', () => {
    const prizes = defaultTournamentForm().prizes;
    const overlap = findPrizeOverlapInList([
      ...prizes,
      { ...prizes[0], position_from: 1, position_to: 3 },
    ]);
    expect(overlap).toBeDefined();
  });
});

describe('tournamentFormSchema', () => {
  it('rechaza sin activity_types', () => {
    const values = {
      ...defaultTournamentForm(),
      code: 'test_tourn',
      name: 'Test Torneo',
      activity_types: [] as [],
    };
    const result = tournamentFormSchema.safeParse(values);
    expect(result.success).toBe(false);
  });

  it('rechaza period inválido', () => {
    const values = {
      ...defaultTournamentForm(),
      code: 'test_tourn',
      name: 'Test Torneo',
      period_starts_at: '2026-05-20T12:00',
      period_ends_at: '2026-05-19T12:00',
    };
    const result = tournamentFormSchema.safeParse(values);
    expect(result.success).toBe(false);
  });

  it('acepta torneo válido', () => {
    const values = {
      ...defaultTournamentForm(),
      code: 'wagering_qa',
      name: 'Wagering QA',
    };
    const result = tournamentFormSchema.safeParse(values);
    expect(result.success).toBe(true);
  });
});
