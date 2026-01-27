import { NotificationsModal } from '~/features/watering/components';
import { useNotifications, useWateringAction } from '~/shared/hooks';

import { useCallback } from 'react';
import { Link, useLocation } from 'react-router';

import { AuthLinks } from './AuthLinks';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function Navigation({
  isAuthenticated,
  userEmail,
}: {
  isAuthenticated: boolean;
  userEmail?: string;
}): React.ReactNode {
  const location = useLocation();
  const notifications = useNotifications(isAuthenticated);
  const watering = useWateringAction(() => notifications.refetch());

  // Handle watering and refetch notifications
  const handleWatered = useCallback(
    (plantId: string) => {
      watering.waterPlant(plantId);
    },
    [watering]
  );

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

                <NotificationBell
                  count={notifications.notificationCount}
                  onClick={() => notifications.setIsOpen(true)}
                  isLoading={watering.isWatering}
                />

                <ThemeToggle />

                <UserMenu userEmail={userEmail} />
              </>
            ) : (
              <>
                <ThemeToggle />
                <AuthLinks />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Modal */}
      {isAuthenticated && (
        <NotificationsModal
          open={notifications.isOpen}
          onOpenChange={notifications.setIsOpen}
          notifications={notifications.notifications}
          onWatered={handleWatered}
          isLoading={watering.isWatering}
        />
      )}
    </nav>
  );
}
