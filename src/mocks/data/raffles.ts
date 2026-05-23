import type { RaffleDetail, RaffleRow, RaffleWinnerRow } from '@/types/raffles';

const iso = (daysAgo = 0) => new Date(Date.now() - daysAgo * 86400000).toISOString();
const future = (daysAhead = 7) => new Date(Date.now() + daysAhead * 86400000).toISOString();

const tenant = '6b67e761-b833-402b-8d59-81c478ac782b';
const currencyGema = '11111111-1111-4111-8111-111111111111';

export const mockRaffles: RaffleDetail[] = [
  {
    id: 'raffle-001',
    tenant_id: tenant,
    code: 'sorteo_gopro',
    name: 'Sorteo GoPro Hero 12',
    description: 'Participá con gemas y ganá una cámara deportiva.',
    image_url: null,
    entry_cost_currency_id: currencyGema,
    entry_cost_amount: 1,
    max_entries_per_player: 50,
    winner_count: 1,
    one_prize_per_player: true,
    min_level: 0,
    vip_only: false,
    status: 'open',
    starts_at: iso(1),
    deadline: future(5),
    drawn_at: null,
    total_entries: 1250,
    server_seed_commitment: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    server_seed_revealed: null,
    cancelled_at: null,
    cancellation_reason: null,
    created_at: iso(2),
    updated_at: iso(0),
    prizes: [
      {
        id: 'prize-001',
        raffle_id: 'raffle-001',
        tenant_id: tenant,
        position: 1,
        prize_type: 'physical',
        prize_bonus_id: null,
        prize_physical_name: 'GoPro Hero 12',
        prize_physical_image_url: null,
        prize_physical_value_usd: 399,
        prize_physical_notes: 'Color negro',
        created_at: iso(2),
      },
    ],
  },
  {
    id: 'raffle-002',
    tenant_id: tenant,
    code: 'bonus_semanal',
    name: 'Bonus semanal',
    description: 'Premio bono automático.',
    image_url: null,
    entry_cost_currency_id: currencyGema,
    entry_cost_amount: 2,
    max_entries_per_player: 0,
    winner_count: 1,
    one_prize_per_player: true,
    min_level: 1,
    vip_only: false,
    status: 'draft',
    starts_at: future(1),
    deadline: future(14),
    drawn_at: null,
    total_entries: 0,
    server_seed_commitment: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
    server_seed_revealed: null,
    cancelled_at: null,
    cancellation_reason: null,
    created_at: iso(0),
    updated_at: iso(0),
    prizes: [
      {
        id: 'prize-002',
        raffle_id: 'raffle-002',
        tenant_id: tenant,
        position: 1,
        prize_type: 'bonus',
        prize_bonus_id: 'bonus-demo-001',
        prize_physical_name: null,
        prize_physical_image_url: null,
        prize_physical_value_usd: null,
        prize_physical_notes: null,
        created_at: iso(0),
      },
    ],
  },
];

export const mockRaffleWinners: RaffleWinnerRow[] = [
  {
    id: 'winner-001',
    raffle_id: 'raffle-001',
    tenant_id: tenant,
    raffle_prize_id: 'prize-001',
    player_state_id: 'ps-demo-001',
    player_external_id: 'DEMO_PLAYER_42',
    entry_id: 'entry-001',
    winning_ticket_number: 742,
    position: 1,
    prize_type: 'physical',
    prize_physical_name: 'GoPro Hero 12',
    notified_at: iso(0),
    pending_reward_id: null,
    physical_delivered_at: null,
    physical_delivered_by: null,
    physical_delivery_notes: null,
    created_at: iso(0),
  },
];

export const mockPendingPhysical: RaffleWinnerRow[] = [
  {
    id: 'winner-pending-001',
    raffle_id: 'raffle-001',
    tenant_id: tenant,
    raffle_prize_id: 'prize-001',
    player_state_id: 'ps-demo-002',
    player_external_id: 'DEMO_PLAYER_99',
    entry_id: 'entry-002',
    winning_ticket_number: 891,
    position: 1,
    prize_type: 'physical',
    prize_physical_name: 'GoPro Hero 12',
    notified_at: iso(0),
    pending_reward_id: null,
    physical_delivered_at: null,
    physical_delivered_by: null,
    physical_delivery_notes: null,
    created_at: iso(0),
    raffle_name: 'Sorteo GoPro Hero 12',
  },
];

export function findRaffleByCode(code: string): RaffleDetail | undefined {
  return mockRaffles.find((r) => r.code === code);
}

export function listRaffleRows(): RaffleRow[] {
  return mockRaffles.map(({ prizes: _p, ...row }) => row);
}
