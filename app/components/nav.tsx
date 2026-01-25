import { Link, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

export function Navigation({
  isAuthenticated,
  userEmail,
}: {
  isAuthenticated: boolean;
  userEmail?: string;
}) {
  const location = useLocation();

  // Don't show nav on auth pages
  if (location.pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="border-b border-emerald-100 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors focus:ring-2 focus:ring-emerald-300 focus:outline-none px-2 py-1 rounded-lg"
          >
            Flor
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors focus:ring-2 focus:ring-emerald-300 focus:outline-none px-3 py-2 rounded-lg"
                >
                  Dashboard
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 focus:ring-2 focus:ring-emerald-300"
                      aria-label="User menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem disabled>
                      <span className="text-xs text-gray-500 truncate">
                        {userEmail}
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <form action="/auth/logout" method="post" className="w-full">
                        <button
                          type="submit"
                          className="w-full text-left text-sm text-gray-700 hover:text-emerald-600 py-1"
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
                <Link to="/auth/login">
                  <Button
                    variant="ghost"
                    className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 focus:ring-2 focus:ring-emerald-300"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-2 focus:ring-emerald-300">
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
