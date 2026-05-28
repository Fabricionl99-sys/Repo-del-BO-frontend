const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

export type BackendMissionRecord = Record<string, unknown>;

export const adminMissions: BackendMissionRecord[] = [
  {
    id: 'mission_weekly_bet_500',
    code: 'bet_500_week',
    name: 'Apostá $500 esta semana',
    description: 'Apostá un total de $500 USD en cualquier juego.',
    type: 'daily',
    is_active: true,
    daily_validity_hours: 24,
    timezone: 'UTC',
    restrictions: { min_level: null, vip_only: false, new_players_only: false },
    max_active_simultaneous_override: null,
    updated_at: ago(1),
    progress: { started: 4821, completed: 1847 },
    steps: [
      {
        name: null,
        description: null,
        actions: [
          {
            config: {
              type: 'bet_amount',
              amount: 500,
              currency_code: 'USD',
              aggregation_mode: 'cumulative',
            },
            display_order: 0,
          },
        ],
        rewards: [
          {
            reward_type_id: 5,
            reward_config: { kind: 'manual', description: '500 XP bonus', value_usd: 0 },
            display_order: 0,
          },
          {
            reward_type_id: 7,
            reward_config: { kind: 'coins', amount: 1000, currency_code: 'coin_oro' },
            display_order: 1,
          },
        ],
      },
    ],
  },
  {
    id: 'mission_first_deposit',
    code: 'first_deposit_50',
    name: 'Primer depósito',
    description: 'Depositá por primera vez en la plataforma.',
    type: 'daily',
    is_active: true,
    daily_validity_hours: 168,
    timezone: 'UTC',
    restrictions: { min_level: null, vip_only: false, new_players_only: true },
    updated_at: ago(2),
    progress: { started: 1200, completed: 430 },
    steps: [
      {
        actions: [{ config: { type: 'first_deposit', min_amount: 50 }, display_order: 0 }],
        rewards: [
          {
            reward_type_id: 5,
            reward_config: { kind: 'manual', description: '200 XP bonus', value_usd: 0 },
            display_order: 0,
          },
        ],
      },
    ],
  },
  {
    id: 'mission_casino_kyc',
    code: 'casino_kyc_combo',
    name: 'Casino + KYC',
    description: 'Apostá en casino y completá KYC.',
    type: 'daily',
    is_active: false,
    daily_validity_hours: 48,
    timezone: 'UTC',
    restrictions: { min_level: null, vip_only: false, new_players_only: false },
    updated_at: ago(3),
    progress: { started: 800, completed: 120 },
    steps: [
      {
        actions: [
          { config: { type: 'bet_amount', amount: 100, aggregation_mode: 'cumulative' }, display_order: 0 },
          { config: { type: 'bet_category', category_slug: 'casino' }, display_order: 1 },
          { config: { type: 'verify_kyc' }, display_order: 2 },
        ],
        rewards: [
          {
            reward_type_id: 7,
            reward_config: { kind: 'coins', amount: 500, currency_code: 'coin_oro' },
            display_order: 0,
          },
        ],
      },
    ],
  },
];

export const seedAdminMissions: BackendMissionRecord[] = JSON.parse(JSON.stringify(adminMissions));

export function resetAdminMissions() {
  adminMissions.length = 0;
  adminMissions.push(...JSON.parse(JSON.stringify(seedAdminMissions)));
}
