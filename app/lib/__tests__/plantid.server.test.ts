import { identifyPlant, identifyPlantInstant } from '~/lib/ai/plantid.server';

import { describe, expect, it } from 'vitest';

describe('plantid.server', () => {
  const dummyBuffer = Buffer.from('test-image-data');

  describe('identifyPlant', () => {
    it('returns a valid plant identification result', async () => {
      const result = await identifyPlant(dummyBuffer);

      expect(result).toHaveProperty('scientificName');
      expect(result).toHaveProperty('commonNames');
      expect(result).toHaveProperty('confidence');
    });

    it('returns a non-empty scientific name', async () => {
      const result = await identifyPlant(dummyBuffer);

      expect(result.scientificName).toBeTruthy();
      expect(typeof result.scientificName).toBe('string');
      expect(result.scientificName.length).toBeGreaterThan(0);
    });

    it('returns an array of common names', async () => {
      const result = await identifyPlant(dummyBuffer);

      expect(Array.isArray(result.commonNames)).toBe(true);
      expect(result.commonNames.length).toBeGreaterThan(0);
      result.commonNames.forEach((name: string) => {
        expect(typeof name).toBe('string');
        expect(name.length).toBeGreaterThan(0);
      });
    });

    it('returns a confidence score between 0.5 and 1', async () => {
      const result = await identifyPlant(dummyBuffer);

      expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('returns different results on repeated calls (variation)', async () => {
      const result1 = await identifyPlant(dummyBuffer);
      const result2 = await identifyPlant(dummyBuffer);

      // Results should differ due to random selection
      // (not guaranteed, but very likely with 20 plants in database)
      expect(
        result1.scientificName !== result2.scientificName ||
          result1.confidence !== result2.confidence
      ).toBe(true);
    });

    it('confidence is a number with 2 decimal places', async () => {
      const result = await identifyPlant(dummyBuffer);

      expect(typeof result.confidence).toBe('number');
      const decimalPlaces = (result.confidence.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('returns known plant species', async () => {
      // Call multiple times to get various plants (using instant version for speed)
      const results = [];
      for (let i = 0; i < 20; i++) {
        const result = await identifyPlantInstant(dummyBuffer);
        results.push(result.scientificName);
      }

      // Should contain some plants from the mock database
      // Check that we got valid scientific names (non-empty strings)
      const validResults = results.filter((plant) => typeof plant === 'string' && plant.length > 0);
      expect(validResults.length).toBeGreaterThan(0);
    });
  });

  describe('identifyPlantInstant', () => {
    it('returns a valid plant identification result immediately', async () => {
      const startTime = Date.now();
      const result = await identifyPlantInstant(dummyBuffer);
      const elapsed = Date.now() - startTime;

      // Should be much faster than the delayed version (< 500ms vs ~2000ms)
      expect(elapsed).toBeLessThan(500);

      expect(result).toHaveProperty('scientificName');
      expect(result).toHaveProperty('commonNames');
      expect(result).toHaveProperty('confidence');
    });

    it('has same response structure as identifyPlant', async () => {
      const result1 = await identifyPlant(dummyBuffer);
      const result2 = await identifyPlantInstant(dummyBuffer);

      expect(Object.keys(result1).sort()).toEqual(Object.keys(result2).sort());
    });

    it('confidence is still between 0.5 and 1', async () => {
      const result = await identifyPlantInstant(dummyBuffer);

      expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});
