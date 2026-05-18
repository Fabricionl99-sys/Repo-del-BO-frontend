export type PricingTierId = 'starter' | 'growth' | 'pro' | 'enterprise';

export type MauBand = '0-1k' | '1k-10k' | '10k-50k' | '50k+';

export interface SignupPayload {
  email: string;
  password: string;
  company_name: string;
  country: string;
  newsletter?: boolean;
}

export interface SignupResponse {
  signup_token: string;
  message: 'email_sent';
}

export interface ConfirmEmailPayload {
  token: string;
}

export interface ConfirmEmailResponse {
  user_id: string;
  onboarding_token: string;
  onboarding_step: number;
}

export interface OnboardingLegalStep {
  legal_name: string;
  tax_id: string;
  address: string;
  country: string;
  state: string;
  city: string;
  website: string;
}

export interface OnboardingPlatformStep {
  platform: string;
  bonus_api: 'yes' | 'manual' | 'unknown';
  events_integration: 'webhooks' | 'sdk' | 'custom';
}

export interface OnboardingCapabilitiesStep {
  products: string[];
  bonus_types: string[];
  mau_band: MauBand;
}

export interface OnboardingPlanStep {
  tier: PricingTierId;
  skip_payment: boolean;
  card_last4?: string | null;
}

export interface OnboardingQuickstartStep {
  modules: string[];
  wants_quickstart_call: boolean;
}

export type OnboardingStepData =
  | OnboardingLegalStep
  | OnboardingPlatformStep
  | OnboardingCapabilitiesStep
  | OnboardingPlanStep
  | OnboardingQuickstartStep;

export interface OnboardingState {
  current_step: number;
  completed_steps: number[];
  data: {
    legal?: OnboardingLegalStep;
    platform?: OnboardingPlatformStep;
    capabilities?: OnboardingCapabilitiesStep;
    plan?: OnboardingPlanStep;
    quickstart?: OnboardingQuickstartStep;
  };
  email?: string;
  company_name?: string;
}

export interface OnboardingCompleteResponse {
  tenant_id: string;
  access_token: string;
  refresh_token: string;
  trial_ends_at: string;
  company_display_name: string;
  has_payment_method?: boolean;
}
