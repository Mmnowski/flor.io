import { NotificationsModal, type PlantNeedingWater } from '~/components/notifications-modal';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useTheme } from '~/hooks/useTheme';

import { useEffect, useRef, useState } from 'react';
import { Link, useFetcher, useLocation } from 'react-router';

import { Bell, Menu, Moon, Sun } from 'lucide-react';

export function Navigation({
  isAuthenticated,
  userEmail,
}: {
  isAuthenticated: boolean;
  userEmail?: string;
}) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PlantNeedingWater[]>([]);
  const notificationsFetcher = useFetcher<{
    notifications: PlantNeedingWater[];
    count: number;
  }>();
  const wateringFetcher = useFetcher();
  const initialFetchDone = useRef(false);

  // Fetch notifications on mount for authenticated users
  useEffect(() => {
    if (isAuthenticated && !initialFetchDone.current && notificationsFetcher.state === 'idle') {
      initialFetchDone.current = true;
      notificationsFetcher.load('/api/notifications');
    }
  }, [isAuthenticated]);

  // Refetch notifications when modal opens
  useEffect(() => {
    if (isAuthenticated && notificationsOpen && notificationsFetcher.state === 'idle') {
      notificationsFetcher.load('/api/notifications');
    }
  }, [isAuthenticated, notificationsOpen]);

  // Update notifications when fetcher data changes
  useEffect(() => {
    if (notificationsFetcher.data?.notifications) {
      setNotifications(notificationsFetcher.data.notifications);
    }
  }, [notificationsFetcher.data]);

  // Refetch notifications after watering action completes
  useEffect(() => {
    if (wateringFetcher.state === 'idle' && wateringFetcher.data) {
      // Refetch notifications after a successful watering
      notificationsFetcher.load('/api/notifications');
    }
  }, [wateringFetcher.state, wateringFetcher.data]);

  // Handle watering action
  const handleWatered = (plantId: string) => {
    wateringFetcher.submit({}, { method: 'post', action: `/api/water/${plantId}` });
  };

  // Don't show nav on auth pages
  if (location.pathname.startsWith('/auth')) {
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

                {/* Notifications Bell */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setNotificationsOpen(true)}
                  className="relative h-11 w-11 focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800"
                  aria-label={`Notifications (${notifications.length})`}
                >
                  <Bell className="h-5 w-5 text-gray-700 dark:text-slate-300" />
                  {notifications.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {notifications.length}
                    </Badge>
                  )}
                </Button>

                {/* Theme Toggle */}
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

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-11 w-11 focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800"
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
                  className="h-11 w-11 focus:ring-2 focus:ring-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800"
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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

      {/* Notifications Modal */}
      {isAuthenticated && (
        <NotificationsModal
          open={notificationsOpen}
          onOpenChange={setNotificationsOpen}
          notifications={notifications}
          onWatered={handleWatered}
          isLoading={wateringFetcher.state !== 'idle'}
        />
      )}
    </nav>
  );
}
