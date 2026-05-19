export interface InternalMetrics {
  period_days: number;
  signups_started: number;
  signups_completed: number;
  landing_unique_visitors: number;
  conversion_rate: number;
  active_operators: number;
  top_modules: { module_code: string; label: string; activations: number }[];
}
