import { useCallback, useSyncExternalStore } from 'react';

import { getStoredTheme, setThemePreference, toggleTheme, type ThemeMode } from '@/lib/theme';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('niveles-theme-change', onStoreChange);
  return () => window.removeEventListener('niveles-theme-change', onStoreChange);
}

function getSnapshot(): ThemeMode {
  return getStoredTheme();
}

export function useThemePreference() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'dark' as ThemeMode);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemePreference(mode);
    window.dispatchEvent(new Event('niveles-theme-change'));
  }, []);

  const toggle = useCallback(() => {
    const next = toggleTheme();
    window.dispatchEvent(new Event('niveles-theme-change'));
    return next;
  }, []);

  return { theme, setTheme, toggle, isDark: theme === 'dark' };
}
