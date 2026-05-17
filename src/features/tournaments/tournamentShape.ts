import { asArray } from '@/lib/asArray';
import type { Tournament } from '@/types/tournaments';

export function normalizeTournament(tournament: Tournament): Tournament {
  return {
    ...tournament,
    prizes: asArray(tournament.prizes),
  };
}

export function normalizeTournaments(tournaments: Tournament[]): Tournament[] {
  return tournaments.map(normalizeTournament);
}
