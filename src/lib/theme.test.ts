import { afterEach, describe, expect, it } from 'vitest';

import {
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredTheme,
  setThemePreference,
  toggleTheme,
} from '@/lib/theme';

describe('theme preference', () => {
  afterEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    applyTheme('dark');
  });

  it('defaults to dark', () => {
    expect(getStoredTheme()).toBe('dark');
  });

  it('persists light preference', () => {
    setThemePreference('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(getStoredTheme()).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('toggles between dark and light', () => {
    expect(toggleTheme()).toBe('light');
    expect(toggleTheme()).toBe('dark');
  });
});
