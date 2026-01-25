import { Link, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "~/hooks/useTheme";

export function Navigation({
  isAuthenticated,
  userEmail,
}: {
  isAuthenticated: boolean;
  userEmail?: string;
}) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  // Don't show nav on auth pages
  if (location.pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="border-b border-emerald-100 dark:border-emerald-900 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors focus:ring-2 focus:ring-emerald-300 focus:outline-none px-2 py-1 rounded-lg"
          >
            Flor
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus:ring-2 focus:ring-emerald-300 focus:outline-none px-3 py-2 rounded-lg"
                >
                  Dashboard
                </Link>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-10 w-10 focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-600" />
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800"
                      aria-label="User menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem disabled>
                      <span className="text-xs text-gray-500 dark:text-slate-400 truncate">
                        {userEmail}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <form action="/auth/logout" method="post" className="w-full">
                        <button
                          type="submit"
                          className="w-full text-left text-sm text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-1"
                        >
                          Logout
                        </button>
                      </form>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Theme Toggle for unauthenticated users */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-10 w-10 focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-600" />
                  )}
                </Button>

                <Link to="/auth/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 focus:ring-2 focus:ring-emerald-300"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-300">
                    Sign up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
