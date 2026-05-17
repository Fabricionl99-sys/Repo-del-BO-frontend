export const THEME_STORAGE_KEY = 'niveles_theme_preference_v1';

export type ThemeMode = 'dark' | 'light';

export function getStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function applyTheme(theme: ThemeMode): void {
  document.documentElement.classList.remove('dark', 'light');
  document.documentElement.classList.add(theme);
}

export function setThemePreference(theme: ThemeMode): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme(): ThemeMode {
  const next: ThemeMode = getStoredTheme() === 'dark' ? 'light' : 'dark';
  setThemePreference(next);
  return next;
}
