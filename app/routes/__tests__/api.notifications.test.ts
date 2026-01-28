import { getPlantsNeedingWater, requireAuth } from '~/lib';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { loader } from '../api.notifications';

// Mock dependencies
vi.mock('~/lib');

describe('api.notifications - Loader', () => {
  const mockUserId = 'user-123';
  const mockRequest = new Request('http://localhost/api/notifications');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful notification fetch', () => {
    it('should return notifications array when plants need water', async () => {
      const mockPlants = [
        {
          plant_id: 'plant-1',
          plant_name: 'Monstera',
          photo_url: 'https://example.com/plant1.jpg',
          last_watered: '2024-01-20',
          next_watering: '2024-01-27',
          days_overdue: 2,
        },
        {
          plant_id: 'plant-2',
          plant_name: 'Snake Plant',
          photo_url: null,
          last_watered: '2024-01-19',
          next_watering: '2024-01-26',
          days_overdue: 1,
        },
      ];

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue(mockPlants);

      const result = await loader({
        request: mockRequest,
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({
        notifications: mockPlants,
        count: 2,
      });
    });

    it('should call requireAuth with the request', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([]);

      await loader({ request: mockRequest, params: {}, unstable_pattern: '', context: {} });

      expect(requireAuth).toHaveBeenCalledWith(mockRequest);
    });

    it('should call getPlantsNeedingWater with correct userId', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([]);

      await loader({ request: mockRequest, params: {}, unstable_pattern: '', context: {} });

      expect(getPlantsNeedingWater).toHaveBeenCalledWith(mockUserId);
    });

    it('should return empty notifications when no plants need water', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue([]);

      const result = await loader({
        request: mockRequest,
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({
        notifications: [],
        count: 0,
      });
    });
  });

  describe('error handling', () => {
    it('should return empty array on getPlantsNeedingWater error', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockRejectedValue(new Error('Database error'));

      const result = await loader({
        request: mockRequest,
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({
        notifications: [],
        count: 0,
      });
    });

    it('should not catch authentication errors', async () => {
      const authError = new Error('Unauthorized');
      vi.mocked(requireAuth).mockRejectedValue(authError);

      await expect(
        loader({ request: mockRequest, params: {}, unstable_pattern: '', context: {} })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('data structure', () => {
    it('should include all required fields in notification objects', async () => {
      const mockPlants = [
        {
          plant_id: 'plant-1',
          plant_name: 'Test Plant',
          photo_url: 'https://example.com/photo.jpg',
          last_watered: '2024-01-20',
          next_watering: '2024-01-27',
          days_overdue: 0,
        },
      ];

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue(mockPlants);

      const result = await loader({
        request: mockRequest,
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.notifications[0]).toHaveProperty('plant_id');
      expect(result.notifications[0]).toHaveProperty('plant_name');
      expect(result.notifications[0]).toHaveProperty('photo_url');
      expect(result.notifications[0]).toHaveProperty('last_watered');
      expect(result.notifications[0]).toHaveProperty('next_watering');
      expect(result.notifications[0]).toHaveProperty('days_overdue');
    });

    it('should correctly calculate count from notifications array', async () => {
      const mockPlants = Array(5)
        .fill(null)
        .map((_, i) => ({
          plant_id: `plant-${i}`,
          plant_name: `Plant ${i}`,
          photo_url: null,
          last_watered: '2024-01-20',
          next_watering: '2024-01-27',
          days_overdue: i,
        }));

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue(mockPlants);

      const result = await loader({
        request: mockRequest,
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.count).toBe(5);
      expect(result.notifications.length).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should handle null photo_url gracefully', async () => {
      const mockPlants = [
        {
          plant_id: 'plant-1',
          plant_name: 'Plant without photo',
          photo_url: null,
          last_watered: '2024-01-20',
          next_watering: '2024-01-27',
          days_overdue: 0,
        },
      ];

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue(mockPlants);

      const result = await loader({
        request: mockRequest,
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.notifications[0].photo_url).toBeNull();
    });

    it('should handle negative days_overdue (not yet due)', async () => {
      const mockPlants = [
        {
          plant_id: 'plant-1',
          plant_name: 'Future Watering',
          photo_url: null,
          last_watered: '2024-01-20',
          next_watering: '2024-01-30',
          days_overdue: -3,
        },
      ];

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue(mockPlants);

      const result = await loader({
        request: mockRequest,
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.notifications[0].days_overdue).toBe(-3);
    });

    it('should handle large overdue values', async () => {
      const mockPlants = [
        {
          plant_id: 'plant-1',
          plant_name: 'Very overdue plant',
          photo_url: null,
          last_watered: '2023-01-01',
          next_watering: '2023-01-08',
          days_overdue: 365,
        },
      ];

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantsNeedingWater).mockResolvedValue(mockPlants);

      const result = await loader({
        request: mockRequest,
        params: {},
        unstable_pattern: '',
        context: {},
      });

      expect(result.notifications[0].days_overdue).toBe(365);
    });
  });
});
