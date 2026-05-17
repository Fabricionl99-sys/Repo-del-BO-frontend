import { Moon, Sun } from 'lucide-react';

import { IconButton } from '@/components/ui/IconButton';
import { useThemePreference } from '@/hooks/useThemePreference';

export function ThemeToggle() {
  const { theme, toggle } = useThemePreference();
  const isDark = theme === 'dark';

  return (
    <IconButton
      icon={isDark ? Sun : Moon}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      onClick={() => toggle()}
    />
  );
}
