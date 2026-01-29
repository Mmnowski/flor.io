import { useTheme } from '~/hooks/useTheme';
import { Button } from '~/shared/components';

import { Moon, Sun } from 'lucide-react';

export function ThemeToggle(): React.ReactNode {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-11 w-11 focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-500" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600" />
      )}
    </Button>
  );
}
