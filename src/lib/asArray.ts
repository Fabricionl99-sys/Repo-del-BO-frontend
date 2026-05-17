/** Coerces nullable list fields from API payloads into a safe array. */
export function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
