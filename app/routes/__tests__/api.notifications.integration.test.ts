import { requireAuth } from '~/lib/auth/require-auth.server';
import { getPlantsNeedingWater } from '~/lib/watering/watering.server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loader } from '../api.notifications';

/**
 * API Notifications Integration Tests
 *
 * Tests the notification API endpoint's integration with:
 * - Authentication layer (requireAuth)
 * - Watering server functions (getPlantsNeedingWater)
 * - Data formatting and error handling
 */

vi.mock('~/lib/auth', () => ({
  requireAuth: vi.fn(),
}));

vi.mock('~/lib/watering', () => ({
  getPlantsNeedingWater: vi.fn(),
}));

describe('Notifications API Integration', () => {
  const mockUserId = 'user-test-123';
  const createMockRequest = () => new Request('http://localhost/api/notifications');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API responds with correctly formatted plant data', () => {
    it('should return all plants needing water for authenticated user', async () => {
      // ARRANGE: Setup mock data representing plants needing water
      const mockPlantsData = [
        {
          plant_id: 'plant-1',
          plant_name: 'Monstera Deliciosa',
          photo_url: 'https://example.com/monstera.jpg',
          last_watered: '2024-01-10T10:00:00Z',
          next_watering: '2024-01-17T10:00:00Z',
          days_overdue: 5,
        },
        {
          plant_id: 'plant-2',
          plant_name: 'Snake Plant',
          photo_url: null,
          last_watered: '2024-01-19T10:00:00Z',
          next_watering: '2024-01-26T10:00:00Z',
          days_overdue: 0,
        },
        {
          plant_id: 'plant-3',
          plant_name: 'Pothos',
          photo_url: 'https://example.com/pothos.jpg',
          last_watered: '2024-01-15T10:00:00Z',
          next_watering: '2024-01-22T10:00:00Z',
          days_overdue: 3,
        },
      ];

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue(mockPlantsData);

      // ACT
      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      // ASSERT
      expect(result.notifications).toEqual(mockPlantsData);
      expect(result.count).toBe(3);
      expect(result.notifications).toHaveLength(3);
    });

    it('should include all required fields in notification objects', async () => {
      const mockPlant = {
        plant_id: 'plant-1',
        plant_name: 'Test Plant',
        photo_url: 'https://example.com/photo.jpg',
        last_watered: '2024-01-20T10:00:00Z',
        next_watering: '2024-01-27T10:00:00Z',
        days_overdue: 2,
      };

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([mockPlant]);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      // Verify all required fields exist
      const notification = result.notifications[0];
      expect(notification).toHaveProperty('plant_id');
      expect(notification).toHaveProperty('plant_name');
      expect(notification).toHaveProperty('photo_url');
      expect(notification).toHaveProperty('last_watered');
      expect(notification).toHaveProperty('next_watering');
      expect(notification).toHaveProperty('days_overdue');

      // Verify types
      expect(typeof notification.plant_id).toBe('string');
      expect(typeof notification.plant_name).toBe('string');
      expect(typeof notification.days_overdue).toBe('number');
    });

    it('should return empty array for user with no overdue plants', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([]);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.notifications).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should handle null photo_url correctly', async () => {
      const plantWithoutPhoto = {
        plant_id: 'plant-1',
        plant_name: 'Plant Without Photo',
        photo_url: null,
        last_watered: '2024-01-20T10:00:00Z',
        next_watering: '2024-01-27T10:00:00Z',
        days_overdue: 0,
      };

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([plantWithoutPhoto]);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.notifications[0].photo_url).toBeNull();
    });
  });

  describe('API authentication integration', () => {
    it('should call requireAuth and pass the request', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([]);

      const request = createMockRequest();
      await loader({ request, params: {}, unstable_pattern: '', context: {} });

      expect(requireAuth).toHaveBeenCalledWith(request);
      expect(requireAuth).toHaveBeenCalledTimes(1);
    });

    it('should pass authenticated userId to getPlantsNeedingWater', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([]);

      await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(getPlantsNeedingWater).toHaveBeenCalledWith(mockUserId);
    });

    it('should propagate authentication errors', async () => {
      const authError = new Error('Unauthorized');
      vi.mocked(requireAuth).mockRejectedValue(authError);

      await expect(
        loader({ request: createMockRequest(), params: {}, unstable_pattern: '', context: {} })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('API data handling and counting', () => {
    it('should correctly count notifications', async () => {
      const plants = Array(10)
        .fill(null)
        .map((_, i) => ({
          plant_id: `plant-${i}`,
          plant_name: `Plant ${i}`,
          photo_url: null,
          last_watered: '2024-01-20T10:00:00Z',
          next_watering: '2024-01-27T10:00:00Z',
          days_overdue: i,
        }));

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue(plants);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.count).toBe(10);
      expect(result.notifications.length).toBe(10);
    });

    it('should maintain plant ordering from server function', async () => {
      const plants = [
        { plant_id: 'p1', plant_name: 'Most Overdue', days_overdue: 10 },
        { plant_id: 'p2', plant_name: 'Middle', days_overdue: 5 },
        { plant_id: 'p3', plant_name: 'Least Overdue', days_overdue: 1 },
      ].map((p) => ({
        ...p,
        photo_url: null,
        last_watered: '2024-01-20T10:00:00Z',
        next_watering: '2024-01-27T10:00:00Z',
      }));

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue(plants);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      // Should maintain order from getPlantsNeedingWater
      expect(result.notifications[0].plant_id).toBe('p1');
      expect(result.notifications[1].plant_id).toBe('p2');
      expect(result.notifications[2].plant_id).toBe('p3');
    });
  });

  describe('API error handling and recovery', () => {
    it('should handle getPlantsNeedingWater errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockRejectedValue(dbError);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      // Should return empty array instead of throwing
      expect(result.notifications).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('should handle unexpected error types gracefully', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockRejectedValue('Unknown error');

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.notifications).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe('API response format validation', () => {
    it('should return JSON-serializable response', async () => {
      const mockPlant = {
        plant_id: 'plant-1',
        plant_name: 'Test',
        photo_url: null,
        last_watered: '2024-01-20T10:00:00Z',
        next_watering: '2024-01-27T10:00:00Z',
        days_overdue: 0,
      };

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([mockPlant]);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      // Should be JSON serializable
      const jsonString = JSON.stringify(result);
      const parsed = JSON.parse(jsonString);

      expect(parsed.notifications).toBeDefined();
      expect(parsed.count).toBeDefined();
      expect(parsed.notifications[0]).toEqual(mockPlant);
    });

    it('should handle date strings in ISO format', async () => {
      const mockPlant = {
        plant_id: 'plant-1',
        plant_name: 'Test',
        photo_url: null,
        last_watered: '2024-01-20T10:30:45.123Z',
        next_watering: '2024-01-27T10:30:45.123Z',
        days_overdue: 2,
      };

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([mockPlant]);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      const dates = result.notifications.map((n) => ({
        last_watered: n.last_watered,
        next_watering: n.next_watering,
      }));

      // Should preserve ISO format
      dates.forEach((d) => {
        expect(d.last_watered).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(d.next_watering).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      });
    });
  });

  describe('API edge cases', () => {
    it('should handle mixed overdue and future watering dates', async () => {
      const plants = [
        {
          plant_id: 'p1',
          plant_name: 'Overdue',
          photo_url: null,
          last_watered: '2024-01-10T10:00:00Z',
          next_watering: '2024-01-17T10:00:00Z',
          days_overdue: 5,
        },
        {
          plant_id: 'p2',
          plant_name: 'Due Today',
          photo_url: null,
          last_watered: '2024-01-19T10:00:00Z',
          next_watering: '2024-01-26T10:00:00Z',
          days_overdue: 0,
        },
        {
          plant_id: 'p3',
          plant_name: 'Future',
          photo_url: null,
          last_watered: '2024-01-21T10:00:00Z',
          next_watering: '2024-01-28T10:00:00Z',
          days_overdue: -2,
        },
      ];

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue(plants);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.notifications).toHaveLength(3);
      expect(result.notifications[0].days_overdue).toBe(5);
      expect(result.notifications[1].days_overdue).toBe(0);
      expect(result.notifications[2].days_overdue).toBe(-2);
    });

    it('should handle plants with very long names', async () => {
      const longName = 'A'.repeat(200);
      const mockPlant = {
        plant_id: 'plant-1',
        plant_name: longName,
        photo_url: null,
        last_watered: '2024-01-20T10:00:00Z',
        next_watering: '2024-01-27T10:00:00Z',
        days_overdue: 0,
      };

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([mockPlant]);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.notifications[0].plant_name).toBe(longName);
    });

    it('should handle large overdue values', async () => {
      const mockPlant = {
        plant_id: 'plant-1',
        plant_name: 'Very Neglected Plant',
        photo_url: null,
        last_watered: '2023-01-01T10:00:00Z',
        next_watering: '2023-01-08T10:00:00Z',
        days_overdue: 365,
      };

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([mockPlant]);

      const result = await loader({
        request: createMockRequest(),
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.notifications[0].days_overdue).toBe(365);
    });
  });
});
