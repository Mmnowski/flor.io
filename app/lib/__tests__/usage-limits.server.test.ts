import {
  LIMITS,
  checkAIGenerationLimit,
  checkPlantLimit,
  getDetailedUsage,
  getUserUsageLimits,
} from '~/lib';
import { fetchMany, fetchOne } from '~/lib/infrastructure/supabase-helpers';

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the fetchOne and fetchMany helper functions
vi.mock('../infrastructure/supabase-helpers', () => ({
  fetchOne: vi.fn(),
  fetchMany: vi.fn(),
  insertOne: vi.fn(),
  updateOne: vi.fn(),
  deleteOne: vi.fn(),
  callRpc: vi.fn(),
}));

describe('usage-limits.server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkAIGenerationLimit', () => {
    it('returns allowed=true when no record exists (first month)', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);

      const result = await checkAIGenerationLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.used).toBe(0);
      expect(result.limit).toBe(LIMITS.AI_GENERATIONS_PER_MONTH);
    });

    it('returns correct limit value', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);

      const result = await checkAIGenerationLimit('user-123');

      expect(result.limit).toBe(20);
    });

    it('includes reset date in response', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);

      const result = await checkAIGenerationLimit('user-123');

      expect(result.resetsOn).toBeInstanceOf(Date);
      expect(result.resetsOn.getTime()).toBeGreaterThan(Date.now());
    });

    it('returns allowed=false when at limit', async () => {
      vi.mocked(fetchOne).mockResolvedValue({
        ai_generations_this_month: 20,
      } as any);

      const result = await checkAIGenerationLimit('user-123');

      expect(result.allowed).toBe(false);
      expect(result.used).toBe(20);
    });

    it('returns allowed=true when below limit', async () => {
      vi.mocked(fetchOne).mockResolvedValue({
        ai_generations_this_month: 5,
      } as any);

      const result = await checkAIGenerationLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.used).toBe(5);
    });

    it('fails open on database error', async () => {
      vi.mocked(fetchOne).mockRejectedValue(new Error('Database error'));

      const result = await checkAIGenerationLimit('user-123');

      // Should allow operation if error occurs
      expect(result.allowed).toBe(true);
    });
  });

  describe('checkPlantLimit', () => {
    it('limit is set to MAX_PLANTS_PER_USER', async () => {
      vi.mocked(fetchMany).mockResolvedValue([]);

      const result = await checkPlantLimit('user-123');

      expect(result.limit).toBe(100);
    });

    it('returns allowed=true when under limit', async () => {
      vi.mocked(fetchMany).mockResolvedValue(Array(25).fill({}) as any);

      const result = await checkPlantLimit('user-123');

      expect(result.allowed).toBe(true);
      expect(result.count).toBe(25);
    });

    it('returns allowed=false when at limit', async () => {
      vi.mocked(fetchMany).mockResolvedValue(Array(100).fill({}) as any);

      const result = await checkPlantLimit('user-123');

      expect(result.allowed).toBe(false);
      expect(result.count).toBe(100);
    });
  });

  describe('getUserUsageLimits', () => {
    it('returns both AI and plant limits', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);
      vi.mocked(fetchMany).mockResolvedValue([]);

      const result = await getUserUsageLimits('user-123');

      expect(result).toHaveProperty('aiGenerations');
      expect(result).toHaveProperty('plantCount');
      expect(result.aiGenerations).toHaveProperty('allowed');
      expect(result.plantCount).toHaveProperty('allowed');
    });

    it('AI generation limit is properly populated', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);
      vi.mocked(fetchMany).mockResolvedValue([]);

      const result = await getUserUsageLimits('user-123');

      expect(result.aiGenerations.limit).toBe(LIMITS.AI_GENERATIONS_PER_MONTH);
      expect(typeof result.aiGenerations.used).toBe('number');
      expect(typeof result.aiGenerations.allowed).toBe('boolean');
    });

    it('plant count limit is properly populated', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);
      vi.mocked(fetchMany).mockResolvedValue([]);

      const result = await getUserUsageLimits('user-123');

      expect(result.plantCount.limit).toBe(LIMITS.MAX_PLANTS_PER_USER);
      expect(typeof result.plantCount.count).toBe('number');
      expect(typeof result.plantCount.allowed).toBe('boolean');
    });
  });

  describe('getDetailedUsage', () => {
    it('returns human-readable usage display strings', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);
      vi.mocked(fetchMany).mockResolvedValue([]);

      const result = await getDetailedUsage('user-123');

      expect(result.ai).toHaveProperty('display');
      expect(result.ai).toHaveProperty('remainingDisplay');
      expect(result.plants).toHaveProperty('display');
      expect(result.plants).toHaveProperty('remainingDisplay');
    });

    it('display shows used/limit format', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);
      vi.mocked(fetchMany).mockResolvedValue([]);

      const result = await getDetailedUsage('user-123');

      expect(result.ai.display).toMatch(/\d+\/\d+/);
      expect(result.plants.display).toMatch(/\d+\/\d+/);
    });

    it('remaining is calculated correctly', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);
      vi.mocked(fetchMany).mockResolvedValue([]);

      const result = await getDetailedUsage('user-123');

      expect(result.ai.remaining).toBe(result.ai.limit - result.ai.used);
      expect(result.plants.remaining).toBe(result.plants.limit - result.plants.count);
    });

    it('includes reset date for AI generations', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);
      vi.mocked(fetchMany).mockResolvedValue([]);

      const result = await getDetailedUsage('user-123');

      expect(result.ai.resetsOn).toBeInstanceOf(Date);
    });

    it('all display strings are human-readable', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);
      vi.mocked(fetchMany).mockResolvedValue([]);

      const result = await getDetailedUsage('user-123');

      expect(result.ai.remainingDisplay).toContain('left');
      expect(result.plants.remainingDisplay).toContain('available');
    });
  });

  describe('LIMITS constant', () => {
    it('defines AI_GENERATIONS_PER_MONTH', () => {
      expect(LIMITS.AI_GENERATIONS_PER_MONTH).toBe(20);
    });

    it('defines MAX_PLANTS_PER_USER', () => {
      expect(LIMITS.MAX_PLANTS_PER_USER).toBe(100);
    });

    it('all limits are positive integers', () => {
      expect(Number.isInteger(LIMITS.AI_GENERATIONS_PER_MONTH)).toBe(true);
      expect(Number.isInteger(LIMITS.MAX_PLANTS_PER_USER)).toBe(true);
      expect(LIMITS.AI_GENERATIONS_PER_MONTH).toBeGreaterThan(0);
      expect(LIMITS.MAX_PLANTS_PER_USER).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('returns reset date as next month', async () => {
      vi.mocked(fetchOne).mockResolvedValue(null);

      const result = await checkAIGenerationLimit('user-123');
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      // Should be approximately next month's first day
      expect(Math.abs(result.resetsOn.getTime() - nextMonth.getTime())).toBeLessThan(86400000); // Within 1 day
    });
  });
});
