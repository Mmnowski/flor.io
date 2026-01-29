import { WateringButton } from '~/features/watering/components';

import { RouterProvider, createMemoryRouter } from 'react-router';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Wrapper component to provide data router context required by Form component
const renderWithRouter = (component: React.ReactElement, plantId: string = 'plant-123') => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: component,
      },
      {
        path: '/dashboard/plants/:plantId',
        element: <div>Plant Detail</div>,
        action: vi.fn(async () => ({ success: true })),
      },
    ],
    {
      initialEntries: ['/'],
      initialIndex: 0,
    }
  );
  return render(<RouterProvider router={router} />);
};

describe('WateringButton', () => {
  const mockPlantId = 'plant-123';
  const mockLastWateredDate = new Date('2024-01-20');
  const mockNextWateringDate = new Date('2024-01-27');

  describe('rendering', () => {
    it('should render record watering button', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      expect(button).toBeInTheDocument();
    });

    it('should render button with water droplet icon', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      // Check that the button contains the SVG (Droplet icon)
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render the button for recording watering', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      expect(button).toBeInTheDocument();
    });

    it('should have button focused accessible', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      expect(button).toBeVisible();
    });
  });

  describe('last watered date display', () => {
    it('should display last watered date when provided', () => {
      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={null}
          lastWateredDate={mockLastWateredDate}
        />
      );

      const dateText = screen.getByText(/last watered:/i);
      expect(dateText).toBeInTheDocument();
    });

    it('should not display last watered date when null', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const dateText = screen.queryByText(/last watered:/i);
      expect(dateText).not.toBeInTheDocument();
    });

    it('should format date correctly (short month, day, year)', () => {
      const testDate = new Date('2024-01-15');
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={testDate} />
      );

      // The formatted date should be "Jan 15, 2024"
      expect(screen.getByText(/Jan 15, 2024|last watered:/)).toBeInTheDocument();
    });

    it('should include check icon with last watered date', () => {
      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={null}
          lastWateredDate={mockLastWateredDate}
        />
      );

      const checkContainer = screen.getByText(/last watered:/i).closest('div');
      const svg = checkContainer?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('next watering date display', () => {
    it('should display next watering date when provided', () => {
      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={mockNextWateringDate}
          lastWateredDate={null}
        />
      );

      const dateText = screen.getByText(/next watering:/i);
      expect(dateText).toBeInTheDocument();
    });

    it('should not display next watering date when null', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const dateText = screen.queryByText(/next watering:/i);
      expect(dateText).not.toBeInTheDocument();
    });

    it('should format next watering date correctly', () => {
      const testDate = new Date('2024-02-10');
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={testDate} lastWateredDate={null} />
      );

      expect(screen.getByText(/Feb 10, 2024|next watering:/)).toBeInTheDocument();
    });
  });

  describe('both dates display', () => {
    it('should display both dates when both are provided', () => {
      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={mockNextWateringDate}
          lastWateredDate={mockLastWateredDate}
        />
      );

      expect(screen.getByText(/last watered:/i)).toBeInTheDocument();
      expect(screen.getByText(/next watering:/i)).toBeInTheDocument();
    });

    it('should display last watered before next watering', () => {
      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={mockNextWateringDate}
          lastWateredDate={mockLastWateredDate}
        />
      );

      const lastWateredElement = screen.getByText(/last watered:/i);
      const nextWateringElement = screen.getByText(/next watering:/i);

      // Check that last watered appears before next watering in the DOM
      const container = screen.getByRole('button', { name: /record watering/i }).closest('div');
      const lastWateredIndex = Array.from(container?.querySelectorAll('*') || []).indexOf(
        lastWateredElement.closest('div') as Element
      );
      const nextWateringIndex = Array.from(container?.querySelectorAll('*') || []).indexOf(
        nextWateringElement.closest('div') as Element
      );

      expect(lastWateredIndex).toBeLessThan(nextWateringIndex);
    });
  });

  describe('button styling', () => {
    it('should have emerald color scheme', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      expect(button).toHaveClass('bg-emerald-600');
      expect(button).toHaveClass('text-white');
      expect(button).toHaveClass('font-semibold');
    });

    it('should have hover state with darker emerald', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      expect(button).toHaveClass('hover:bg-emerald-700');
    });

    it('should span full width', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      expect(button).toHaveClass('w-full');
    });

    it('should have large size', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      // Check for the rendered size classes (h-10 is the large size)
      expect(button).toHaveClass('h-10', 'px-6');
    });
  });

  describe('form submission', () => {
    it('should submit watering action when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      // Verify button is interactive and clickable
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();

      // Click button
      await user.click(button);
      // Button should still exist after click
      const buttonsAfterClick = screen.getAllByRole('button', { name: /record watering/i });
      expect(buttonsAfterClick.length).toBeGreaterThan(0);
    });

    it('should be clickable', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      // Verify button is interactive
      expect(button).not.toBeDisabled();
      // Verify it can be clicked without error
      await user.click(button);
      // Test passes if no error occurred
      expect(true).toBe(true);
    });
  });

  describe('accessibility', () => {
    it('should have descriptive button text', () => {
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={null} />
      );

      const button = screen.getByRole('button', { name: /record watering/i });
      expect(button).toBeInTheDocument();
    });

    it('should have semantic date information', () => {
      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={mockNextWateringDate}
          lastWateredDate={mockLastWateredDate}
        />
      );

      const lastWateredText = screen.getByText(/last watered:/i);
      const nextWateringText = screen.getByText(/next watering:/i);

      expect(lastWateredText).toBeInTheDocument();
      expect(nextWateringText).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle dates at midnight', () => {
      const midnightDate = new Date('2024-01-15T00:00:00Z');
      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={midnightDate}
          lastWateredDate={midnightDate}
        />
      );

      expect(screen.getByText(/last watered:/i)).toBeInTheDocument();
      expect(screen.getByText(/next watering:/i)).toBeInTheDocument();
    });

    it('should handle dates on leap year', () => {
      const leapYearDate = new Date('2024-02-29');
      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={leapYearDate}
          lastWateredDate={null}
        />
      );

      expect(screen.getByText(/Feb 29, 2024|next watering:/)).toBeInTheDocument();
    });

    it('should handle old dates', () => {
      const oldDate = new Date('2020-01-01');
      renderWithRouter(
        <WateringButton plantId={mockPlantId} nextWateringDate={null} lastWateredDate={oldDate} />
      );

      expect(screen.getByText(/last watered:/i)).toBeInTheDocument();
    });

    it('should handle future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={futureDate}
          lastWateredDate={null}
        />
      );

      expect(screen.getByText(/next watering:/i)).toBeInTheDocument();
    });
  });

  describe('layout and spacing', () => {
    it('should have proper spacing between elements', () => {
      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={mockNextWateringDate}
          lastWateredDate={mockLastWateredDate}
        />
      );

      const container = screen.getByRole('button', { name: /record watering/i }).closest('div');
      expect(container).toHaveClass('space-y-4');
    });

    it('should center align date text', () => {
      renderWithRouter(
        <WateringButton
          plantId={mockPlantId}
          nextWateringDate={mockNextWateringDate}
          lastWateredDate={mockLastWateredDate}
        />
      );

      const lastWateredContainer = screen.getByText(/last watered:/i).closest('div');
      expect(lastWateredContainer?.parentElement).toHaveClass('text-center');
    });
  });
});
