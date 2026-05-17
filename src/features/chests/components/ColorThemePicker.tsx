import { CHEST_COLOR_PRESETS } from '@/features/chests/chestTypeForm';
import { cn } from '@/lib/cn';

export function ColorThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {CHEST_COLOR_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            title={preset.label}
            onClick={() => onChange(preset.value)}
            className={cn(
              'h-8 w-8 rounded-full border-2 transition',
              value === preset.value ? 'border-accent ring-2 ring-accent/30' : 'border-border-default',
            )}
            style={{ backgroundColor: preset.value }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-border-subtle bg-transparent"
        />
        <input
          className="field font-mono text-[14px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#CD7F32"
        />
      </div>
    </div>
  );
}
