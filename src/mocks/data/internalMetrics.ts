import type { InternalMetrics } from '@/types/internalMetrics';

export const mockInternalMetrics: InternalMetrics = {
  period_days: 7,
  signups_started: 42,
  signups_completed: 28,
  landing_unique_visitors: 380,
  conversion_rate: 0.074,
  active_operators: 19,
  top_modules: [
    { module_code: 'missions', label: 'Misiones', activations: 12 },
    { module_code: 'xp_engine', label: 'Motor XP', activations: 11 },
    { module_code: 'rewards_delivery', label: 'Webhooks', activations: 8 },
    { module_code: 'shop', label: 'Tienda', activations: 6 },
  ],
};
