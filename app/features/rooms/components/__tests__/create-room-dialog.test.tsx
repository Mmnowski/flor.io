import { CreateRoomDialog } from '~/features/rooms/components';

import { RouterProvider, createMemoryRouter } from 'react-router';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Mock action for testing submissions
const mockAction = vi.fn(async () => ({ success: true, room: { id: 'new-room', name: 'Test' } }));

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

describe('CreateRoomDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trigger button', () => {
    it('should render "New Room" trigger button', () => {
      renderWithRouter(<CreateRoomDialog />);

      expect(screen.getByRole('button', { name: /new room/i })).toBeInTheDocument();
    });

    it('should have plus icon in trigger button', () => {
      renderWithRouter(<CreateRoomDialog />);

      const button = screen.getByRole('button', { name: /new room/i });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have emerald styling on trigger button', () => {
      renderWithRouter(<CreateRoomDialog />);

      const button = screen.getByRole('button', { name: /new room/i });
      expect(button).toHaveClass('bg-emerald-600');
    });
  });

  describe('dialog opening', () => {
    it('should open dialog when trigger is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should show dialog title', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      expect(screen.getByText(/create new room/i)).toBeInTheDocument();
    });

    it('should show dialog description', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      expect(screen.getByText(/add a new room to organize your plants/i)).toBeInTheDocument();
    });
  });

  describe('form elements', () => {
    it('should render room name input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      expect(screen.getByLabelText(/room name/i)).toBeInTheDocument();
    });

    it('should render cancel button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render create button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      expect(screen.getByRole('button', { name: /create room/i })).toBeInTheDocument();
    });

    it('should show character limit hint', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      expect(screen.getByText(/maximum 50 characters/i)).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should disable create button when input is empty', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      const createButton = screen.getByRole('button', { name: /create room/i });
      expect(createButton).toBeDisabled();
    });

    it('should enable create button when input has value', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      const input = screen.getByLabelText(/room name/i);
      await user.type(input, 'Living Room');

      const createButton = screen.getByRole('button', { name: /create room/i });
      expect(createButton).not.toBeDisabled();
    });

    it('should disable create button for whitespace-only input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      const input = screen.getByLabelText(/room name/i);
      await user.type(input, '   ');

      const createButton = screen.getByRole('button', { name: /create room/i });
      expect(createButton).toBeDisabled();
    });
  });

  describe('form submission', () => {
    it('should submit form when create button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      const input = screen.getByLabelText(/room name/i);
      await user.type(input, 'Living Room');

      await user.click(screen.getByRole('button', { name: /create room/i }));

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled();
      });
    });

    it('should show loading state while creating', async () => {
      const user = userEvent.setup();
      mockAction.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true, room: { id: 'new', name: 'Test' } }), 100)
          )
      );

      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      const input = screen.getByLabelText(/room name/i);
      await user.type(input, 'Living Room');

      await user.click(screen.getByRole('button', { name: /create room/i }));

      expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
    });

    it('should close dialog on successful creation', async () => {
      const user = userEvent.setup();
      mockAction.mockResolvedValueOnce({ success: true, room: { id: 'new', name: 'Test' } });

      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      const input = screen.getByLabelText(/room name/i);
      await user.type(input, 'Living Room');

      await user.click(screen.getByRole('button', { name: /create room/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('cancel behavior', () => {
    it('should close dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should clear input when dialog is closed', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      // Open dialog and type
      await user.click(screen.getByRole('button', { name: /new room/i }));
      const input = screen.getByLabelText(/room name/i);
      await user.type(input, 'Living Room');

      // Close dialog
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Reopen dialog
      await user.click(screen.getByRole('button', { name: /new room/i }));

      // Input should be empty
      const newInput = screen.getByLabelText(/room name/i);
      expect(newInput).toHaveValue('');
    });
  });

  describe('input attributes', () => {
    it('should have maxLength of 50', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      const input = screen.getByLabelText(/room name/i);
      expect(input).toHaveAttribute('maxLength', '50');
    });

    it('should have placeholder text', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      const input = screen.getByLabelText(/room name/i);
      expect(input).toHaveAttribute('placeholder');
    });

    it('should be required', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      const input = screen.getByLabelText(/room name/i);
      expect(input).toBeRequired();
    });

    it('should autofocus on open', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRoomDialog />);

      await user.click(screen.getByRole('button', { name: /new room/i }));

      const input = screen.getByLabelText(/room name/i);
      expect(document.activeElement).toBe(input);
    });
  });
});
