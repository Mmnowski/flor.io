import { describe, it, expect, beforeEach, vi } from "vitest";
import { createAIPlant, recordAIFeedback } from "../plants.server";
import type { CareInstructions } from "~/lib/openai.server";

// Mock Supabase
vi.mock("../supabase.server", () => ({
  supabaseServer: {
    from: vi.fn(),
  },
}));

import { supabaseServer } from "../supabase.server";

describe("AI Plant Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAIPlant", () => {
    it("creates a plant with created_with_ai flag set to true", async () => {
      const mockPlant = {
        id: "plant-123",
        user_id: "user-123",
        name: "Monstera",
        watering_frequency_days: 7,
        light_requirements: "Bright indirect light",
        fertilizing_tips: ["Fertilize monthly"],
        pruning_tips: ["Prune in spring"],
        troubleshooting: ["Yellow leaves mean overwatering"],
        created_with_ai: true,
        photo_url: "https://...",
        room_id: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const mockInsert = {
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: mockPlant,
            error: null,
          }),
        })),
      };

      vi.mocked(supabaseServer.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockInsert),
      } as any);

      const plant = await createAIPlant("user-123", {
        name: "Monstera",
        watering_frequency_days: 7,
        light_requirements: "Bright indirect light",
        fertilizing_tips: ["Fertilize monthly"],
        pruning_tips: ["Prune in spring"],
        troubleshooting: ["Yellow leaves mean overwatering"],
        photo_url: "https://...",
      });

      expect(plant.created_with_ai).toBe(true);
      expect(plant.name).toBe("Monstera");
      expect(plant.watering_frequency_days).toBe(7);
    });

    it("validates plant name is required", async () => {
      const mockInsert = {
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      };

      vi.mocked(supabaseServer.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockInsert),
      } as any);

      await expect(
        createAIPlant("user-123", {
          name: "",
          watering_frequency_days: 7,
          light_requirements: "Bright",
          fertilizing_tips: [],
          pruning_tips: [],
          troubleshooting: [],
        })
      ).rejects.toThrow("Plant name is required");
    });

    it("validates watering frequency is between 1-365 days", async () => {
      await expect(
        createAIPlant("user-123", {
          name: "Plant",
          watering_frequency_days: 0,
          light_requirements: "Bright",
          fertilizing_tips: [],
          pruning_tips: [],
          troubleshooting: [],
        })
      ).rejects.toThrow("Watering frequency must be between 1 and 365 days");

      await expect(
        createAIPlant("user-123", {
          name: "Plant",
          watering_frequency_days: 400,
          light_requirements: "Bright",
          fertilizing_tips: [],
          pruning_tips: [],
          troubleshooting: [],
        })
      ).rejects.toThrow("Watering frequency must be between 1 and 365 days");
    });

    it("includes all care instruction fields", async () => {
      const mockPlant = {
        id: "plant-123",
        created_with_ai: true,
        light_requirements: "Bright",
        fertilizing_tips: ["Tip 1"],
        pruning_tips: ["Tip 2"],
        troubleshooting: ["Issue 1"],
      };

      const mockInsert = {
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: mockPlant,
            error: null,
          }),
        })),
      };

      vi.mocked(supabaseServer.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockInsert),
      } as any);

      const plant = await createAIPlant("user-123", {
        name: "Test Plant",
        watering_frequency_days: 5,
        light_requirements: "Bright",
        fertilizing_tips: ["Tip 1"],
        pruning_tips: ["Tip 2"],
        troubleshooting: ["Issue 1"],
      });

      expect(plant).toHaveProperty("light_requirements");
      expect(plant).toHaveProperty("fertilizing_tips");
      expect(plant).toHaveProperty("pruning_tips");
      expect(plant).toHaveProperty("troubleshooting");
    });
  });

  describe("recordAIFeedback", () => {
    it("records thumbs up feedback", async () => {
      const mockSelect = {
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: "plant-123", user_id: "user-123" },
            error: null,
          }),
        })),
      };

      const mockInsert = vi.fn().mockResolvedValue({
        data: { id: "feedback-123" },
        error: null,
      });

      vi.mocked(supabaseServer.from).mockImplementation((table: string) => {
        if (table === "plants") {
          return {
            select: vi.fn().mockReturnValue(mockSelect),
          } as any;
        }
        if (table === "ai_feedback") {
          return {
            insert: mockInsert,
          } as any;
        }
        return {} as any;
      });

      const result = await recordAIFeedback(
        "user-123",
        "plant-123",
        "thumbs_up",
        "Great recommendations!"
      );

      expect(result).toBe(true);
      expect(mockInsert).toHaveBeenCalled();
    });

    it("records thumbs down feedback", async () => {
      const mockSelect = {
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: "plant-123", user_id: "user-123" },
            error: null,
          }),
        })),
      };

      const mockInsert = vi.fn().mockResolvedValue({
        data: { id: "feedback-123" },
        error: null,
      });

      vi.mocked(supabaseServer.from).mockImplementation((table: string) => {
        if (table === "plants") {
          return {
            select: vi.fn().mockReturnValue(mockSelect),
          } as any;
        }
        if (table === "ai_feedback") {
          return {
            insert: mockInsert,
          } as any;
        }
        return {} as any;
      });

      const result = await recordAIFeedback(
        "user-123",
        "plant-123",
        "thumbs_down",
        "Watering frequency was wrong"
      );

      expect(result).toBe(true);
    });

    it("verifies plant ownership before recording feedback", async () => {
      const mockSelect = {
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: "plant-123", user_id: "different-user" },
            error: null,
          }),
        })),
      };

      vi.mocked(supabaseServer.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockSelect),
      } as any);

      const result = await recordAIFeedback(
        "user-123",
        "plant-123",
        "thumbs_up"
      );

      expect(result).toBe(false);
    });

    it("handles database errors gracefully", async () => {
      const mockSelect = {
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: "Plant not found" },
          }),
        })),
      };

      vi.mocked(supabaseServer.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockSelect),
      } as any);

      const result = await recordAIFeedback(
        "user-123",
        "plant-123",
        "thumbs_up"
      );

      expect(result).toBe(false);
    });

    it("stores AI response snapshot with feedback", async () => {
      const mockSelect = {
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: "plant-123", user_id: "user-123" },
            error: null,
          }),
        })),
      };

      const mockInsert = vi.fn().mockResolvedValue({
        data: { id: "feedback-123" },
        error: null,
      });

      vi.mocked(supabaseServer.from).mockImplementation((table: string) => {
        if (table === "plants") {
          return {
            select: vi.fn().mockReturnValue(mockSelect),
          } as any;
        }
        if (table === "ai_feedback") {
          return {
            insert: mockInsert,
          } as any;
        }
        return {} as any;
      });

      const snapshot = {
        plant_name: "Monstera",
        confidence: 0.92,
      };

      await recordAIFeedback(
        "user-123",
        "plant-123",
        "thumbs_up",
        "",
        snapshot
      );

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          ai_response_snapshot: snapshot,
        })
      );
    });
  });
});
