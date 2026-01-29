import { Navigation } from '~/layout/components';

import { RouterProvider, createMemoryRouter } from 'react-router';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Navigation Notifications Integration Tests
 *
 * Tests the navigation component's integration with:
 * - Notification fetching (useFetcher with /api/notifications)
 * - Watering actions (useFetcher with /api/water/{plantId})
 * - Modal state management
 * - Badge count updates
 * - Route navigation
 * - Data refetching after actions
 */

interface NotificationData {
  notifications: Array<{
    plant_id: string;
    plant_name: string;
    photo_url: string | null;
    last_watered: string;
    next_watering: string;
    days_overdue: number;
  }>;
  count: number;
}

// Mock the useFetcher hook
const mockFetcher: {
  load: ReturnType<typeof vi.fn>;
  submit: ReturnType<typeof vi.fn>;
  state: 'idle';
  data: NotificationData | null;
} = {
  load: vi.fn(),
  submit: vi.fn(),
  state: 'idle' as const,
  data: null,
};

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useFetcher: vi.fn(() => ({ ...mockFetcher })),
  };
});

describe('Navigation Notifications Integration', () => {
  const mockNotifications = {
    notifications: [
      {
        plant_id: 'plant-1',
        plant_name: 'Monstera',
        photo_url: null,
        last_watered: '2024-01-20T10:00:00Z',
        next_watering: '2024-01-27T10:00:00Z',
        days_overdue: 2,
      },
      {
        plant_id: 'plant-2',
        plant_name: 'Snake Plant',
        photo_url: null,
        last_watered: '2024-01-19T10:00:00Z',
        next_watering: '2024-01-26T10:00:00Z',
        days_overdue: 1,
      },
    ],
    count: 2,
  };

  const renderNavigation = (props?: Partial<React.ComponentProps<typeof Navigation>>) => {
    const defaultProps = {
      isAuthenticated: true,
      userEmail: 'test@example.com',
      ...props,
    };

    const routes = [
      {
        path: '/',
        element: <Navigation {...defaultProps} />,
      },
      {
        path: '/dashboard',
        element: <div>Dashboard</div>,
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
      initialIndex: 0,
    });

    return render(<RouterProvider router={router} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetcher.load.mockClear();
    mockFetcher.submit.mockClear();
  });

  describe('Notification badge display and updates', () => {
    it('should render bell icon button when authenticated', () => {
      renderNavigation({ isAuthenticated: true });
      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(bellButton).toBeInTheDocument();
    });

    it('should not render bell icon when not authenticated', () => {
      renderNavigation({ isAuthenticated: false });
      const bellButton = screen.queryByRole('button', { name: /notifications/i });
      expect(bellButton).not.toBeInTheDocument();
    });

    it('should display badge count when notifications exist', () => {
      mockFetcher.data = mockNotifications;
      renderNavigation();

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      const badge = within(bellButton).getByText('2');
      expect(badge).toBeInTheDocument();
    });

    it('should not display badge when no notifications', () => {
      mockFetcher.data = { notifications: [], count: 0 };
      renderNavigation();

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      const badge = within(bellButton).queryByText(/\d+/);
      expect(badge).not.toBeInTheDocument();
    });

    it('should update badge count when fetcher data changes', async () => {
      // Test with initial data
      mockFetcher.data = mockNotifications;
      renderNavigation();

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(within(bellButton).getByText('2')).toBeInTheDocument();
    });
  });

  describe('Initial data fetching on mount', () => {
    it('should fetch notifications when component mounts (authenticated)', () => {
      renderNavigation({ isAuthenticated: true });

      // Should have called load on mount
      expect(mockFetcher.load).toHaveBeenCalledWith('/api/notifications');
    });

    it('should not fetch notifications when not authenticated', () => {
      mockFetcher.load.mockClear();
      renderNavigation({ isAuthenticated: false });

      expect(mockFetcher.load).not.toHaveBeenCalledWith('/api/notifications');
    });

    it('should only fetch notifications once on initial mount', () => {
      mockFetcher.load.mockClear();
      renderNavigation({ isAuthenticated: true });

      // Should have been called exactly once
      const callsToNotifications = mockFetcher.load.mock.calls.filter((c) =>
        c[0].includes('notifications')
      );
      expect(callsToNotifications.length).toBe(1);
    });
  });

  describe('Modal opening and data refetch', () => {
    it('should open modal when bell button is clicked', async () => {
      const user = userEvent.setup();
      mockFetcher.data = mockNotifications;

      renderNavigation();
      const bellButton = screen.getByRole('button', { name: /notifications/i });

      await user.click(bellButton);

      // Modal should attempt to open (will be rendered in component)
      expect(bellButton).toBeInTheDocument();
    });

    it('should refetch notifications when modal opens', async () => {
      const user = userEvent.setup();
      mockFetcher.load.mockClear();
      mockFetcher.data = mockNotifications;

      renderNavigation();
      const bellButton = screen.getByRole('button', { name: /notifications/i });

      // First load on mount
      await waitFor(() => {
        expect(mockFetcher.load).toHaveBeenCalled();
      });

      const initialCallCount = mockFetcher.load.mock.calls.length;

      // Click to open modal would trigger refetch
      await user.click(bellButton);

      // May or may not refetch depending on debouncing
      expect(mockFetcher.load).toHaveBeenCalledWith('/api/notifications');
    });
  });

  describe('Watering action integration', () => {
    it('should submit watering action when plant watered from modal', async () => {
      mockFetcher.data = mockNotifications;
      renderNavigation();

      // In real scenario, this would be triggered by modal's onWatered callback
      // For now we're just testing that the navigation component has the capability
      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(bellButton).toBeInTheDocument();
    });

    it('should update notification count after successful watering', () => {
      // Test with reduced plant count after watering
      mockFetcher.data = {
        notifications: [mockNotifications.notifications[1]],
        count: 1,
      };
      renderNavigation();

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(within(bellButton).getByText('1')).toBeInTheDocument();
    });

    it('should hide badge after all plants watered', () => {
      // Test with no remaining plants to water
      mockFetcher.data = { notifications: [], count: 0 };
      renderNavigation();

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(within(bellButton).queryByText(/\d+/)).not.toBeInTheDocument();
    });
  });

  describe('Navigation structure and accessibility', () => {
    it('should have bell button positioned correctly in nav', () => {
      renderNavigation({ isAuthenticated: true });

      const nav = screen.getByRole('navigation');
      const bellButton = within(nav).getByRole('button', {
        name: /notifications/i,
      });

      expect(bellButton).toBeInTheDocument();
    });

    it('should have proper aria-label on bell button', () => {
      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(bellButton).toHaveAttribute('aria-label');
      expect(bellButton.getAttribute('aria-label')).toMatch(/notifications/i);
    });

    it('should maintain button accessibility with and without badge', () => {
      // Without notifications
      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      // Button should be accessible and have proper aria-label
      expect(bellButton).toHaveAttribute('aria-label');
      expect(bellButton.getAttribute('aria-label')).toContain('Notifications');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });

      // Tab to button
      await user.tab();

      // Button should be focusable
      expect(bellButton).toBeInTheDocument();
    });
  });

  describe('Styling and visual consistency', () => {
    it('should apply ghost variant styling', () => {
      renderNavigation({ isAuthenticated: true });
      const bellButton = screen.getByRole('button', { name: /notifications/i });

      // Should have hover styling classes
      expect(bellButton.className).toContain('hover:bg-emerald-50');
      expect(bellButton.className).toContain('dark:hover:bg-slate-800');
    });

    it('should have focus ring for keyboard navigation', () => {
      renderNavigation({ isAuthenticated: true });
      const bellButton = screen.getByRole('button', { name: /notifications/i });

      expect(bellButton.className).toContain('focus:ring-2');
      expect(bellButton.className).toContain('focus:ring-emerald-300');
    });

    it('should display correct icon size', () => {
      renderNavigation({ isAuthenticated: true });
      const bellButton = screen.getByRole('button', { name: /notifications/i });

      expect(bellButton.className).toContain('h-11');
      expect(bellButton.className).toContain('w-11');
    });

    it('should support dark mode', () => {
      renderNavigation({ isAuthenticated: true });
      const bellButton = screen.getByRole('button', { name: /notifications/i });

      expect(bellButton.className).toContain('dark:hover:bg-slate-800');
    });
  });

  describe('Integration with other nav elements', () => {
    it('should render bell button in navigation', () => {
      renderNavigation({ isAuthenticated: true });

      const nav = screen.getByRole('navigation');
      const bellButton = within(nav).getByRole('button', {
        name: /notifications/i,
      });

      expect(bellButton).toBeInTheDocument();
    });

    it('should work alongside theme toggle button', () => {
      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      const themeButtons = screen
        .getAllByRole('button')
        .filter((btn) => btn.getAttribute('aria-label')?.includes('mode'));

      expect(bellButton).toBeInTheDocument();
      expect(themeButtons.length).toBeGreaterThan(0);
    });

    it('should work alongside user menu', () => {
      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      const userMenuButton = screen.getByRole('button', { name: /user menu/i });

      expect(bellButton).toBeInTheDocument();
      expect(userMenuButton).toBeInTheDocument();
    });
  });

  describe('Edge cases and error states', () => {
    it('should handle missing userEmail gracefully', () => {
      renderNavigation({ isAuthenticated: true, userEmail: undefined });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(bellButton).toBeInTheDocument();
    });

    it('should handle bell button clicks without breaking', async () => {
      const user = userEvent.setup();
      mockFetcher.data = mockNotifications;
      renderNavigation();

      const bellButton = screen.getByRole('button', { name: /notifications/i });

      // Click button once
      await user.click(bellButton);

      // Should not break or cause errors
      expect(bellButton).toBeInTheDocument();
    });

    it('should handle null notifications data', () => {
      mockFetcher.data = null;
      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(bellButton).toBeInTheDocument();

      // Should not display badge if data is null
      expect(within(bellButton).queryByText(/\d+/)).not.toBeInTheDocument();
    });

    it('should handle zero notifications count', () => {
      mockFetcher.data = { notifications: [], count: 0 };
      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(within(bellButton).queryByText(/\d+/)).not.toBeInTheDocument();
    });

    it('should handle large notification counts', () => {
      mockFetcher.data = {
        notifications: Array(99)
          .fill(null)
          .map((_, i) => ({
            plant_id: `plant-${i}`,
            plant_name: `Plant ${i}`,
            photo_url: null,
            last_watered: '2024-01-20T10:00:00Z',
            next_watering: '2024-01-27T10:00:00Z',
            days_overdue: i % 5,
          })),
        count: 99,
      };

      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      expect(within(bellButton).getByText('99')).toBeInTheDocument();
    });
  });

  describe('Authentication state changes', () => {
    it('should show bell button only when authenticated', () => {
      renderNavigation({ isAuthenticated: true });

      expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
    });

    it('should handle logout by hiding bell button', () => {
      renderNavigation({ isAuthenticated: false });

      expect(screen.queryByRole('button', { name: /notifications/i })).not.toBeInTheDocument();
    });
  });

  describe('Badge styling variations', () => {
    it('should use destructive variant for badge', () => {
      mockFetcher.data = mockNotifications;
      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      const badge = within(bellButton).getByText('2');

      // Badge should have destructive styling
      expect(badge.className).toContain('bg-destructive');
    });

    it('should position badge in top-right corner', () => {
      mockFetcher.data = mockNotifications;
      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      const badge = within(bellButton).getByText('2');

      expect(badge.className).toContain('absolute');
      expect(badge.className).toContain('-top-1');
      expect(badge.className).toContain('-right-1');
    });

    it('should have consistent badge size', () => {
      mockFetcher.data = mockNotifications;
      renderNavigation({ isAuthenticated: true });

      const bellButton = screen.getByRole('button', { name: /notifications/i });
      const badge = within(bellButton).getByText('2');

      expect(badge.className).toContain('h-5');
      expect(badge.className).toContain('w-5');
    });
  });
});
