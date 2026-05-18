import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Switch } from '@/components/ui/Switch';
import { OCCASION_CATEGORIES, OCCASION_LABELS } from '@/features/wheels/wheelForm';
import type { WheelOccasion, WheelOccasionType } from '@/types/wheels';

function OccasionConfigFields({
  type,
  occasion,
  onChange,
}: {
  type: WheelOccasionType;
  occasion: WheelOccasion;
  onChange: (patch: Partial<WheelOccasion>) => void;
}) {
  const cfg = occasion.config;

  if (type === 'welcome_register') {
    return (
      <label className="mt-2 flex items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          checked={Boolean(cfg.first_registration_only ?? true)}
          onChange={(e) =>
            onChange({ config: { ...cfg, first_registration_only: e.target.checked } })
          }
        />
        Solo primer registro
      </label>
    );
  }

  if (type === 'daily_spin') {
    const mode = (cfg.mode as string) ?? 'hours_exact';
    return (
      <div className="mt-2 space-y-2 text-[13px]">
        <label className="flex items-start gap-2">
          <input
            type="radio"
            checked={mode === 'hours_exact'}
            onChange={() => onChange({ config: { ...cfg, mode: 'hours_exact', hours: cfg.hours ?? 24 } })}
          />
          <span>
            Cada X horas exactas
            <span className="ml-1 text-text-tertiary" title="Cuenta desde el último spin del jugador + X horas">
              (?)
            </span>
          </span>
        </label>
        {mode === 'hours_exact' && (
          <input
            type="number"
            min={1}
            className="field ml-6 max-w-[120px]"
            value={Number(cfg.hours ?? 24)}
            onChange={(e) => onChange({ config: { ...cfg, mode: 'hours_exact', hours: Number(e.target.value) } })}
          />
        )}
        <label className="flex items-start gap-2">
          <input
            type="radio"
            checked={mode === 'utc_reset'}
            onChange={() => onChange({ config: { ...cfg, mode: 'utc_reset' } })}
          />
          <span title="Spin disponible a las 00:00 UTC siempre">Reset a las 00:00 UTC</span>
        </label>
      </div>
    );
  }

  if (type === 'level_milestone') {
    return (
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <label className="text-[12px] text-text-tertiary">Cada cuántos niveles</label>
          <input
            type="number"
            min={1}
            className="field"
            value={Number(cfg.every_n_levels ?? 5)}
            onChange={(e) => onChange({ config: { ...cfg, every_n_levels: Number(e.target.value) } })}
          />
        </div>
        <div>
          <label className="text-[12px] text-text-tertiary">Desde nivel mínimo</label>
          <input
            type="number"
            min={1}
            className="field"
            value={Number(cfg.min_level ?? 1)}
            onChange={(e) => onChange({ config: { ...cfg, min_level: Number(e.target.value) } })}
          />
        </div>
      </div>
    );
  }

  if (type === 'zero_balance') {
    return (
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <label className="text-[12px] text-text-tertiary">Máximo por día</label>
          <input
            type="number"
            min={1}
            className="field"
            value={Number(cfg.max_per_day ?? 1)}
            onChange={(e) => onChange({ config: { ...cfg, max_per_day: Number(e.target.value) } })}
          />
        </div>
        <div>
          <label className="text-[12px] text-text-tertiary">Cooldown horas</label>
          <input
            type="number"
            min={1}
            className="field"
            value={Number(cfg.cooldown_hours ?? 24)}
            onChange={(e) => onChange({ config: { ...cfg, cooldown_hours: Number(e.target.value) } })}
          />
        </div>
      </div>
    );
  }

  if (type === 'withdrawal_consolation') {
    return (
      <div className="mt-2">
        <label className="text-[12px] text-text-tertiary">Monto mínimo USD</label>
        <input
          type="number"
          min={0}
          className="field max-w-[160px]"
          value={Number(cfg.min_withdrawal_usd ?? 100)}
          onChange={(e) => onChange({ config: { ...cfg, min_withdrawal_usd: Number(e.target.value) } })}
        />
      </div>
    );
  }

  if (type === 'shop_purchase') {
    return (
      <p className="mt-2 text-[13px] text-text-tertiary">
        Crear producto en{' '}
        <Link to="/tienda" className="text-accent hover:underline">
          /tienda
        </Link>{' '}
        con reward_type=&apos;wheel_spin&apos;
      </p>
    );
  }

  if (type === 'first_deposit') {
    return (
      <label className="mt-2 flex items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          checked={Boolean(cfg.first_deposit_only ?? true)}
          onChange={(e) => onChange({ config: { ...cfg, first_deposit_only: e.target.checked } })}
        />
        Solo primer depósito
      </label>
    );
  }

  if (type === 'mission_streak_chest_reward') {
    return (
      <p className="mt-2 text-[13px] text-text-tertiary">
        Configurar en /misiones, /rachas o /cofres con reward_type=&apos;wheel_spin&apos;
      </p>
    );
  }

  return null;
}

export function WheelOccasionsEditor({
  occasions,
  onChange,
}: {
  occasions: WheelOccasion[];
  onChange: (next: WheelOccasion[]) => void;
}) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({
    engagement: true,
  });

  const updateOccasion = (type: WheelOccasionType, patch: Partial<WheelOccasion>) => {
    onChange(
      occasions.map((o) => (o.occasion_type === type ? { ...o, ...patch } : o)),
    );
  };

  return (
    <div className="space-y-2">
      {OCCASION_CATEGORIES.map((cat) => {
        const open = openCats[cat.key] ?? false;
        return (
          <div key={cat.key} className="rounded-lg border border-border-subtle">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-left font-semibold"
              onClick={() => setOpenCats((s) => ({ ...s, [cat.key]: !open }))}
            >
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              {cat.title}
            </button>
            {open && (
              <div className="space-y-3 border-t border-border-subtle px-4 py-3">
                {cat.types.map((type) => {
                  const occ = occasions.find((o) => o.occasion_type === type)!;
                  const alwaysOn = type === 'manual_grant';
                  return (
                    <div key={type} className="rounded-lg bg-bg-tertiary p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[14px]">{OCCASION_LABELS[type]}</span>
                        <Switch
                          checked={occ.is_active}
                          disabled={alwaysOn}
                          onChange={(v) => updateOccasion(type, { is_active: v })}
                        />
                      </div>
                      {occ.is_active && (
                        <OccasionConfigFields
                          type={type}
                          occasion={occ}
                          onChange={(patch) => updateOccasion(type, patch)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
