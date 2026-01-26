import { describe, it, expect, beforeEach } from "vitest";
import { identifyPlant, identifyPlantInstant } from "../plantnet.server";

describe("plantnet.server", () => {
  describe("identifyPlant", () => {
    it("returns a valid plant identification result", async () => {
      const result = await identifyPlant("https://example.com/plant.jpg");

      expect(result).toHaveProperty("scientificName");
      expect(result).toHaveProperty("commonNames");
      expect(result).toHaveProperty("confidence");
    });

    it("returns a non-empty scientific name", async () => {
      const result = await identifyPlant("https://example.com/plant.jpg");

      expect(result.scientificName).toBeTruthy();
      expect(typeof result.scientificName).toBe("string");
      expect(result.scientificName.length).toBeGreaterThan(0);
    });

    it("returns an array of common names", async () => {
      const result = await identifyPlant("https://example.com/plant.jpg");

      expect(Array.isArray(result.commonNames)).toBe(true);
      expect(result.commonNames.length).toBeGreaterThan(0);
      result.commonNames.forEach((name) => {
        expect(typeof name).toBe("string");
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it("returns a confidence score between 0.5 and 1", async () => {
      const result = await identifyPlant("https://example.com/plant.jpg");

      expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it("returns different results on repeated calls (variation)", async () => {
      const result1 = await identifyPlant("https://example.com/plant1.jpg");
      const result2 = await identifyPlant("https://example.com/plant2.jpg");

      // Results should differ due to random selection
      // (not guaranteed, but very likely with 20 plants in database)
      expect(
        result1.scientificName !== result2.scientificName ||
          result1.confidence !== result2.confidence
      ).toBe(true);
    });

    it("confidence is a number with 2 decimal places", async () => {
      const result = await identifyPlant("https://example.com/plant.jpg");

      expect(typeof result.confidence).toBe("number");
      const decimalPlaces = (result.confidence.toString().split(".")[1] || "")
        .length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it("returns known plant species", async () => {
      // Call multiple times to get various plants (using instant version for speed)
      const results = [];
      for (let i = 0; i < 20; i++) {
        const result = await identifyPlantInstant(
          `https://example.com/plant${i}.jpg`
        );
        results.push(result.scientificName);
      }

      // Should contain some known plants
      const knownPlants = [
        "Monstera deliciosa",
        "Epipremnum aureum",
        "Sansevieria trifasciata",
        "Chlorophytum comosum",
        "Philodendron hederaceum",
      ];

      const hasKnownPlant = results.some((plant) =>
        knownPlants.includes(plant)
      );
      expect(hasKnownPlant).toBe(true);
    });
  });

  describe("identifyPlantInstant", () => {
    it("returns a valid plant identification result immediately", async () => {
      const startTime = Date.now();
      const result = await identifyPlantInstant("https://example.com/plant.jpg");
      const elapsed = Date.now() - startTime;

      // Should be much faster than the delayed version (< 500ms vs ~2000ms)
      expect(elapsed).toBeLessThan(500);

      expect(result).toHaveProperty("scientificName");
      expect(result).toHaveProperty("commonNames");
      expect(result).toHaveProperty("confidence");
    });

    it("has same response structure as identifyPlant", async () => {
      const result1 = await identifyPlant("https://example.com/plant.jpg");
      const result2 = await identifyPlantInstant(
        "https://example.com/plant.jpg"
      );

      expect(Object.keys(result1).sort()).toEqual(
        Object.keys(result2).sort()
      );
    });

    it("confidence is still between 0.5 and 1", async () => {
      const result = await identifyPlantInstant("https://example.com/plant.jpg");

      expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});
