import type { QueryClient } from '@tanstack/react-query';

import { isBrandingConfig, isOperatorConfigApiResponse } from '@/lib/boConfigValidation';
import {
  BO_CONFIG_STORAGE_KEYS,
  BO_LOCAL_STORAGE_KEYS,
  readLocalStorageJson,
  removeLocalStorageKey,
  removeUnknownNivelesConfigKeys,
} from '@/lib/boLocalStorage';

type ConfigValidator = (value: unknown) => boolean;

const STORAGE_VALIDATORS: Record<string, ConfigValidator> = {
  [BO_LOCAL_STORAGE_KEYS.operatorConfigLegacy]: isOperatorConfigApiResponse,
  [BO_LOCAL_STORAGE_KEYS.operatorConfig]: isOperatorConfigApiResponse,
  [BO_LOCAL_STORAGE_KEYS.brandingConfig]: isBrandingConfig,
  [BO_LOCAL_STORAGE_KEYS.brandingConfigLegacy]: isBrandingConfig,
};

export function purgeLocalStorageKeyIfInvalid(key: string, validate: ConfigValidator) {
  const parsed = readLocalStorageJson(key);
  if (parsed === null) return;
  if (!validate(parsed)) {
    removeLocalStorageKey(key);
  }
}

export function purgeOperatorConfigStorage() {
  BO_CONFIG_STORAGE_KEYS.filter((k) => k.includes('operator_config')).forEach((key) => {
    purgeLocalStorageKeyIfInvalid(key, isOperatorConfigApiResponse);
  });
  removeUnknownNivelesConfigKeys();
}

export function purgeBrandingConfigStorage() {
  BO_CONFIG_STORAGE_KEYS.filter((k) => k.includes('branding')).forEach((key) => {
    purgeLocalStorageKeyIfInvalid(key, isBrandingConfig);
  });
  removeUnknownNivelesConfigKeys();
}

export function purgeInvalidConfigLocalStorage() {
  for (const [key, validate] of Object.entries(STORAGE_VALIDATORS)) {
    purgeLocalStorageKeyIfInvalid(key, validate);
  }
  removeUnknownNivelesConfigKeys();
}

export function purgeInvalidQueryCache(queryClient: QueryClient) {
  const operatorCached = queryClient.getQueryData(['operator-config']);
  if (operatorCached !== undefined && !isOperatorConfigApiResponse(operatorCached)) {
    queryClient.removeQueries({ queryKey: ['operator-config'], exact: true });
  }

  const brandingCached = queryClient.getQueryData(['branding-config']);
  if (brandingCached !== undefined && !isBrandingConfig(brandingCached)) {
    queryClient.removeQueries({ queryKey: ['branding-config'], exact: true });
  }
}

/** Limpia localStorage corrupto y caché de React Query antes del primer render. */
export function sanitizeBoPersistentState(queryClient: QueryClient) {
  purgeInvalidConfigLocalStorage();
  purgeInvalidQueryCache(queryClient);
}
