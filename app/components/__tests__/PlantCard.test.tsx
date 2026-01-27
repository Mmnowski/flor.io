import { PlantCard } from '~/components/plant-card';

import { MemoryRouter } from 'react-router';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  createMockOverduePlant,
  createMockPlantDueToday,
  createMockPlantWithWatering,
} from '../../__tests__/factories';

describe('PlantCard', () => {
  // Wrapper component to provide Router context
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  describe('rendering', () => {
    it('should render plant name', () => {
      const plant = createMockPlantWithWatering({ name: 'Monstera Deliciosa' });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Monstera Deliciosa')).toBeInTheDocument();
    });

    it('should render as a link to plant detail page', () => {
      const plant = createMockPlantWithWatering({ id: 'plant-abc-123' });
      renderWithRouter(<PlantCard plant={plant} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/dashboard/plants/plant-abc-123');
    });

    it('should render plant photo when photo_url is provided', () => {
      const plant = createMockPlantWithWatering({
        photo_url: 'https://example.com/plant.jpg',
        name: 'Photo Plant',
      });
      renderWithRouter(<PlantCard plant={plant} />);

      const image = screen.getByAltText('Photo Plant');
      expect(image).toHaveAttribute('src', 'https://example.com/plant.jpg');
      expect(image).toHaveAttribute('loading', 'lazy');
    });

    it('should render placeholder icon when no photo_url', () => {
      const plant = createMockPlantWithWatering({ photo_url: null });
      renderWithRouter(<PlantCard plant={plant} />);

      // Check that the SVG (Leaf icon) is present by checking for svg element
      const container = screen.getByText(plant.name).closest('a');
      const svg = container?.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render with plant inside a Card component', () => {
      const plant = createMockPlantWithWatering({ name: 'Test Plant' });
      renderWithRouter(<PlantCard plant={plant} />);

      const link = screen.getByRole('link');
      // The Card component is inside the Link
      const card = link.querySelector('[class*="overflow-hidden"]');
      expect(card).toHaveClass('overflow-hidden');
    });
  });

  describe('room display', () => {
    it('should display room badge when room_name is provided', () => {
      const plant = createMockPlantWithWatering({ room_name: 'Living Room' });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Living Room')).toBeInTheDocument();
    });

    it('should not display room badge when room_name is null', () => {
      const plant = createMockPlantWithWatering({ room_name: null });
      renderWithRouter(<PlantCard plant={plant} />);

      // Check that no badge exists by looking for the badge role
      expect(screen.queryByText(/living room|bedroom|kitchen/i)).not.toBeInTheDocument();
    });

    it('should display correct room name in badge', () => {
      const plant = createMockPlantWithWatering({ room_name: 'Bedroom' });
      renderWithRouter(<PlantCard plant={plant} />);

      const badge = screen.getByText('Bedroom');
      expect(badge).toHaveClass('text-xs');
    });
  });

  describe('watering status display', () => {
    it('should show overdue status when plant is overdue', () => {
      const plant = createMockOverduePlant({ days_until_watering: -3 });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('3 days overdue')).toBeInTheDocument();
      expect(screen.getByText('3 days overdue')).toHaveClass('bg-red-100');
    });

    it('should show "Water today" status when plant is due today', () => {
      const plant = createMockPlantDueToday();
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Water today')).toBeInTheDocument();
      expect(screen.getByText('Water today')).toHaveClass('bg-amber-100');
    });

    it('should show "Tomorrow" when plant is due in 1 day', () => {
      const plant = createMockPlantWithWatering({ days_until_watering: 1 });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Tomorrow')).toBeInTheDocument();
      expect(screen.getByText('Tomorrow')).toHaveClass('bg-slate-100');
    });

    it('should show days count for future watering dates', () => {
      const plant = createMockPlantWithWatering({ days_until_watering: 5 });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('In 5 days')).toBeInTheDocument();
      expect(screen.getByText('In 5 days')).toHaveClass('bg-slate-100');
    });

    it('should display watering status in center-aligned box', () => {
      const plant = createMockPlantWithWatering();
      renderWithRouter(<PlantCard plant={plant} />);

      const statusBox = screen.getByText(/In \d+ days|Water today|Tomorrow|\d+ days overdue/);
      expect(statusBox).toHaveClass('rounded-md', 'text-sm', 'font-medium', 'text-center');
    });
  });

  describe('watering color coding', () => {
    it('should use red background for overdue status', () => {
      const plant = createMockOverduePlant();
      renderWithRouter(<PlantCard plant={plant} />);

      const status = screen.getByText(/days overdue/);
      expect(status).toHaveClass('bg-red-100');
      expect(status).toHaveClass('text-red-800');
    });

    it('should use amber background for due today status', () => {
      const plant = createMockPlantDueToday();
      renderWithRouter(<PlantCard plant={plant} />);

      const status = screen.getByText('Water today');
      expect(status).toHaveClass('bg-amber-100');
      expect(status).toHaveClass('text-amber-800');
    });

    it('should use slate background for future watering dates', () => {
      const plant = createMockPlantWithWatering({ days_until_watering: 5 });
      renderWithRouter(<PlantCard plant={plant} />);

      const status = screen.getByText('In 5 days');
      expect(status).toHaveClass('bg-slate-100');
      expect(status).toHaveClass('text-slate-800');
    });
  });

  describe('long plant names', () => {
    it('should handle long plant names gracefully', () => {
      const longName = 'Monstera Deliciosa Variegata Alba with Extra Long Name';
      const plant = createMockPlantWithWatering({ name: longName });
      renderWithRouter(<PlantCard plant={plant} />);

      const name = screen.getByText(longName);
      expect(name).toHaveClass('line-clamp-2'); // Should limit to 2 lines
    });

    it('should render truncated long names without overflow', () => {
      const plant = createMockPlantWithWatering({
        name: 'This is an extremely long plant name that should be clamped to prevent overflow',
      });
      renderWithRouter(<PlantCard plant={plant} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveClass('line-clamp-2');
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      const plant = createMockPlantWithWatering({ name: 'Test Plant' });
      renderWithRouter(<PlantCard plant={plant} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('should have alt text for plant photo', () => {
      const plant = createMockPlantWithWatering({
        name: 'Beautiful Monstera',
        photo_url: 'https://example.com/plant.jpg',
      });
      renderWithRouter(<PlantCard plant={plant} />);

      const image = screen.getByAltText('Beautiful Monstera');
      expect(image).toBeInTheDocument();
    });

    it('should have accessible link with proper href', () => {
      const plant = createMockPlantWithWatering();
      renderWithRouter(<PlantCard plant={plant} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href');
    });
  });

  describe('edge cases', () => {
    it('should handle plant with only required fields', () => {
      const plant = createMockPlantWithWatering({
        photo_url: null,
        room_name: null,
        name: 'Simple Plant',
      });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Simple Plant')).toBeInTheDocument();
      expect(screen.queryByText(/Living Room|Bedroom/)).not.toBeInTheDocument();
    });

    it('should handle zero days until watering', () => {
      const plant = createMockPlantWithWatering({ days_until_watering: 0 });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Water today')).toBeInTheDocument();
    });

    it('should handle large number of days', () => {
      const plant = createMockPlantWithWatering({ days_until_watering: 365 });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('In 365 days')).toBeInTheDocument();
    });
  });

  describe('styling and layout', () => {
    it('should have hover effect classes', () => {
      const plant = createMockPlantWithWatering();
      renderWithRouter(<PlantCard plant={plant} />);

      const link = screen.getByRole('link');
      const card = link.querySelector('[class*="hover:"]');
      expect(card).toHaveClass('hover:shadow-lg');
      expect(card).toHaveClass('transition-shadow');
    });

    it('should have flex layout for proper spacing', () => {
      const plant = createMockPlantWithWatering();
      renderWithRouter(<PlantCard plant={plant} />);

      const link = screen.getByRole('link');
      const card = link.querySelector('.flex');
      expect(card).toHaveClass('flex', 'flex-col');
    });
  });
});
