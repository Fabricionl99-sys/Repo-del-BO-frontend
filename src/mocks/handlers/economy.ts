import { http, HttpResponse } from 'msw';

import type { EconomyConfig } from '@/features/economy/types';

let economyConfig: EconomyConfig = {
  usd_per_xp: 100,
  xp_per_coin: 3,
  updated_at: new Date().toISOString(),
  updated_by: 'Fabricio Lasagna',
};

export const economyHandlers = [
  http.get('*/admin/economy-config', () => HttpResponse.json(economyConfig)),
  http.patch('*/admin/economy-config', async ({ request }) => {
    const body = (await request.json()) as Partial<EconomyConfig>;
    economyConfig = {
      ...economyConfig,
      ...body,
      updated_at: new Date().toISOString(),
      updated_by: 'Fabricio Lasagna',
    };
    return HttpResponse.json(economyConfig);
  }),
];
