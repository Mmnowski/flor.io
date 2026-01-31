import {
  createMockOverduePlant,
  createMockPlantDueToday,
  createMockPlantMinimal,
  createMockPlantWithWatering,
} from '~/__tests__/factories';
import { PlantCard } from '~/features/plants/components';

import { RouterProvider, createMemoryRouter } from 'react-router';

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// Wrapper to provide router context for Link component
const renderWithRouter = (component: React.ReactElement) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: component,
      },
      {
        path: '/dashboard/plants/:plantId',
        element: <div>Plant Detail</div>,
      },
    ],
    {
      initialEntries: ['/'],
      initialIndex: 0,
    }
  );
  return render(<RouterProvider router={router} />);
};

describe('PlantCard', () => {
  describe('rendering', () => {
    it('should render plant name', () => {
      const plant = createMockPlantWithWatering({ name: 'Test Monstera' });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Test Monstera')).toBeInTheDocument();
    });

    it('should render as a link to plant details', () => {
      const plant = createMockPlantWithWatering({ id: 'plant-123' });
      renderWithRouter(<PlantCard plant={plant} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/dashboard/plants/plant-123');
    });

    it('should render room name when available', () => {
      const plant = createMockPlantWithWatering({ room_name: 'Living Room' });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Living Room')).toBeInTheDocument();
    });

    it('should not render room badge when room_name is null', () => {
      const plant = createMockPlantMinimal({ room_name: null });
      renderWithRouter(<PlantCard plant={plant} />);

      // Badge component uses role="badge" or similar
      const badges = screen.queryAllByText(/Living Room|Bedroom|Kitchen/);
      expect(badges).toHaveLength(0);
    });
  });

  describe('photo display', () => {
    it('should render plant photo when available', () => {
      const plant = createMockPlantWithWatering({
        photo_url: 'https://example.com/plant.jpg',
        name: 'My Plant',
      });
      renderWithRouter(<PlantCard plant={plant} />);

      const img = screen.getByRole('img', { name: 'My Plant' });
      expect(img).toHaveAttribute('src', 'https://example.com/plant.jpg');
    });

    it('should render placeholder when no photo', () => {
      const plant = createMockPlantMinimal({ photo_url: null, name: 'No Photo Plant' });
      renderWithRouter(<PlantCard plant={plant} />);

      // Should have a placeholder with accessible text
      expect(screen.getByRole('img', { name: /no photo available/i })).toBeInTheDocument();
    });

    it('should have lazy loading on images', () => {
      const plant = createMockPlantWithWatering({
        photo_url: 'https://example.com/plant.jpg',
      });
      renderWithRouter(<PlantCard plant={plant} />);

      const img = screen.getByRole('img', { name: plant.name });
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  describe('watering status', () => {
    it('should show days until watering', () => {
      const plant = createMockPlantWithWatering({ days_until_watering: 3, is_overdue: false });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText(/in 3 days/i)).toBeInTheDocument();
    });

    it('should show "Water today" when due today', () => {
      const plant = createMockPlantDueToday();
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText(/water today/i)).toBeInTheDocument();
    });

    it('should show "Tomorrow" when due tomorrow', () => {
      const plant = createMockPlantWithWatering({ days_until_watering: 1, is_overdue: false });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText(/tomorrow/i)).toBeInTheDocument();
    });

    it('should show overdue status with days count', () => {
      const plant = createMockOverduePlant({ days_until_watering: -2 });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText(/2 days overdue/i)).toBeInTheDocument();
    });
  });

  describe('watering status colors', () => {
    it('should have red styling for overdue plants', () => {
      const plant = createMockOverduePlant();
      renderWithRouter(<PlantCard plant={plant} />);

      const statusBadge = screen.getByText(/overdue/i);
      expect(statusBadge).toHaveClass('bg-red-100');
    });

    it('should have amber styling for plants due today', () => {
      const plant = createMockPlantDueToday();
      renderWithRouter(<PlantCard plant={plant} />);

      const statusBadge = screen.getByText(/water today/i);
      expect(statusBadge).toHaveClass('bg-amber-100');
    });

    it('should have slate styling for plants not due', () => {
      const plant = createMockPlantWithWatering({ days_until_watering: 5, is_overdue: false });
      renderWithRouter(<PlantCard plant={plant} />);

      const statusBadge = screen.getByText(/in 5 days/i);
      expect(statusBadge).toHaveClass('bg-slate-100');
    });
  });

  describe('watering amount badge', () => {
    it('should show "Light" for low watering amount', () => {
      const plant = createMockPlantWithWatering({ watering_amount: 'low' });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('should show "Moderate" for mid watering amount', () => {
      const plant = createMockPlantWithWatering({ watering_amount: 'mid' });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Moderate')).toBeInTheDocument();
    });

    it('should show "Heavy" for heavy watering amount', () => {
      const plant = createMockPlantWithWatering({ watering_amount: 'heavy' });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Heavy')).toBeInTheDocument();
    });

    it('should show "Unknown" for null watering amount', () => {
      const plant = createMockPlantMinimal({ watering_amount: null });
      renderWithRouter(<PlantCard plant={plant} />);

      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('watering amount colors', () => {
    it('should have slate styling for light watering', () => {
      const plant = createMockPlantWithWatering({ watering_amount: 'low' });
      renderWithRouter(<PlantCard plant={plant} />);

      const badge = screen.getByText('Light').closest('div');
      expect(badge).toHaveClass('bg-slate-100');
    });

    it('should have emerald styling for moderate watering', () => {
      const plant = createMockPlantWithWatering({ watering_amount: 'mid' });
      renderWithRouter(<PlantCard plant={plant} />);

      const badge = screen.getByText('Moderate').closest('div');
      expect(badge).toHaveClass('bg-emerald-100');
    });

    it('should have blue styling for heavy watering', () => {
      const plant = createMockPlantWithWatering({ watering_amount: 'heavy' });
      renderWithRouter(<PlantCard plant={plant} />);

      const badge = screen.getByText('Heavy').closest('div');
      expect(badge).toHaveClass('bg-blue-100');
    });
  });

  describe('card styling', () => {
    it('should have hover effect', () => {
      const plant = createMockPlantWithWatering();
      const { container } = renderWithRouter(<PlantCard plant={plant} />);

      const card = container.querySelector('[class*="hover:shadow"]');
      expect(card).toBeInTheDocument();
    });

    it('should have rounded top corners on image container', () => {
      const plant = createMockPlantWithWatering({
        photo_url: 'https://example.com/plant.jpg',
      });
      const { container } = renderWithRouter(<PlantCard plant={plant} />);

      const imageContainer = container.querySelector('.rounded-t-xl');
      expect(imageContainer).toBeInTheDocument();
    });

    it('should have aspect-square image container', () => {
      const plant = createMockPlantWithWatering();
      const { container } = renderWithRouter(<PlantCard plant={plant} />);

      const imageContainer = container.querySelector('.aspect-square');
      expect(imageContainer).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have meaningful link text (plant name)', () => {
      const plant = createMockPlantWithWatering({ name: 'My Monstera' });
      renderWithRouter(<PlantCard plant={plant} />);

      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('My Monstera');
    });

    it('should have alt text for placeholder image', () => {
      const plant = createMockPlantMinimal({ name: 'Test Plant', photo_url: null });
      renderWithRouter(<PlantCard plant={plant} />);

      const placeholder = screen.getByRole('img');
      expect(placeholder).toHaveAttribute('aria-label', 'No photo available for Test Plant');
    });
  });
});
