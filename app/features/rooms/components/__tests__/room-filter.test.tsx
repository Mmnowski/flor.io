import { createMockRoom, createMockRooms } from '~/__tests__/factories';
import { RoomFilter } from '~/features/rooms/components';

import { RouterProvider, createMemoryRouter } from 'react-router';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Wrapper to provide router context for dialogs
const renderWithRouter = (component: React.ReactElement) => {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: component,
      },
      {
        path: '/api/rooms',
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

describe('RoomFilter', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render "All Plants" button', () => {
      const rooms = createMockRooms(2);
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={null}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      expect(screen.getByRole('button', { name: /all plants/i })).toBeInTheDocument();
    });

    it('should render room chips for each room', () => {
      const rooms = createMockRooms(3);
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={null}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      rooms.forEach((room) => {
        expect(screen.getByText(room.name)).toBeInTheDocument();
      });
    });

    it('should render "New Room" button', () => {
      const rooms = createMockRooms(2);
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={null}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      expect(screen.getByRole('button', { name: /new room/i })).toBeInTheDocument();
    });

    it('should show simplified view when no rooms exist', () => {
      renderWithRouter(
        <RoomFilter
          rooms={[]}
          activeRoomId={null}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      expect(screen.getByText(/organize your plants by room/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /new room/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /all plants/i })).not.toBeInTheDocument();
    });
  });

  describe('active state', () => {
    it('should highlight "All Plants" when activeRoomId is null', () => {
      const rooms = createMockRooms(2);
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={null}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      const allPlantsButton = screen.getByRole('button', { name: /all plants/i });
      expect(allPlantsButton).toHaveClass('bg-emerald-600');
    });

    it('should highlight the active room chip', () => {
      const rooms = createMockRooms(3);
      const activeRoom = rooms[1];
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={activeRoom.id}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      const activeRoomContainer = screen.getByText(activeRoom.name).closest('div');
      expect(activeRoomContainer).toHaveClass('bg-emerald-600');
    });
  });

  describe('interactions', () => {
    it('should call onFilterChange with null when "All Plants" is clicked', async () => {
      const user = userEvent.setup();
      const rooms = createMockRooms(2);
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={rooms[0].id}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      await user.click(screen.getByRole('button', { name: /all plants/i }));
      expect(mockOnFilterChange).toHaveBeenCalledWith(null);
    });

    it('should call onFilterChange with room id when room is clicked', async () => {
      const user = userEvent.setup();
      const rooms = createMockRooms(2);
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={null}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      await user.click(screen.getByText(rooms[0].name));
      expect(mockOnFilterChange).toHaveBeenCalledWith(rooms[0].id);
    });
  });

  describe('delete functionality', () => {
    it('should show delete button on room chips', () => {
      const rooms = createMockRooms(2);
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={null}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      // Each room should have a delete button with aria-label
      rooms.forEach((room) => {
        expect(screen.getByRole('button', { name: `Delete ${room.name}` })).toBeInTheDocument();
      });
    });

    it('should open delete dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      const rooms = createMockRooms(1);
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={null}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      await user.click(screen.getByRole('button', { name: `Delete ${rooms[0].name}` }));

      // Delete dialog should appear
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      // Check for dialog title (heading element)
      expect(screen.getByRole('heading', { name: /delete room/i })).toBeInTheDocument();
    });

    it('should not trigger filter change when clicking delete button', async () => {
      const user = userEvent.setup();
      const rooms = createMockRooms(1);
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={null}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      await user.click(screen.getByRole('button', { name: `Delete ${rooms[0].name}` }));

      // onFilterChange should not be called
      expect(mockOnFilterChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria-label for delete buttons', () => {
      const rooms = createMockRooms(2);
      renderWithRouter(
        <RoomFilter
          rooms={rooms}
          activeRoomId={null}
          onFilterChange={mockOnFilterChange}
          plantCounts={{}}
        />
      );

      rooms.forEach((room) => {
        const deleteButton = screen.getByRole('button', { name: `Delete ${room.name}` });
        expect(deleteButton).toHaveAttribute('aria-label', `Delete ${room.name}`);
      });
    });
  });
});
