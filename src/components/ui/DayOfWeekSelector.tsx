import { cn } from '@/lib/cn';

const DAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

/**
 * Selector multi-día reutilizable para disponibilidad semanal.
 * Uso: <DayOfWeekSelector value={[1,2,3]} onChange={(days) => setDays(days)} />.
 */
export function DayOfWeekSelector({ value, onChange, disabled }: { value: number[]; onChange: (days: number[]) => void; disabled?: boolean }) {
  const toggle = (day: number) => {
    if (disabled) return;
    onChange(value.includes(day) ? value.filter((item) => item !== day) : [...value, day].sort());
  };

  return (
    <div className="flex flex-wrap gap-2">
      {DAYS.map((day) => {
        const active = value.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            disabled={disabled}
            onClick={() => toggle(day.value)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-[14px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
              active
                ? 'border-accent bg-accent-subtle text-accent'
                : 'border-border-subtle bg-bg-tertiary text-text-secondary hover:border-border-strong hover:text-text-primary',
            )}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}
