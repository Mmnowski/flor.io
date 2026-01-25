import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Hook to manage theme preference
 * Reads from localStorage and system preference
 * Updates document class for Tailwind dark: prefix
 */
export function useTheme(): {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
} {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check localStorage first
    const stored = localStorage.getItem("theme") as Theme | null;

    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme: Theme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      applyTheme(initialTheme);
    }

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return {
    theme: mounted ? theme : "light",
    toggleTheme,
    isDark: theme === "dark",
  };
}

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme) {
  const html = document.documentElement;

  if (theme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}
