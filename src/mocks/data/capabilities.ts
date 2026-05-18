import { getTriggerLabel } from '@/features/missions/missionTriggers';
import {
  ALL_BONUS_TYPE_CODES,
  ALL_PRODUCT_CODES,
  BONUS_TYPE_LABELS,
  PRODUCT_LABELS,
} from '@/features/capabilities/capabilityLabels';
import { ALL_MISSION_TRIGGERS } from '@/features/missions/missionTriggers';
import type {
  CapabilityAuditEntry,
  CapabilityDimension,
  OperatorCapability,
  UnsupportedConfig,
} from '@/types/capabilities';

const iso = (daysAgo: number, hours = 0) =>
  new Date(Date.now() - daysAgo * 86400000 - hours * 3600000).toISOString();

const ACTIVE_PRODUCTS = new Set(['casino', 'sportsbook', 'slots']);
const ACTIVE_BONUS_TYPES = new Set(['freespin', 'bonus_deposit']);
const ACTIVE_EVENTS = new Set([
  'bet_placed',
  'deposit_first',
  'login_consecutive',
  'deposit_recurring',
  'play_casino',
  'play_slots',
  'email_verified',
  'kyc_completed',
]);

function cap(
  dimension: CapabilityDimension,
  capability: string,
  display_name: string,
  is_active: boolean,
  is_detected = true,
  manual_override = false,
): OperatorCapability {
  return {
    dimension,
    capability,
    display_name,
    is_active,
    is_detected,
    manual_override,
    detected_at: is_detected ? iso(14) : null,
    updated_at: iso(2),
  };
}

function buildSeedCapabilities(): OperatorCapability[] {
  const products = ALL_PRODUCT_CODES.map((code) =>
    cap('products', code, PRODUCT_LABELS[code] ?? code, ACTIVE_PRODUCTS.has(code)),
  );
  const bonusTypes = ALL_BONUS_TYPE_CODES.map((code) =>
    cap('bonus_types', code, BONUS_TYPE_LABELS[code] ?? code, ACTIVE_BONUS_TYPES.has(code)),
  );
  const events = ALL_MISSION_TRIGGERS.map((t) =>
    cap('events', t.code, getTriggerLabel(t.code), ACTIVE_EVENTS.has(t.code)),
  );
  return [...products, ...bonusTypes, ...events];
}

export const seedCapabilities = buildSeedCapabilities();

export let operatorCapabilities: OperatorCapability[] = seedCapabilities.map((c) => ({ ...c }));
export let lastDetectionAt: string | null = iso(3);

function buildAuditLog(): CapabilityAuditEntry[] {
  const entries: CapabilityAuditEntry[] = [];
  const actions: CapabilityAuditEntry['action'][] = ['enabled', 'disabled', 'reset', 'detected', 'bulk_update'];
  const dims: CapabilityDimension[] = ['products', 'bonus_types', 'events'];
  for (let i = 0; i < 30; i++) {
    const dim = dims[i % dims.length];
    const pool =
      dim === 'products'
        ? ALL_PRODUCT_CODES
        : dim === 'bonus_types'
          ? ALL_BONUS_TYPE_CODES
          : ALL_MISSION_TRIGGERS.map((t) => t.code);
    const capability = pool[i % pool.length];
    const label =
      dim === 'products'
        ? PRODUCT_LABELS[capability]
        : dim === 'bonus_types'
          ? BONUS_TYPE_LABELS[capability]
          : getTriggerLabel(capability);
    entries.push({
      id: `cap_audit_${1000 + i}`,
      dimension: dim,
      capability,
      capability_label: label ?? capability,
      action: actions[i % actions.length],
      actor_email: i % 3 === 0 ? 'admin@operator.com' : 'editor@operator.com',
      created_at: iso(i % 20, i % 12),
      detail: i % 5 === 0 ? 'Detección automática' : undefined,
    });
  }
  return entries.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export let capabilityAuditLog: CapabilityAuditEntry[] = buildAuditLog();

export const seedUnsupportedConfigs: UnsupportedConfig[] = [
  {
    id: 'unsup_1',
    source_module: 'missions',
    config_path: 'objective.event = horse_racing_bet',
    reason: 'Evento no reconocido en catálogo de plataforma',
    detected_at: iso(8),
    sample_value: 'horse_racing_bet',
  },
  {
    id: 'unsup_2',
    source_module: 'shop',
    config_path: 'reward.reward_type = loyalty_points',
    reason: 'Tipo de premio no soportado por el operador',
    detected_at: iso(12),
    sample_value: 'loyalty_points',
  },
  {
    id: 'unsup_3',
    source_module: 'operator_bonuses',
    config_path: 'bonus_type = risk_free_bet',
    reason: 'Tipo de bono no mapeado a capability conocida',
    detected_at: iso(15),
    sample_value: 'risk_free_bet',
  },
  {
    id: 'unsup_4',
    source_module: 'xp_rules',
    config_path: 'trigger.product = fantasy_league',
    reason: 'Producto no detectado en integración',
    detected_at: iso(18),
    sample_value: 'fantasy_league',
  },
  {
    id: 'unsup_5',
    source_module: 'webhooks',
    config_path: 'payload.event = tournament_winner',
    reason: 'Evento de webhook sin capability equivalente',
    detected_at: iso(22),
    sample_value: 'tournament_winner',
  },
];

export let unsupportedConfigs: UnsupportedConfig[] = seedUnsupportedConfigs.map((c) => ({ ...c }));

export function findCapability(dimension: CapabilityDimension, capability: string) {
  return operatorCapabilities.find((c) => c.dimension === dimension && c.capability === capability);
}

export function resetCapabilitiesStore() {
  operatorCapabilities = seedCapabilities.map((c) => ({ ...c }));
  lastDetectionAt = iso(3);
  capabilityAuditLog = buildAuditLog();
  unsupportedConfigs = seedUnsupportedConfigs.map((c) => ({ ...c }));
}

export function clearCapabilitiesForEmptyState() {
  operatorCapabilities = [];
  lastDetectionAt = null;
}

export function setLastDetectionAt(iso: string) {
  lastDetectionAt = iso;
}

export function runDetectNow(): {
  new_bonus_types: string[];
  new_events: string[];
  new_products: string[];
} {
  if (operatorCapabilities.length === 0) {
    operatorCapabilities = seedCapabilities.map((c) => ({ ...c }));
    setLastDetectionAt(new Date().toISOString());
    return {
      new_bonus_types: ['freespin', 'bonus_deposit'],
      new_events: ['bet_placed', 'deposit_first', 'login_consecutive'],
      new_products: ['casino', 'sportsbook', 'slots'],
    };
  }
  const newBonus: string[] = [];
  const newEvents: string[] = [];
  const newProducts: string[] = [];
  for (const item of operatorCapabilities) {
    if (!item.is_detected && !item.manual_override) {
      item.is_detected = true;
      item.is_active = true;
      item.detected_at = new Date().toISOString();
      if (item.dimension === 'bonus_types') newBonus.push(item.capability);
      if (item.dimension === 'events') newEvents.push(item.capability);
      if (item.dimension === 'products') newProducts.push(item.capability);
    }
  }
  setLastDetectionAt(new Date().toISOString());
  return { new_bonus_types: newBonus, new_events: newEvents, new_products: newProducts };
}
