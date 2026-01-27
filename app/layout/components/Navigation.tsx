import { NotificationsModal, type PlantNeedingWater } from '~/features/watering/components';

import { useEffect, useRef, useState } from 'react';
import { Link, useFetcher, useLocation } from 'react-router';

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
      notificationsFetcher.load('/api/notifications');
    }
  }, [wateringFetcher.state, wateringFetcher.data]);

  // Handle watering action
  const handleWatered = (plantId: string): void => {
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

                <NotificationBell
                  count={notifications.length}
                  onClick={() => setNotificationsOpen(true)}
                  isLoading={wateringFetcher.state !== 'idle'}
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
