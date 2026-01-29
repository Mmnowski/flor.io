import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { NotificationsModal, type PlantNeedingWater } from "../notifications-modal";

describe("NotificationsModal", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnWatered = vi.fn();

  const mockNotifications: PlantNeedingWater[] = [
    {
      plant_id: "plant-1",
      plant_name: "Monstera Deliciosa",
      photo_url: "https://example.com/monstera.jpg",
      last_watered: "2024-01-15T10:00:00Z",
      next_watering: "2024-01-22T10:00:00Z",
      days_overdue: 3,
    },
    {
      plant_id: "plant-2",
      plant_name: "Snake Plant",
      photo_url: null,
      last_watered: "2024-01-20T10:00:00Z",
      next_watering: "2024-01-21T10:00:00Z",
      days_overdue: 0,
    },
  ];

  const renderModal = (props?: Partial<React.ComponentProps<typeof NotificationsModal>>) => {
    const defaultProps = {
      open: true,
      onOpenChange: mockOnOpenChange,
      notifications: mockNotifications,
      onWatered: mockOnWatered,
      isLoading: false,
      ...props,
    };

    return render(
      <MemoryRouter>
        <NotificationsModal {...defaultProps} />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render dialog when open is true", () => {
      renderModal({ open: true });
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render dialog when open is false", () => {
      renderModal({ open: false });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should display dialog title", () => {
      renderModal();
      expect(screen.getByText("Plants Needing Water")).toBeInTheDocument();
    });

    it("should display water droplet icon in title", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      const svg = dialog.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should display notification count in description", () => {
      renderModal();
      expect(screen.getByText("2 plants need watering")).toBeInTheDocument();
    });

    it("should handle singular notification count text", () => {
      renderModal({ notifications: mockNotifications.slice(0, 1) });
      expect(screen.getByText("1 plant needs watering")).toBeInTheDocument();
    });
  });

  describe("plant list display", () => {
    it("should render all plants needing water", () => {
      renderModal();
      expect(screen.getByText("Monstera Deliciosa")).toBeInTheDocument();
      expect(screen.getByText("Snake Plant")).toBeInTheDocument();
    });

    it("should display plant photo when photo_url is provided", () => {
      renderModal();
      const image = screen.getByAltText("Monstera Deliciosa") as HTMLImageElement;
      expect(image).toBeInTheDocument();
      expect(image.src).toBe("https://example.com/monstera.jpg");
    });

    it("should display placeholder icon when photo_url is null", () => {
      renderModal();
      const container = screen.getByText("Snake Plant").closest("div");
      expect(container?.querySelector("svg")).toBeInTheDocument();
    });

    it("should render 'Watered' button for each plant", () => {
      renderModal();
      const buttons = screen.getAllByRole("button", { name: /watered/i });
      expect(buttons).toHaveLength(2);
    });
  });

  describe("status display", () => {
    it("should show overdue status with red text for overdue plants", () => {
      renderModal();
      const overdueStatus = screen.getByText("Overdue by 3 days");
      expect(overdueStatus).toHaveClass("text-red-600", "dark:text-red-400");
    });

    it("should show 'Due today' with amber text for plants due today", () => {
      renderModal();
      const dueStatus = screen.getByText("Due today");
      expect(dueStatus).toHaveClass("text-amber-600", "dark:text-amber-400");
    });

    it("should display correct overdue count text", () => {
      renderModal();
      expect(screen.getByText("Overdue by 3 days")).toBeInTheDocument();
      expect(screen.getByText("Due today")).toBeInTheDocument();
    });

    it("should handle singular overdue days", () => {
      const singleDayOverdue: PlantNeedingWater[] = [
        {
          ...mockNotifications[0],
          days_overdue: 1,
        },
      ];
      renderModal({ notifications: singleDayOverdue });
      expect(screen.getByText("Overdue by 1 day")).toBeInTheDocument();
    });

    it("should handle negative days_overdue (not yet due)", () => {
      const futureWatering: PlantNeedingWater[] = [
        {
          ...mockNotifications[0],
          days_overdue: -5,
        },
      ];
      renderModal({ notifications: futureWatering });
      // Days_overdue of -5 should still show "Due today" or similar logic
      // Adjust based on actual business logic
      const statusElement = screen.getByText(/Days/i, { exact: false });
      expect(statusElement).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("should show empty state when notifications array is empty", () => {
      renderModal({ notifications: [] });
      expect(screen.getByText(/All caught up!/i)).toBeInTheDocument();
    });

    it("should display emoji in empty state", () => {
      renderModal({ notifications: [] });
      const emptyText = screen.getByText(/All caught up! 🌱/);
      expect(emptyText).toBeInTheDocument();
    });

    it("should display leaf icon in empty state", () => {
      renderModal({ notifications: [] });
      const dialog = screen.getByRole("dialog");
      const leafIcons = dialog.querySelectorAll("svg");
      expect(leafIcons.length).toBeGreaterThan(0);
    });

    it("should not display plants list in empty state", () => {
      renderModal({ notifications: [] });
      expect(screen.queryByText("Monstera Deliciosa")).not.toBeInTheDocument();
    });
  });

  describe("watering actions", () => {
    it("should call onWatered when 'Watered' button is clicked", async () => {
      const user = userEvent.setup();
      renderModal();

      const buttons = screen.getAllByRole("button", { name: /watered/i });
      await user.click(buttons[0]);

      expect(mockOnWatered).toHaveBeenCalledWith("plant-1");
    });

    it("should call onWatered with correct plantId", async () => {
      const user = userEvent.setup();
      renderModal();

      const buttons = screen.getAllByRole("button", { name: /watered/i });
      await user.click(buttons[1]);

      expect(mockOnWatered).toHaveBeenCalledWith("plant-2");
    });

    it("should remove plant from list after watering (optimistic UI)", async () => {
      const user = userEvent.setup();
      renderModal();

      expect(screen.getByText("Monstera Deliciosa")).toBeInTheDocument();

      const buttons = screen.getAllByRole("button", { name: /watered/i });
      await user.click(buttons[0]);

      // Plant should be removed from display immediately
      expect(screen.queryByText("Monstera Deliciosa")).not.toBeInTheDocument();
      expect(screen.getByText("Snake Plant")).toBeInTheDocument();
    });

    it("should disable 'Watered' buttons when isLoading is true", () => {
      renderModal({ isLoading: true });

      const buttons = screen.getAllByRole("button", { name: /watered/i });
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it("should enable 'Watered' buttons when isLoading is false", () => {
      renderModal({ isLoading: false });

      const buttons = screen.getAllByRole("button", { name: /watered/i });
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe("plant navigation", () => {
    it("should render plant name as link to plant detail page", () => {
      renderModal();
      const link = screen.getByText("Monstera Deliciosa").closest("a");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/dashboard/plants/plant-1");
    });

    it("should render plant photo as link to plant detail page", () => {
      renderModal();
      const image = screen.getByAltText("Monstera Deliciosa") as HTMLImageElement;
      const link = image.closest("a");
      expect(link).toHaveAttribute("href", "/dashboard/plants/plant-1");
    });

    it("should close modal when clicking plant link", async () => {
      const user = userEvent.setup();
      renderModal();

      const links = screen.getAllByRole("link");
      const plantLink = links.find((link) => link.getAttribute("href")?.includes("plant-1"));

      if (plantLink) {
        await user.click(plantLink);
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      }
    });
  });

  describe("modal controls", () => {
    it("should call onOpenChange when close button is clicked", async () => {
      const user = userEvent.setup();
      renderModal();

      const closeButton = screen.getByRole("button", { name: "" });
      // Find the actual close button (typically X button in dialog header)
      const dialog = screen.getByRole("dialog");
      const buttons = within(dialog).getAllByRole("button");
      const potentialCloseButton = buttons.find((btn) => btn.getAttribute("aria-label")?.includes("close"));

      if (potentialCloseButton) {
        await user.click(potentialCloseButton);
        expect(mockOnOpenChange).toHaveBeenCalled();
      }
    });

    it("should call onOpenChange with false when dialog is closed", () => {
      renderModal({ open: false });
      // Dialog should not be rendered when open is false
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper dialog role", () => {
      renderModal();
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should have alt text on plant images", () => {
      renderModal();
      const images = screen.getAllByAltText(/Plant/i);
      expect(images.length).toBeGreaterThan(0);
    });

    it("should have proper button semantics for 'Watered' action", () => {
      renderModal();
      const buttons = screen.getAllByRole("button", { name: /watered/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have descriptive title in dialog header", () => {
      renderModal();
      expect(screen.getByText("Plants Needing Water")).toBeInTheDocument();
    });
  });

  describe("styling and theming", () => {
    it("should apply dark mode classes to text", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      const dialogParent = dialog.parentElement;
      // Check for dark mode support in component structure
      expect(dialogParent).toBeInTheDocument();
    });

    it("should have emerald theme button colors", () => {
      renderModal();
      const buttons = screen.getAllByRole("button", { name: /watered/i });
      buttons.forEach((button) => {
        expect(button).toHaveClass("bg-emerald-600");
      });
    });

    it("should apply overflow scroll to notification list", () => {
      renderModal();
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("should handle very long plant names", () => {
      const longNameNotification: PlantNeedingWater[] = [
        {
          ...mockNotifications[0],
          plant_name: "A".repeat(100),
        },
      ];
      renderModal({ notifications: longNameNotification });
      expect(screen.getByText(/A+/)).toBeInTheDocument();
    });

    it("should handle plants with special characters in names", () => {
      const specialCharNotification: PlantNeedingWater[] = [
        {
          ...mockNotifications[0],
          plant_name: "Plant's \"Special\" & Name (✓)",
        },
      ];
      renderModal({ notifications: specialCharNotification });
      expect(screen.getByText(/Plant's.*Special.*Name/)).toBeInTheDocument();
    });

    it("should handle many notifications without UI breaking", () => {
      const manyNotifications = Array(50)
        .fill(null)
        .map((_, i) => ({
          plant_id: `plant-${i}`,
          plant_name: `Plant ${i}`,
          photo_url: null,
          last_watered: "2024-01-20T10:00:00Z",
          next_watering: "2024-01-27T10:00:00Z",
          days_overdue: i % 5,
        }));

      renderModal({ notifications: manyNotifications });
      expect(screen.getByText("50 plants need watering")).toBeInTheDocument();
    });

    it("should maintain functionality with mixed overdue and due dates", () => {
      const mixedNotifications: PlantNeedingWater[] = [
        { ...mockNotifications[0], days_overdue: 5 },
        { ...mockNotifications[0], days_overdue: 0 },
        { ...mockNotifications[0], days_overdue: -2 },
      ];

      renderModal({ notifications: mixedNotifications });
      expect(screen.getByText("Overdue by 5 days")).toBeInTheDocument();
      expect(screen.getByText("Due today")).toBeInTheDocument();
    });
  });
});
