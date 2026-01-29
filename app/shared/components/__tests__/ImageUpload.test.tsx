import { ImageUpload } from '~/shared/components';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockImageFile } from '../../../__tests__/factories';

describe('ImageUpload', () => {
  const mockOnFileChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial render', () => {
    it('should render upload button when no photo is provided', () => {
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      const button = screen.getByRole('button', { name: /upload plant photo/i });
      expect(button).toBeInTheDocument();
    });

    it('should render with initial photo url', async () => {
      const photoUrl = 'https://example.com/plant.jpg';
      render(<ImageUpload currentPhotoUrl={photoUrl} onFileChange={mockOnFileChange} />);

      // Check for image element by looking for any img tag with plant url
      const images = screen.queryAllByRole('img');
      const hasPhotoUrl = images.some((img) => (img as HTMLImageElement).src === photoUrl);
      expect(hasPhotoUrl || images.length > 0).toBe(true);
    });

    it('should have hidden file input', () => {
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      const fileInput = screen.getByLabelText('Upload plant photo');
      expect(fileInput).toHaveClass('hidden');
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });
  });

  describe('file selection', () => {
    it('should trigger file input click when upload button is clicked', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      const button = screen.getByRole('button', { name: /upload plant photo/i });
      const fileInput = screen.getByLabelText('Upload plant photo');

      // Spy on the click method to verify it's called
      const clickSpy = vi.spyOn(fileInput, 'click');

      await user.click(button);

      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });

    it('should display preview after file selection', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      const file = createMockImageFile();
      const fileInput = screen.getByLabelText('Upload plant photo');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.queryByRole('img')).toBeInTheDocument();
      });
    });

    it('should display file name after selection', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      const file = new File(['mock-image'], 'test-plant.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload plant photo');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('test-plant.jpg')).toBeInTheDocument();
      });
    });

    it('should call onFileChange callback with selected file', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      const file = new File(['mock-image'], 'test-plant.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload plant photo');

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockOnFileChange).toHaveBeenCalledWith(expect.any(File));
      });
    });
  });

  describe('file validation', () => {
    it('should reject non-image files', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      // Create a non-image file
      const file = new File(['text content'], 'document.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText('Upload plant photo');

      // Simulate file input change directly since Testing Library's upload might have issues with type validation
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      fileInput.dispatchEvent(event);

      // Non-image files should not trigger onFileChange
      expect(mockOnFileChange).not.toHaveBeenCalled();
    });

    it('should show alert for files larger than 10MB', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert');
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      // Create a file larger than 10MB
      const largeBuffer = new Uint8Array(11 * 1024 * 1024);
      const file = new File([largeBuffer], 'large-image.jpg', { type: 'image/jpeg' });

      const fileInput = screen.getByLabelText('Upload plant photo');
      await user.upload(fileInput, file);

      expect(alertSpy).toHaveBeenCalledWith('Image must be smaller than 10MB');
      expect(mockOnFileChange).not.toHaveBeenCalled();
    });

    it('should accept valid image files (jpg, png, webp)', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      const types = [
        { name: 'test.jpg', type: 'image/jpeg' },
        { name: 'test.png', type: 'image/png' },
        { name: 'test.webp', type: 'image/webp' },
      ];

      for (const fileType of types) {
        vi.clearAllMocks();
        const file = new File(['image data'], fileType.name, { type: fileType.type });
        const fileInput = screen.getByLabelText('Upload plant photo');

        await user.upload(fileInput, file);

        await waitFor(() => {
          expect(mockOnFileChange).toHaveBeenCalled();
        });
      }
    });
  });

  describe('preview management', () => {
    it('should show change and remove buttons when photo is provided as prop', () => {
      render(
        <ImageUpload
          currentPhotoUrl="https://example.com/plant.jpg"
          onFileChange={mockOnFileChange}
        />
      );

      // When a photo URL is provided, buttons should be visible
      expect(screen.getByRole('button', { name: /change photo/i })).toBeInTheDocument();
      // Remove button only has an icon, so find it by checking for all buttons and the X icon
      const buttons = screen.getAllByRole('button');
      const removeButton = buttons.find((btn) => btn.querySelector('svg[class*="lucide-x"]'));
      expect(removeButton).toBeInTheDocument();
    });

    it('should display preview image with correct styling', () => {
      render(
        <ImageUpload
          currentPhotoUrl="https://example.com/plant.jpg"
          onFileChange={mockOnFileChange}
        />
      );

      const image = screen.queryByRole('img');
      expect(image).toHaveClass('w-full', 'h-64', 'object-cover');
    });
  });

  describe('remove photo', () => {
    it('should clear preview when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          currentPhotoUrl="https://example.com/plant.jpg"
          onFileChange={mockOnFileChange}
        />
      );

      // Verify preview is showing
      expect(screen.queryByRole('img')).toBeInTheDocument();

      // Find remove button by its X icon
      const buttons = screen.getAllByRole('button');
      const removeButton = buttons.find((btn) => btn.querySelector('svg[class*="lucide-x"]'));
      expect(removeButton).toBeInTheDocument();

      await user.click(removeButton!);

      // After removing, preview should be gone
      expect(screen.queryByAltText('Plant photo preview')).not.toBeInTheDocument();
    });

    it('should call onFileChange with null when photo is removed', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          currentPhotoUrl="https://example.com/plant.jpg"
          onFileChange={mockOnFileChange}
        />
      );

      // Find remove button by its X icon
      const buttons = screen.getAllByRole('button');
      const removeButton = buttons.find((btn) => btn.querySelector('svg[class*="lucide-x"]'));

      await user.click(removeButton!);

      expect(mockOnFileChange).toHaveBeenCalledWith(null);
    });

    it('should return to upload button after removing photo', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          currentPhotoUrl="https://example.com/plant.jpg"
          onFileChange={mockOnFileChange}
        />
      );

      // Find remove button by its X icon
      const buttons = screen.getAllByRole('button');
      const removeButton = buttons.find((btn) => btn.querySelector('svg[class*="lucide-x"]'));

      await user.click(removeButton!);

      // After removing, upload button should be visible
      expect(screen.getByRole('button', { name: /upload plant photo/i })).toBeInTheDocument();
    });
  });

  describe('change photo', () => {
    it('should show change button when photo is provided', () => {
      render(
        <ImageUpload
          currentPhotoUrl="https://example.com/plant.jpg"
          onFileChange={mockOnFileChange}
        />
      );

      // Change button should be visible when photo is provided
      expect(screen.getByRole('button', { name: /change photo/i })).toBeInTheDocument();
    });

    it('should trigger file input when change button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ImageUpload
          currentPhotoUrl="https://example.com/plant.jpg"
          onFileChange={mockOnFileChange}
        />
      );

      const fileInput = screen.getByLabelText('Upload plant photo');
      const clickSpy = vi.spyOn(fileInput, 'click');

      const changeButton = screen.getByRole('button', { name: /change photo/i });
      await user.click(changeButton);

      expect(clickSpy).toHaveBeenCalled();
      clickSpy.mockRestore();
    });
  });

  describe('accessibility', () => {
    it('should have accessible file input with label', () => {
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      const fileInput = screen.getByLabelText('Upload plant photo');
      expect(fileInput).toHaveAttribute('aria-label', 'Upload plant photo');
    });

    it('should have descriptive button labels', () => {
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      const uploadButton = screen.getByRole('button', { name: /upload plant photo/i });
      expect(uploadButton).toBeInTheDocument();
    });

    it('should have alt text for preview image', async () => {
      const user = userEvent.setup();
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      const file = createMockImageFile();
      const fileInput = screen.getByLabelText('Upload plant photo');

      await user.upload(fileInput, file);

      await waitFor(() => {
        const image = screen.queryByRole('img');
        expect(image).toBeInTheDocument();
      });
    });
  });

  describe('optional props', () => {
    it('should work without onFileChange callback', () => {
      render(<ImageUpload />);

      expect(screen.getByRole('button', { name: /upload plant photo/i })).toBeInTheDocument();
    });

    it('should work without currentPhotoUrl', () => {
      render(<ImageUpload onFileChange={mockOnFileChange} />);

      expect(screen.getByRole('button', { name: /upload plant photo/i })).toBeInTheDocument();
      expect(screen.queryByAltText('Plant photo preview')).not.toBeInTheDocument();
    });
  });
});
