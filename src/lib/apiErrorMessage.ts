export function getApiErrorMessage(err: unknown, fallback: string): string {
  const e = err as {
    response?: { status?: number; data?: { detail?: string; message?: string; title?: string } };
    message?: string;
  };
  const detail = e.response?.data?.detail ?? e.response?.data?.message ?? e.response?.data?.title;
  if (detail && typeof detail === 'string') return detail;
  if (e.message) return e.message;
  return fallback;
}

export function getApiErrorStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}
