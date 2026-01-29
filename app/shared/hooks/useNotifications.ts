import type { PlantNeedingWater } from '~/types/api.types';

import { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';

interface NotificationsResponse {
  notifications: PlantNeedingWater[];
  count: number;
}

/**
 * Manage notifications for plants that need watering
 * Handles fetching, loading state, and modal visibility
 *
 * @param isAuthenticated - Whether user is authenticated
 * @returns Notification state and control methods
 *
 * @example
 * const notifications = useNotifications(isAuthenticated);
 * return (
 *   <>
 *     <NotificationBell
 *       count={notifications.notificationCount}
 *       onClick={() => notifications.setIsOpen(true)}
 *     />
 *     <NotificationsModal {...notifications} />
 *   </>
 * );
 */
export function useNotifications(isAuthenticated: boolean): {
  notifications: PlantNeedingWater[];
  notificationCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isLoading: boolean;
  refetch: () => void;
} {
  const [notifications, setNotifications] = useState<PlantNeedingWater[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher<NotificationsResponse>();
  const initialFetchDone = useRef(false);

  // Fetch on mount
  useEffect(() => {
    if (isAuthenticated && !initialFetchDone.current && fetcher.state === 'idle') {
      initialFetchDone.current = true;
      fetcher.load('/api/notifications');
    }
  }, [isAuthenticated, fetcher]);

  // Refetch when modal opens
  useEffect(() => {
    if (isAuthenticated && isOpen && fetcher.state === 'idle') {
      fetcher.load('/api/notifications');
    }
  }, [isAuthenticated, isOpen, fetcher]);

  // Update notifications from fetcher data
  useEffect(() => {
    if (fetcher.data?.notifications) {
      setNotifications(fetcher.data.notifications);
    }
  }, [fetcher.data]);

  const refetch = () => {
    fetcher.load('/api/notifications');
  };

  return {
    notifications,
    notificationCount: notifications.length,
    isOpen,
    setIsOpen,
    isLoading: fetcher.state === 'loading',
    refetch,
  };
}
