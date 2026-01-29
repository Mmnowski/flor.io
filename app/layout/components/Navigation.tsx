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
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-4">
          {/* Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="text-2xl font-bold hover:opacity-80 transition-opacity focus:ring-2 focus:ring-emerald-300 focus:outline-none py-1 rounded-lg"
          >
            <span className="text-emerald-600 dark:text-emerald-400">Flor</span>
            <span className="text-slate-700 dark:text-white">.io</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
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
