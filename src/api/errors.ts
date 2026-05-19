import { isAxiosError } from 'axios';

export function getHttpStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) return error.response?.status;
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
  if (status === 404) return 'No pudimos verificar el email (servicio no disponible)';
  if (isAxiosError(error) && !error.response) return 'Sin conexión · no pudimos verificar el email';
  return 'No pudimos verificar el email';
}
