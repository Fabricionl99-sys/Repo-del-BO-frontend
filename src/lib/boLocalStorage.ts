/**
 * Registro de keys de localStorage usadas por el BO.
 * Auth y Zustand no se validan como config anidada; el resto se purga si el shape es inválido.
 */
export const BO_LOCAL_STORAGE_KEYS = {
  authRefresh: 'niveles_refresh_token',
  operatorZustand: 'niveles_operator',
  operatorConfigLegacy: 'niveles_operator_config',
  operatorConfig: 'niveles_operator_config_v2',
  brandingConfig: 'niveles_branding_config_v1',
  /** Alias histórico mencionado en docs / sesiones previas */
  brandingConfigLegacy: 'niveles_branding_config',
} as const;

export type BoConfigStorageKey =
  | typeof BO_LOCAL_STORAGE_KEYS.operatorConfigLegacy
  | typeof BO_LOCAL_STORAGE_KEYS.operatorConfig
  | typeof BO_LOCAL_STORAGE_KEYS.brandingConfig
  | typeof BO_LOCAL_STORAGE_KEYS.brandingConfigLegacy;

export const BO_CONFIG_STORAGE_KEYS: BoConfigStorageKey[] = [
  BO_LOCAL_STORAGE_KEYS.operatorConfigLegacy,
  BO_LOCAL_STORAGE_KEYS.operatorConfig,
  BO_LOCAL_STORAGE_KEYS.brandingConfig,
  BO_LOCAL_STORAGE_KEYS.brandingConfigLegacy,
];

export function readLocalStorageJson(key: string): unknown {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function removeLocalStorageKey(key: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(key);
  }
}

export function writeLocalStorageJson(key: string, value: unknown) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

/** Elimina keys niveles_* de config desconocidas (typos, versiones viejas). */
export function removeUnknownNivelesConfigKeys() {
  if (typeof window === 'undefined') return;
  const known = new Set<string>([
    BO_LOCAL_STORAGE_KEYS.authRefresh,
    BO_LOCAL_STORAGE_KEYS.operatorZustand,
    ...BO_CONFIG_STORAGE_KEYS,
  ]);

  const toRemove: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith('niveles_')) continue;
    if (known.has(key)) continue;
    if (key.includes('operator_config') || key.includes('branding')) {
      toRemove.push(key);
    }
  }
  toRemove.forEach(removeLocalStorageKey);
}

export function listBoLocalStorageKeys(): string[] {
  if (typeof window === 'undefined') return [];
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (key?.startsWith('niveles_')) keys.push(key);
  }
  return keys.sort();
}
