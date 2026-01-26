import { describe, it, expect } from "vitest";
import {
  generateCareInstructions,
  generateCareInstructionsInstant,
  type CareInstructions,
} from "../openai.server";

describe("openai.server", () => {
  describe("generateCareInstructions", () => {
    it("returns a valid care instructions object", async () => {
      const result = await generateCareInstructions("Monstera deliciosa");

      expect(result).toHaveProperty("wateringFrequencyDays");
      expect(result).toHaveProperty("lightRequirements");
      expect(result).toHaveProperty("fertilizingTips");
      expect(result).toHaveProperty("pruningTips");
      expect(result).toHaveProperty("troubleshooting");
    });

    it("returns a valid watering frequency (1-365 days)", async () => {
      const result = await generateCareInstructions("Monstera deliciosa");

      expect(typeof result.wateringFrequencyDays).toBe("number");
      expect(result.wateringFrequencyDays).toBeGreaterThanOrEqual(1);
      expect(result.wateringFrequencyDays).toBeLessThanOrEqual(365);
    });

    it("returns non-empty light requirements", async () => {
      const result = await generateCareInstructions("Monstera deliciosa");

      expect(result.lightRequirements).toBeTruthy();
      expect(typeof result.lightRequirements).toBe("string");
      expect(result.lightRequirements.length).toBeGreaterThan(0);
    });

    it("returns arrays of tips", async () => {
      const result = await generateCareInstructions("Monstera deliciosa");

      [
        result.fertilizingTips,
        result.pruningTips,
        result.troubleshooting,
      ].forEach((tips) => {
        expect(Array.isArray(tips)).toBe(true);
        expect(tips.length).toBeGreaterThan(0);
        tips.forEach((tip) => {
          expect(typeof tip).toBe("string");
          expect(tip.length).toBeGreaterThan(0);
        });
      });
    });

    it("returns plant-specific care for Monstera", async () => {
      const result = await generateCareInstructions("Monstera deliciosa");

      expect(result.lightRequirements.toLowerCase()).toContain("indirect");
      expect(result.wateringFrequencyDays).toBeGreaterThanOrEqual(5);
      expect(result.wateringFrequencyDays).toBeLessThanOrEqual(14);
    });

    it("returns plant-specific care for Snake Plant", async () => {
      const result = await generateCareInstructions("Sansevieria trifasciata");

      // Snake plant needs less frequent watering
      expect(result.wateringFrequencyDays).toBeGreaterThanOrEqual(10);
    });

    it("returns generic care for unknown plant", async () => {
      const result = await generateCareInstructions("Unknown_Plant_XYZ_123");

      expect(result).toHaveProperty("wateringFrequencyDays");
      expect(result).toHaveProperty("lightRequirements");
      expect(result.wateringFrequencyDays).toBeGreaterThanOrEqual(1);
    });

    it("handles scientific names case-insensitively", async () => {
      const result1 = await generateCareInstructionsInstant(
        "monstera deliciosa"
      );
      const result2 = await generateCareInstructionsInstant(
        "MONSTERA DELICIOSA"
      );
      const result3 = await generateCareInstructionsInstant(
        "Monstera deliciosa"
      );

      // All should match the same plant
      expect(result1.wateringFrequencyDays).toBe(
        result3.wateringFrequencyDays
      );
      expect(result2.wateringFrequencyDays).toBe(
        result3.wateringFrequencyDays
      );
    });

    it("handles partial plant name matching", async () => {
      // Should match even if only partial name given
      const result1 = await generateCareInstructionsInstant("Monstera");
      const result2 = await generateCareInstructionsInstant(
        "monstera deliciosa"
      );

      // Both should return valid care instructions
      expect(result1.wateringFrequencyDays).toBeGreaterThanOrEqual(1);
      expect(result2.wateringFrequencyDays).toBeGreaterThanOrEqual(1);
    });

    it("returns deep-copied objects, not references", async () => {
      const result1 = await generateCareInstructionsInstant(
        "Monstera deliciosa"
      );
      const result2 = await generateCareInstructionsInstant(
        "Monstera deliciosa"
      );

      // Arrays should not be the same reference
      expect(result1.fertilizingTips).not.toBe(result2.fertilizingTips);

      // But content should be equal
      expect(result1.fertilizingTips).toEqual(result2.fertilizingTips);
    });

    it("all tips contain meaningful text", async () => {
      const result = await generateCareInstructions("Philodendron hederaceum");

      const allTips = [
        ...result.fertilizingTips,
        ...result.pruningTips,
        ...result.troubleshooting,
      ];

      allTips.forEach((tip) => {
        // Tips should be reasonably long (not just 1-2 words)
        expect(tip.split(" ").length).toBeGreaterThanOrEqual(3);
      });
    });
  });

  describe("generateCareInstructionsInstant", () => {
    it("returns a valid care instructions object immediately", async () => {
      const startTime = Date.now();
      const result = await generateCareInstructionsInstant(
        "Monstera deliciosa"
      );
      const elapsed = Date.now() - startTime;

      // Should be much faster than the delayed version (< 500ms vs ~3000ms)
      expect(elapsed).toBeLessThan(500);

      expect(result).toHaveProperty("wateringFrequencyDays");
      expect(result).toHaveProperty("lightRequirements");
      expect(result).toHaveProperty("fertilizingTips");
      expect(result).toHaveProperty("pruningTips");
      expect(result).toHaveProperty("troubleshooting");
    });

    it("has same response structure as generateCareInstructions", async () => {
      const result1 = await generateCareInstructions("Monstera deliciosa");
      const result2 = await generateCareInstructionsInstant(
        "Monstera deliciosa"
      );

      expect(Object.keys(result1).sort()).toEqual(
        Object.keys(result2).sort()
      );
    });

    it("returns same content as delayed version", async () => {
      const result1 = await generateCareInstructions("Calathea orbifolia");
      const result2 = await generateCareInstructionsInstant("Calathea orbifolia");

      expect(result1.wateringFrequencyDays).toBe(result2.wateringFrequencyDays);
      expect(result1.lightRequirements).toBe(result2.lightRequirements);
    });
  });

  describe("Response consistency", () => {
    it("multiple calls return consistent data for same plant", async () => {
      const results: CareInstructions[] = [];

      for (let i = 0; i < 5; i++) {
        const result = await generateCareInstructionsInstant(
          "Ficus elastica"
        );
        results.push(result);
      }

      // All should have same watering frequency
      const frequencies = results.map((r) => r.wateringFrequencyDays);
      expect(new Set(frequencies).size).toBe(1);
    });

    it("tips arrays are not empty", async () => {
      const result = await generateCareInstructions("Zz_plant");

      expect(result.fertilizingTips.length).toBeGreaterThan(0);
      expect(result.pruningTips.length).toBeGreaterThan(0);
      expect(result.troubleshooting.length).toBeGreaterThan(0);
    });
  });
});
