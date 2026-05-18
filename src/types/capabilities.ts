export type CapabilityDimension = 'products' | 'bonus_types' | 'events';

export interface OperatorCapability {
  dimension: CapabilityDimension;
  capability: string;
  display_name: string;
  is_active: boolean;
  is_detected: boolean;
  manual_override: boolean;
  detected_at: string | null;
  updated_at: string;
}

export interface OperatorCapabilitiesSnapshot {
  capabilities: OperatorCapability[];
  last_detection_at: string | null;
}

export interface CapabilityPatchPayload {
  is_active: boolean;
  manual_override?: boolean;
}

export interface CapabilityBulkUpdateItem {
  dimension: CapabilityDimension;
  capability: string;
  is_active: boolean;
  manual_override?: boolean;
}

export interface CapabilityBulkUpdatePayload {
  updates: CapabilityBulkUpdateItem[];
}

export interface DetectNowResult {
  summary: string;
  new_bonus_types: string[];
  new_events: string[];
  new_products: string[];
  last_detection_at: string;
}

export interface CapabilityAuditEntry {
  id: string;
  dimension: CapabilityDimension;
  capability: string;
  capability_label: string;
  action: 'enabled' | 'disabled' | 'reset' | 'detected' | 'bulk_update';
  actor_email: string;
  created_at: string;
  detail?: string;
}

export interface UnsupportedConfig {
  id: string;
  source_module: string;
  config_path: string;
  reason: string;
  detected_at: string;
  sample_value?: string;
}
