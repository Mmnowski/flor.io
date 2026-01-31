import { createMockRoom } from '~/__tests__/factories';
import { DeleteRoomDialog } from '~/features/rooms/components';

import { RouterProvider, createMemoryRouter } from 'react-router';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Mock action for testing submissions
const mockAction = vi.fn(async () => ({ success: true }));

const renderWithRouter = (component: React.ReactElement) => {
  mockAction.mockClear();
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: component,
      },
      {
        path: '/api/rooms',
        action: mockAction,
      },
    ],
    {
      initialEntries: ['/'],
      initialIndex: 0,
    }
  );
  return render(<RouterProvider router={router} />);
};

describe('DeleteRoomDialog', () => {
  const mockRoom = createMockRoom({ id: 'room-123', name: 'Living Room' });
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render dialog when open', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /delete room/i })).toBeInTheDocument();
    });

    it('should not render dialog when closed', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={false}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display room name in confirmation message', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByText(new RegExp(mockRoom.name))).toBeInTheDocument();
    });

    it('should show warning text about irreversibility', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });
  });

  describe('plant count warning', () => {
    it('should show warning when room has plants', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={5}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByText(/this room has 5 plants/i)).toBeInTheDocument();
      expect(screen.getByText(/will be unassigned/i)).toBeInTheDocument();
    });

    it('should use singular form for 1 plant', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={1}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByText(/this room has 1 plant/i)).toBeInTheDocument();
      expect(screen.getByText(/this plant will be unassigned/i)).toBeInTheDocument();
    });

    it('should not show warning when room has no plants', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.queryByText(/this room has/i)).not.toBeInTheDocument();
    });
  });

  describe('buttons', () => {
    it('should render cancel button', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render delete button', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      expect(screen.getByRole('button', { name: /delete room/i })).toBeInTheDocument();
    });

    it('should call onOpenChange with false when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('delete action', () => {
    it('should submit delete request when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /delete room/i }));

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled();
      });
    });

    it('should show loading state while deleting', async () => {
      const user = userEvent.setup();
      // Make action take some time
      mockAction.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /delete room/i }));

      // Button should show loading state
      expect(screen.getByRole('button', { name: /deleting/i })).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have destructive variant on delete button', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete room/i });
      // Check for destructive styling via data attribute
      expect(deleteButton).toHaveAttribute('data-variant', 'destructive');
    });

    it('should show trash icon in title', () => {
      renderWithRouter(
        <DeleteRoomDialog
          room={mockRoom}
          plantCount={0}
          open={true}
          onOpenChange={mockOnOpenChange}
        />
      );

      const title = screen.getByRole('heading', { name: /delete room/i });
      const svg = title.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
