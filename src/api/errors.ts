import { isAxiosError } from 'axios';

export function getHttpStatus(error: unknown): number | undefined {
  if (isAxiosError(error)) return error.response?.status;
  return undefined;
}

interface ProblemIssue {
  path?: string | string[];
  code?: string;
  message?: string;
}

function getProblemIssues(error: unknown): ProblemIssue[] {
  if (!isAxiosError(error)) return [];
  const data = error.response?.data;
  if (!data || typeof data !== 'object' || !('issues' in data)) return [];
  const issues = (data as { issues?: unknown }).issues;
  return Array.isArray(issues) ? (issues as ProblemIssue[]) : [];
}

function issuePathMatchesEmail(path: string | string[] | undefined): boolean {
  if (path === 'email') return true;
  if (Array.isArray(path)) return path.join('.') === 'email' || path[path.length - 1] === 'email';
  return false;
}

/** RFC 7807 validation-failed from check-email (status 400, issues[].code invalid_format). */
export function isCheckEmailFormatValidationError(error: unknown): boolean {
  const status = getHttpStatus(error);
  if (status === 400 || status === 422) return true;
  return getProblemIssues(error).some(
    (issue) =>
      issuePathMatchesEmail(issue.path) &&
      (issue.code === 'invalid_format' ||
        issue.code === 'invalid_string' ||
        /invalid email/i.test(issue.message ?? '')),
  );
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
  if (status === 422 || status === 400) return 'Revisá los datos del formulario';
  if (status && status >= 500) return 'Error del servidor · intentá de nuevo en unos minutos';
  if (isAxiosError(error) && !error.response) return 'Conexión perdida · revisá tu red';

  return 'No pudimos crear la cuenta. Intentá de nuevo.';
}

export function getCheckEmailErrorMessage(error: unknown): string {
  if (isCheckEmailFormatValidationError(error)) return 'Formato de email inválido';

  const status = getHttpStatus(error);
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

function problemDetail(error: unknown): string | undefined {
  if (!isAxiosError(error)) return undefined;
  const data = error.response?.data;
  if (!data || typeof data !== 'object') return undefined;
  const o = data as Record<string, unknown>;
  if (typeof o.detail === 'string' && o.detail.trim()) return o.detail;
  if (typeof o.message === 'string' && o.message.trim()) return o.message;
  if (typeof o.title === 'string' && o.title.trim()) return o.title;
  return undefined;
}

/** Mensaje legible para toasts (Problem+JSON, Nest messages, fallback). */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const detail = problemDetail(error);
  if (detail) return detail;

  const status = getHttpStatus(error);
  if (status === 403) return 'No tenés permisos para esta acción';
  if (status === 404) return 'Recurso no encontrado';
  if (status === 422 || status === 400) return 'Revisá los datos enviados';
  if (status && status >= 500) return 'Error del servidor · intentá de nuevo en unos minutos';
  if (isAxiosError(error) && !error.response) return 'Conexión perdida · revisá tu red';

  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function isXpEngineModuleForbidden(error: unknown): boolean {
  if (getHttpStatus(error) !== 403) return false;
  const detail = (problemDetail(error) ?? '').toLowerCase();
  return detail.includes('module') || detail.includes('xp_engine') || detail.includes('xp engine');
}
