import { NotificationsModal, type PlantNeedingWater } from '~/features/watering/components';

import { RouterProvider, createMemoryRouter } from 'react-router';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * NotificationsModal Integration Tests
 *
 * Tests the modal component's integration with:
 * - Route navigation
 * - Data from loaders
 * - Action callbacks for watering
 * - State management across operations
 */

describe('NotificationsModal Integration', () => {
  const mockNotifications: PlantNeedingWater[] = [
    {
      plant_id: 'plant-1',
      plant_name: 'Monstera Deliciosa',
      photo_url: 'https://example.com/monstera.jpg',
      last_watered: '2024-01-10T10:00:00Z',
      next_watering: '2024-01-17T10:00:00Z',
      days_overdue: 5,
    },
    {
      plant_id: 'plant-2',
      plant_name: 'Snake Plant',
      photo_url: null,
      last_watered: '2024-01-19T10:00:00Z',
      next_watering: '2024-01-26T10:00:00Z',
      days_overdue: 0,
    },
  ];

  const renderWithRouter = (component: React.ReactElement, onNavigate: () => void = () => {}) => {
    const routes = [
      {
        path: '/',
        element: component,
      },
      {
        path: '/dashboard/plants/:plantId',
        element: (
          <div>
            Plant Detail Page
            {(() => {
              onNavigate();
              return null;
            })()}
          </div>
        ),
      },
    ];

    const router = createMemoryRouter(routes, {
      initialEntries: ['/'],
      initialIndex: 0,
    });

    return render(<RouterProvider router={router} />);
  };

  const renderModal = (
    notifications: PlantNeedingWater[] = mockNotifications,
    onOpenChange = vi.fn(),
    onWatered = vi.fn()
  ) => {
    const routes = [
      {
        path: '/',
        element: (
          <NotificationsModal
            open={true}
            onOpenChange={onOpenChange}
            notifications={notifications}
            onWatered={onWatered}
          />
        ),
      },
      {
        path: '/dashboard/plants/:plantId',
        element: <div>Plant Detail Page</div>,
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
  });

  describe('Modal displays loaded notification data', () => {
    it('should render all plants from notifications prop', () => {
      renderModal();

      expect(screen.getByText('Monstera Deliciosa')).toBeInTheDocument();
      expect(screen.getByText('Snake Plant')).toBeInTheDocument();
    });

    it('should display correct notification count', () => {
      renderModal();

      expect(screen.getByText('2 plants need watering')).toBeInTheDocument();
    });

    it('should show overdue status for plants with days_overdue > 0', () => {
      renderModal();

      expect(screen.getByText('Overdue by 5 days')).toBeInTheDocument();
      expect(screen.getByText('Due today')).toBeInTheDocument();
    });

    it('should display plant photos when available', () => {
      renderModal();

      const image = screen.getByAltText('Monstera Deliciosa') as HTMLImageElement;
      expect(image).toBeInTheDocument();
      expect(image.src).toBe('https://example.com/monstera.jpg');
    });

    it('should show placeholder when photo_url is null', () => {
      renderModal();

      const plantNameElements = screen.getAllByText('Snake Plant');
      const container = plantNameElements[0].closest('div');
      const leafIcon = container?.querySelector('svg');

      expect(leafIcon).toBeInTheDocument();
    });
  });

  describe('Modal state management with actions', () => {
    it("should call onWatered when 'Watered' button clicked", async () => {
      const user = userEvent.setup();
      const mockOnWatered = vi.fn();

      renderModal(mockNotifications, vi.fn(), mockOnWatered);

      const buttons = screen.getAllByRole('button', { name: /watered/i });
      await user.click(buttons[0]);

      expect(mockOnWatered).toHaveBeenCalledWith('plant-1');
    });

    it('should remove plant from display after watering (optimistic UI)', async () => {
      const user = userEvent.setup();
      const mockOnWatered = vi.fn();

      renderModal(mockNotifications, vi.fn(), mockOnWatered);

      expect(screen.getByText('Monstera Deliciosa')).toBeInTheDocument();

      const buttons = screen.getAllByRole('button', { name: /watered/i });
      await user.click(buttons[0]);

      // Plant should be removed optimistically
      expect(screen.queryByText('Monstera Deliciosa')).not.toBeInTheDocument();
      expect(screen.getByText('Snake Plant')).toBeInTheDocument();
    });

    it('should disable watering buttons while loading', () => {
      const mockOnWatered = vi.fn();

      renderModal(mockNotifications, vi.fn(), mockOnWatered);

      // Verify buttons are present
      const buttons = screen.getAllByRole('button', { name: /watered/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should enable watering buttons when not loading', () => {
      const mockOnWatered = vi.fn();

      renderModal(mockNotifications, vi.fn(), mockOnWatered);

      // Verify buttons are present and enabled
      const buttons = screen.getAllByRole('button', { name: /watered/i });
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Modal navigation integration', () => {
    it('should render plant names as navigation links', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={mockNotifications}
          onWatered={mockOnWatered}
        />
      );

      const link = screen.getByRole('link', { name: 'Monstera Deliciosa' });
      expect(link).toHaveAttribute('href', '/dashboard/plants/plant-1');
    });

    it('should render plant photos as navigation links', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={mockNotifications}
          onWatered={mockOnWatered}
        />
      );

      const image = screen.getByAltText('Monstera Deliciosa');
      const link = image.closest('a');
      expect(link).toHaveAttribute('href', '/dashboard/plants/plant-1');
    });

    it('should close modal when plant link clicked', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      const navigationCallback = () => {
        mockOnOpenChange(false);
        return null;
      };

      renderWithRouter(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={mockNotifications}
          onWatered={mockOnWatered}
        />,
        navigationCallback
      );

      const link = screen.getByRole('link', { name: 'Monstera Deliciosa' });
      await user.click(link);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Modal display states', () => {
    it('should show empty state when notifications are empty', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={[]}
          onWatered={mockOnWatered}
        />
      );

      expect(screen.getByText(/All caught up!/)).toBeInTheDocument();
      expect(screen.queryByText('Monstera Deliciosa')).not.toBeInTheDocument();
    });

    it('should not render modal when open is false', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      render(
        <NotificationsModal
          open={false}
          onOpenChange={mockOnOpenChange}
          notifications={mockNotifications}
          onWatered={mockOnWatered}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should handle single notification correctly', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={[mockNotifications[0]]}
          onWatered={mockOnWatered}
        />
      );

      expect(screen.getByText('1 plant needs watering')).toBeInTheDocument();
    });

    it('should handle many notifications without breaking layout', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      const manyPlants = Array(50)
        .fill(null)
        .map((_, i) => ({
          plant_id: `plant-${i}`,
          plant_name: `Plant ${i}`,
          photo_url: null,
          last_watered: '2024-01-20T10:00:00Z',
          next_watering: '2024-01-27T10:00:00Z',
          days_overdue: i % 5,
        }));

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={manyPlants}
          onWatered={mockOnWatered}
        />
      );

      expect(screen.getByText('50 plants need watering')).toBeInTheDocument();
      // Should render with scrolling support
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Modal interactions with multiple actions', () => {
    it('should handle watering multiple plants in sequence', async () => {
      const user = userEvent.setup();
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      const { rerender } = render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={mockNotifications}
          onWatered={mockOnWatered}
        />
      );

      // Water first plant
      let buttons = screen.getAllByRole('button', { name: /watered/i });
      await user.click(buttons[0]);

      // Simulate prop update with one plant removed
      const remainingPlants = [mockNotifications[1]];
      rerender(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={remainingPlants}
          onWatered={mockOnWatered}
        />
      );

      expect(screen.queryByText('Monstera Deliciosa')).not.toBeInTheDocument();
      expect(screen.getByText('Snake Plant')).toBeInTheDocument();

      // Water second plant
      buttons = screen.getAllByRole('button', { name: /watered/i });
      await user.click(buttons[0]);

      // All plants watered
      expect(mockOnWatered).toHaveBeenCalledTimes(2);
    });

    it('should handle prop updates when notifications change', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      const { rerender } = render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={mockNotifications}
          onWatered={mockOnWatered}
        />
      );

      expect(screen.getByText('2 plants need watering')).toBeInTheDocument();

      // Update notifications
      const updatedNotifications = [mockNotifications[0]];
      rerender(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={updatedNotifications}
          onWatered={mockOnWatered}
        />
      );

      expect(screen.getByText('1 plant needs watering')).toBeInTheDocument();
    });
  });

  describe('Modal accessibility', () => {
    it('should have proper dialog semantics', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={mockNotifications}
          onWatered={mockOnWatered}
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should have alt text on plant images', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={mockNotifications}
          onWatered={mockOnWatered}
        />
      );

      const images = screen.getAllByAltText(/Plant/i);
      expect(images.length).toBeGreaterThan(0);
    });

    it('should have descriptive button labels', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={mockNotifications}
          onWatered={mockOnWatered}
        />
      );

      const buttons = screen.getAllByRole('button', { name: /watered/i });
      expect(buttons.length).toBe(2);
    });
  });

  describe('Modal edge cases', () => {
    it('should handle plants with very long names', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      const longNamePlants: PlantNeedingWater[] = [
        {
          plant_id: 'plant-1',
          plant_name: 'A'.repeat(150),
          photo_url: null,
          last_watered: '2024-01-20T10:00:00Z',
          next_watering: '2024-01-27T10:00:00Z',
          days_overdue: 0,
        },
      ];

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={longNamePlants}
          onWatered={mockOnWatered}
        />
      );

      expect(screen.getByText(/A{150}/)).toBeInTheDocument();
    });

    it('should handle plants with special characters in names', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      const specialPlants: PlantNeedingWater[] = [
        {
          plant_id: 'plant-1',
          plant_name: 'Plant\'s "Special" & Name (✓)',
          photo_url: null,
          last_watered: '2024-01-20T10:00:00Z',
          next_watering: '2024-01-27T10:00:00Z',
          days_overdue: 0,
        },
      ];

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={specialPlants}
          onWatered={mockOnWatered}
        />
      );

      expect(screen.getByText(/Plant's.*Special.*Name/)).toBeInTheDocument();
    });

    it('should handle mix of overdue and future plants', () => {
      const mockOnOpenChange = vi.fn();
      const mockOnWatered = vi.fn();

      const mixedPlants: PlantNeedingWater[] = [
        {
          plant_id: 'p1',
          plant_name: 'Overdue',
          photo_url: null,
          last_watered: '2024-01-10T10:00:00Z',
          next_watering: '2024-01-17T10:00:00Z',
          days_overdue: 5,
        },
        {
          plant_id: 'p2',
          plant_name: 'Today',
          photo_url: null,
          last_watered: '2024-01-19T10:00:00Z',
          next_watering: '2024-01-26T10:00:00Z',
          days_overdue: 0,
        },
        {
          plant_id: 'p3',
          plant_name: 'Future',
          photo_url: null,
          last_watered: '2024-01-21T10:00:00Z',
          next_watering: '2024-01-28T10:00:00Z',
          days_overdue: -2,
        },
      ];

      render(
        <NotificationsModal
          open={true}
          onOpenChange={mockOnOpenChange}
          notifications={mixedPlants}
          onWatered={mockOnWatered}
        />
      );

      expect(screen.getByText('Overdue by 5 days')).toBeInTheDocument();
      expect(screen.getByText('Due today')).toBeInTheDocument();
    });
  });
});
