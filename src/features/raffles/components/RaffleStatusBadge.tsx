import type { RaffleStatus } from '@/types/raffles';

const labels: Record<RaffleStatus, string> = {
  draft: 'borrador',
  open: 'abierto',
  drawing: 'sorteando',
  closed: 'cerrado',
  cancelled: 'cancelado',
};

const colors: Record<RaffleStatus, string> = {
  draft: 'bg-bg-tertiary text-text-secondary',
  open: 'bg-success/15 text-success',
  drawing: 'bg-warning/15 text-warning',
  closed: 'bg-info/15 text-info',
  cancelled: 'bg-danger/15 text-danger',
};

export function RaffleStatusBadge({ status }: { status: RaffleStatus }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colors[status]}`}>{labels[status]}</span>;
}
