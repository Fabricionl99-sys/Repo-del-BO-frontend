import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import type { LevelEntry, MilestoneUnlock } from '@/types/levels';

const MILESTONE_OPTIONS: { value: MilestoneUnlock; label: string }[] = [
  { value: 'avatar_pack_1', label: 'Avatar pack 1' },
  { value: 'own_photo', label: 'Subir foto propia' },
  { value: 'vip_tournaments', label: 'Acceso torneos VIP' },
];

type Props = {
  row: LevelEntry;
  prevXp: number | null;
  onChange: (next: LevelEntry) => void;
  onPickBadge: (file: File) => Promise<string>;
};

export function LevelRow({ row, prevXp, onChange, onPickBadge }: Props) {
  const name = row.displayName ?? '';
  const milestoneOn = row.milestoneEnabled;

  return (
    <tr className="border-b border-border-subtle text-[15px]">
      <td className="py-3 pr-2 align-middle font-mono text-text-secondary">{row.level}</td>
      <td className="py-3 pr-2 align-middle">
        <input
          className="field w-full max-w-[200px]"
          maxLength={30}
          placeholder="opcional"
          value={name}
          onChange={(e) => onChange({ ...row, displayName: e.target.value || undefined })}
          aria-label={`Nombre nivel ${row.level}`}
        />
      </td>
      <td className="py-3 pr-2 align-middle">
        <div className="flex items-center gap-2">
          {row.badgeImageUrl ? (
            <img src={row.badgeImageUrl} alt="" className="h-10 w-10 rounded-lg border border-border-subtle object-cover" />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-dashed border-border-default text-text-tertiary text-lg">
              —
            </span>
          )}
          <label className="cursor-pointer text-[13px] text-accent hover:underline">
            <input
              type="file"
              accept="image/png,image/svg+xml"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = await onPickBadge(file);
                onChange({ ...row, badgeImageUrl: url });
                e.target.value = '';
              }}
            />
            Subir
          </label>
        </div>
      </td>
      <td className="py-3 pr-2 align-middle">
        <input
          type="number"
          min={0}
          className="field w-full max-w-[140px]"
          value={row.xpRequired}
          onChange={(e) => onChange({ ...row, xpRequired: Number(e.target.value) || 0 })}
          aria-label={`XP nivel ${row.level}`}
        />
        {prevXp !== null && row.xpRequired <= prevXp ? (
          <p className="mt-1 text-[13px] text-danger">Debe ser mayor que el nivel anterior</p>
        ) : null}
      </td>
      <td className="py-3 align-middle">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={milestoneOn}
              onChange={(checked) =>
                onChange({
                  ...row,
                  milestoneEnabled: checked,
                  milestoneUnlock: checked ? row.milestoneUnlock ?? 'avatar_pack_1' : null,
                })
              }
              aria-label={`Milestone nivel ${row.level}`}
            />
            <span className="text-text-secondary">{milestoneOn ? 'Sí' : 'No'}</span>
          </div>
          {milestoneOn ? (
            <select
              className="field max-w-[220px] text-[14px]"
              value={row.milestoneUnlock ?? 'avatar_pack_1'}
              onChange={(e) =>
                onChange({ ...row, milestoneUnlock: e.target.value as MilestoneUnlock })
              }
              aria-label={`Qué desbloquea nivel ${row.level}`}
            >
              {MILESTONE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export function AddLevelButton({ nextLevel, onClick }: { nextLevel: number; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onClick}>
      + Agregar nivel {nextLevel}
    </Button>
  );
}
