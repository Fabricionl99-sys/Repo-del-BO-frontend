export interface MissionAvailabilityWindowForm {
  from_date: string;
  from_time: string;
  until_date: string;
  until_time: string;
}

export function emptyAvailabilityWindow(): MissionAvailabilityWindowForm {
  return { from_date: '', from_time: '', until_date: '', until_time: '' };
}

/** Parse ISO 8601 UTC into local date/time parts for HTML inputs. */
export function isoToDateTimeParts(iso: string | null | undefined): { date: string; time: string } {
  if (!iso) return { date: '', time: '' };
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return { date: '', time: '' };
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
    time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
  };
}

export function isoToAvailabilityWindow(
  from: string | null | undefined,
  until: string | null | undefined,
): MissionAvailabilityWindowForm {
  const fromParts = isoToDateTimeParts(from);
  const untilParts = isoToDateTimeParts(until);
  return {
    from_date: fromParts.date,
    from_time: fromParts.time,
    until_date: untilParts.date,
    until_time: untilParts.time,
  };
}

/** Combine local date + optional time into ISO 8601 UTC, or null if date empty. */
export function dateTimePartsToIso(
  date: string,
  time: string,
  opts: { endOfDayDefault?: boolean } = {},
): string | null {
  const d = date.trim();
  if (!d) return null;
  let t = time.trim();
  if (!t) t = opts.endOfDayDefault ? '23:59:59' : '00:00:00';
  if (/^\d{2}:\d{2}$/.test(t)) t = `${t}:00`;
  const parsed = new Date(`${d}T${t}`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function availabilityWindowToIso(window: MissionAvailabilityWindowForm): {
  available_from: string | null;
  available_until: string | null;
} {
  return {
    available_from: dateTimePartsToIso(window.from_date, window.from_time),
    available_until: dateTimePartsToIso(window.until_date, window.until_time, { endOfDayDefault: true }),
  };
}

export function validateAvailabilityWindow(window: MissionAvailabilityWindowForm): string | null {
  const { available_from, available_until } = availabilityWindowToIso(window);
  if (available_from && available_until) {
    if (new Date(available_from).getTime() >= new Date(available_until).getTime()) {
      return 'La fecha "desde" debe ser anterior a la fecha "hasta"';
    }
  }
  return null;
}
