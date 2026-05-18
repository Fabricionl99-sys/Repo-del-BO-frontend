import { delay, http, HttpResponse } from 'msw';

import {
  capabilityAuditLog,
  findCapability,
  lastDetectionAt,
  operatorCapabilities,
  runDetectNow,
  unsupportedConfigs,
} from '@/mocks/data/capabilities';
import { BONUS_TYPE_LABELS, PRODUCT_LABELS } from '@/features/capabilities/capabilityLabels';
import { getTriggerLabel } from '@/features/missions/missionTriggers';
import type {
  CapabilityBulkUpdatePayload,
  CapabilityDimension,
  CapabilityPatchPayload,
  DetectNowResult,
  OperatorCapability,
} from '@/types/capabilities';

const wait = () =>
  import.meta.env.MODE === 'test' ? Promise.resolve() : delay(200 + Math.random() * 400);

function labelFor(dimension: CapabilityDimension, capability: string) {
  if (dimension === 'products') return PRODUCT_LABELS[capability] ?? capability;
  if (dimension === 'bonus_types') return BONUS_TYPE_LABELS[capability] ?? capability;
  return getTriggerLabel(capability);
}

function pushAudit(
  dimension: CapabilityDimension,
  capability: string,
  action: 'enabled' | 'disabled' | 'reset' | 'detected' | 'bulk_update',
  detail?: string,
) {
  capabilityAuditLog.unshift({
    id: `cap_audit_${Date.now()}`,
    dimension,
    capability,
    capability_label: labelFor(dimension, capability),
    action,
    actor_email: 'admin@operator.com',
    created_at: new Date().toISOString(),
    detail,
  });
}

export const capabilitiesHandlers = [
  http.get('*/admin/capabilities', async () => {
    await wait();
    return HttpResponse.json({
      data: {
        capabilities: operatorCapabilities,
        last_detection_at: lastDetectionAt,
      },
    });
  }),

  http.get('*/admin/capabilities/audit-log', async ({ request }) => {
    await wait();
    const limit = Number(new URL(request.url).searchParams.get('limit') ?? 50);
    return HttpResponse.json({ data: capabilityAuditLog.slice(0, limit) });
  }),

  http.get('*/admin/capabilities/unsupported-configs', async () => {
    await wait();
    return HttpResponse.json({ data: unsupportedConfigs });
  }),

  http.patch('*/admin/capabilities/:dimension/:capability', async ({ params, request }) => {
    await wait();
    const dimension = String(params.dimension) as CapabilityDimension;
    const capability = String(params.capability);
    const item = findCapability(dimension, capability);
    if (!item) return new HttpResponse(null, { status: 404 });
    const body = (await request.json()) as CapabilityPatchPayload;
    if (body.is_active !== undefined) {
      item.is_active = body.is_active;
      pushAudit(dimension, capability, body.is_active ? 'enabled' : 'disabled');
    }
    if (body.manual_override === false) {
      item.manual_override = false;
      item.is_active = item.is_detected;
      pushAudit(dimension, capability, 'reset', 'Vuelve al valor detectado');
    } else {
      item.manual_override = true;
    }
    item.updated_at = new Date().toISOString();
    return HttpResponse.json({ data: item });
  }),

  http.post('*/admin/capabilities/bulk-update', async ({ request }) => {
    await wait();
    const body = (await request.json()) as CapabilityBulkUpdatePayload;
    const updated: OperatorCapability[] = [];
    for (const u of body.updates) {
      const item = findCapability(u.dimension, u.capability);
      if (!item) continue;
      item.is_active = u.is_active;
      item.manual_override = u.manual_override ?? true;
      item.updated_at = new Date().toISOString();
      updated.push(item);
    }
    if (updated.length > 0) {
      pushAudit(updated[0].dimension, updated[0].capability, 'bulk_update', `${updated.length} capabilities`);
    }
    return HttpResponse.json({ data: { updated } });
  }),

  http.post('*/admin/capabilities/detect-now', async () => {
    await wait();
    const detected = runDetectNow();
    pushAudit('bonus_types', 'freespin', 'detected', 'Detección automática');
    const result: DetectNowResult = {
      summary: `Detección completada: ${detected.new_bonus_types.length} nuevos bonus_types detectados, ${detected.new_events.length} nuevos events detectados.`,
      new_bonus_types: detected.new_bonus_types,
      new_events: detected.new_events,
      new_products: detected.new_products,
      last_detection_at: lastDetectionAt ?? new Date().toISOString(),
    };
    return HttpResponse.json({ data: result });
  }),
];
