import { type SortOption, SortSelector } from '~/features/plants/components';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('SortSelector', () => {
  const mockOnSortChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render "Sort by:" label', () => {
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      expect(screen.getByText(/sort by:/i)).toBeInTheDocument();
    });

    it('should render watering sort button', () => {
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      expect(screen.getByRole('button', { name: /watering/i })).toBeInTheDocument();
    });

    it('should render name sort button', () => {
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      expect(screen.getByRole('button', { name: /name/i })).toBeInTheDocument();
    });

    it('should render icons in buttons', () => {
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      const wateringButton = screen.getByRole('button', { name: /watering/i });
      const nameButton = screen.getByRole('button', { name: /name/i });

      expect(wateringButton.querySelector('svg')).toBeInTheDocument();
      expect(nameButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should highlight watering button when active', () => {
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      const wateringButton = screen.getByRole('button', { name: /watering/i });
      expect(wateringButton).toHaveClass('bg-emerald-600');
      expect(wateringButton).toHaveClass('text-white');
    });

    it('should highlight name button when active', () => {
      render(<SortSelector activeSort="name" onSortChange={mockOnSortChange} />);

      const nameButton = screen.getByRole('button', { name: /name/i });
      expect(nameButton).toHaveClass('bg-emerald-600');
      expect(nameButton).toHaveClass('text-white');
    });

    it('should not highlight inactive watering button', () => {
      render(<SortSelector activeSort="name" onSortChange={mockOnSortChange} />);

      const wateringButton = screen.getByRole('button', { name: /watering/i });
      expect(wateringButton).not.toHaveClass('bg-emerald-600');
      expect(wateringButton).toHaveClass('bg-slate-200');
    });

    it('should not highlight inactive name button', () => {
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      const nameButton = screen.getByRole('button', { name: /name/i });
      expect(nameButton).not.toHaveClass('bg-emerald-600');
      expect(nameButton).toHaveClass('bg-slate-200');
    });
  });

  describe('interactions', () => {
    it('should call onSortChange with "watering" when watering button is clicked', async () => {
      const user = userEvent.setup();
      render(<SortSelector activeSort="name" onSortChange={mockOnSortChange} />);

      await user.click(screen.getByRole('button', { name: /watering/i }));

      expect(mockOnSortChange).toHaveBeenCalledWith('watering');
    });

    it('should call onSortChange with "name" when name button is clicked', async () => {
      const user = userEvent.setup();
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      await user.click(screen.getByRole('button', { name: /name/i }));

      expect(mockOnSortChange).toHaveBeenCalledWith('name');
    });

    it('should call onSortChange even when clicking active button', async () => {
      const user = userEvent.setup();
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      await user.click(screen.getByRole('button', { name: /watering/i }));

      expect(mockOnSortChange).toHaveBeenCalledWith('watering');
    });
  });

  describe('styling', () => {
    it('should have rounded-full class on buttons', () => {
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('rounded-full');
      });
    });

    it('should have transition-colors class for hover effect', () => {
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('transition-colors');
      });
    });

    it('should have whitespace-nowrap to prevent text wrapping', () => {
      render(<SortSelector activeSort="watering" onSortChange={mockOnSortChange} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('whitespace-nowrap');
      });
    });
  });

  describe('layout', () => {
    it('should use flexbox layout', () => {
      const { container } = render(
        <SortSelector activeSort="watering" onSortChange={mockOnSortChange} />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
    });

    it('should have gap between elements', () => {
      const { container } = render(
        <SortSelector activeSort="watering" onSortChange={mockOnSortChange} />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('gap-2');
    });
  });
});
