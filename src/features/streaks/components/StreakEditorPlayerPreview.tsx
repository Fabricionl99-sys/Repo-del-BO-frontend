import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import type { StreakEditorFormValues } from '@/features/streaks/streakEditorForm';
import { rewardPreviewLabel } from '@/features/streaks/streakEditorForm';

function getErr(errors: unknown, path: string): string | undefined {
  const parts = path.split('.');
  let cur: unknown = errors;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  if (cur && typeof cur === 'object' && 'message' in cur) return String((cur as { message?: string }).message);
  return undefined;
}

export function StreakEditorPlayerPreview({ values, formErrors }: { values: StreakEditorFormValues; formErrors: unknown }) {
  const [open, setOpen] = useState(false);
  const sorted = useMemo(() => [...values.milestones].sort((a, b) => a.day_number - b.day_number), [values.milestones]);

  const nextMilestone = sorted[0];
  const nextLabel = nextMilestone
    ? `Día ${nextMilestone.day_number} → ${rewardPreviewLabel(nextMilestone.reward_kind, nextMilestone, false)}`
    : 'Sin hitos configurados';

  const lastMilestoneDay = sorted.length ? sorted[sorted.length - 1].day_number : 0;
  const spanEnd = Math.max(lastMilestoneDay || 7, 1);
  const cap = Math.min(14, spanEnd);

  const chips = useMemo(() => {
    const out: { d: number; label: string; hit?: (typeof sorted)[number] }[] = [];
    for (let d = 1; d <= cap; d++) {
      const hit = sorted.find((h) => h.day_number === d);
      const label = hit
        ? rewardPreviewLabel(hit.reward_kind, hit, false)
        : values.daily_reward_kind !== 'none'
          ? rewardPreviewLabel(values.daily_reward_kind, values, true)
          : '—';
      out.push({ d, label, hit });
    }
    return out;
  }, [sorted, cap, values]);

  return (
    <section className="mt-8 rounded-xl border border-border-subtle bg-bg-secondary">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-medium hover:bg-bg-tertiary"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Preview del jugador</span>
        <ChevronDown size={16} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="border-t border-border-subtle px-4 py-4">
          <div className="rounded-lg border border-border-default bg-bg-primary p-4 font-sans text-[13px] shadow-sm">
            <p className="mb-1 font-medium text-text-primary">Tu racha actual: Día 0 (no iniciada)</p>
            <p className="mb-4 text-text-secondary">
              Próximo milestone: <span className="text-accent">{nextLabel}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {chips.map(({ d, label, hit }) => (
                <span
                  key={d}
                  className={`rounded-md border px-2.5 py-1 text-[11px] ${
                    hit ? 'border-accent/40 bg-accent-subtle text-text-primary' : 'border-border-subtle bg-bg-tertiary text-text-tertiary'
                  }`}
                >
                  Día {d}: {label}
                  {hit ? ' 🎁' : ''}
                </span>
              ))}
            </div>
            {sorted.length > 14 ? (
              <p className="mt-3 text-[11px] text-text-tertiary">…y más días hasta el día {sorted[sorted.length - 1]?.day_number}</p>
            ) : null}
          </div>
          {getErr(formErrors, 'milestones.0.day_number') ? (
            <p className="mt-2 text-[11px] text-danger">Corregí los errores del formulario para un preview fiel.</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
