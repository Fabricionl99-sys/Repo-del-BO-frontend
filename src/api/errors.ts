import { isAxiosError } from 'axios';

export function getHttpStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) return error.response?.status;
  return undefined;
}

function getRetryAfterSeconds(error: unknown): number | undefined {
  if (!isAxiosError(error)) return undefined;
  const data = error.response?.data;
  if (data && typeof data === 'object' && 'retry_after_seconds' in data) {
    const seconds = Number((data as { retry_after_seconds?: unknown }).retry_after_seconds);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
  }
  return undefined;
}

export function getSignupErrorMessage(error: unknown): string {
  const status = getHttpStatus(error);

  if (status === 409) return 'Ese email ya está registrado';
  if (status === 404) return 'Servicio no disponible. Verificá la conexión o contactá soporte.';
  if (status === 422) return 'Revisá los datos del formulario';
  if (status && status >= 500) return 'Error del servidor · intentá de nuevo en unos minutos';
  if (isAxiosError(error) && !error.response) return 'Conexión perdida · revisá tu red';

  return 'No pudimos crear la cuenta. Intentá de nuevo.';
}

export function getCheckEmailErrorMessage(error: unknown): string {
  const status = getHttpStatus(error);

  if (status === 422) return 'Formato de email inválido';
  if (status === 429) {
    const retry = getRetryAfterSeconds(error);
    return retry
      ? `Demasiados intentos. Esperá ${retry} segundos e intentá de nuevo.`
      : 'Demasiados intentos. Esperá un momento e intentá de nuevo.';
  }
  if (status === 404) return 'No pudimos verificar el email (servicio no disponible)';
  if (status && status >= 500) return 'Error de conexión. Reintentá en unos minutos.';
  if (isAxiosError(error) && !error.response) return 'Sin conexión. Revisá tu red e intentá de nuevo.';

  return 'No pudimos verificar el email';
}
