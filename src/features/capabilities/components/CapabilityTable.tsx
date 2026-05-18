import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/cn';
import { formatRelativeDate } from '@/lib/format';
import type { CapabilityDimension, OperatorCapability } from '@/types/capabilities';

export function CapabilityTable({
  rows,
  pendingKeys,
  onToggle,
  onReset,
  savingKey,
}: {
  rows: OperatorCapability[];
  pendingKeys: Set<string>;
  onToggle: (row: OperatorCapability, next: boolean) => void;
  onReset: (row: OperatorCapability) => void;
  savingKey?: string | null;
}) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-[14px] text-text-tertiary">Sin registros en esta dimensión.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle">
      <table className="w-full text-[14px]">
        <thead className="bg-bg-tertiary text-left text-text-tertiary">
          <tr>
            <th className="px-4 py-3 font-semibold">Capability</th>
            <th className="px-4 py-3 font-semibold">Detectado</th>
            <th className="px-4 py-3 font-semibold">Override manual</th>
            <th className="px-4 py-3 font-semibold">Activo</th>
            <th className="px-4 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const key = `${row.dimension}:${row.capability}`;
            const pending = pendingKeys.has(key);
            const saving = savingKey === key;
            return (
              <tr
                key={key}
                className={cn(
                  'border-t border-border-subtle',
                  pending && 'bg-accent-subtle/30',
                )}
              >
                <td className="px-4 py-3">
                  <p className="font-semibold">{row.display_name}</p>
                  <p className="font-mono text-[12px] text-text-tertiary">{row.capability}</p>
                </td>
                <td className="px-4 py-3">
                  {row.is_detected ? (
                    <span className="text-success">sí</span>
                  ) : (
                    <span className="text-text-tertiary">no</span>
                  )}
                  {row.detected_at && (
                    <p className="text-[12px] text-text-tertiary">{formatRelativeDate(row.detected_at)}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.manual_override ? (
                    <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[12px] text-warning">manual</span>
                  ) : (
                    <span className="text-text-tertiary">auto</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Switch
                    checked={row.is_active}
                    disabled={saving}
                    onChange={(v) => onToggle(row, v)}
                    aria-label={`Activar ${row.display_name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    icon={<RotateCcw size={14} />}
                    disabled={!row.manual_override || saving}
                    onClick={() => onReset(row)}
                  >
                    Reset
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function filterByDimension(
  capabilities: OperatorCapability[],
  dimension: CapabilityDimension,
) {
  return capabilities.filter((c) => c.dimension === dimension);
}
