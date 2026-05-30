import type { FieldErrors } from 'react-hook-form';

function walkFieldErrors(
  errors: FieldErrors,
  prefix = '',
  out: string[] = [],
): string[] {
  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && 'message' in value && typeof value.message === 'string') {
      out.push(`${path}: ${value.message}`);
      continue;
    }
    if (typeof value === 'object') {
      walkFieldErrors(value as FieldErrors, path, out);
    }
  }
  return out;
}

/** Mensajes legibles para toast cuando falla react-hook-form / zod. */
export function formatFieldErrors(errors: FieldErrors): string {
  const messages = walkFieldErrors(errors);
  if (messages.length === 0) return 'Revisá los campos marcados en rojo.';
  const preview = messages.slice(0, 4).join(' · ');
  return messages.length > 4 ? `${preview} · …` : preview;
}

export function rewardFieldErrorMessage(
  errors: Record<string, { message?: string }> | undefined,
  key: string,
): string | undefined {
  return errors?.[key]?.message;
}
