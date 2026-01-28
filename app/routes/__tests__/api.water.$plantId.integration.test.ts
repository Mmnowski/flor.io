import { getPlantById, recordWatering, requireAuth } from '~/lib';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { action } from '../api.water.$plantId';

/**
 * Water Plant API Integration Tests
 *
 * Tests the watering action endpoint's integration with:
 * - Authentication layer (requireAuth)
 * - Plant ownership verification (getPlantById)
 * - Watering recording (recordWatering)
 * - Error handling and validation
 */

vi.mock('~/lib');

describe('Water Plant API Integration', () => {
  const mockUserId = 'user-test-123';
  const mockPlantId = 'plant-test-456';

  const mockPlant = {
    id: mockPlantId,
    user_id: mockUserId,
    name: 'Test Plant',
    photo_url: null,
    room_id: null,
    watering_frequency_days: 7,
    light_requirements: null,
    fertilizing_tips: null,
    pruning_tips: null,
    troubleshooting: null,
    created_with_ai: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z',
    room_name: null,
    next_watering_date: null,
    last_watered_date: null,
    days_until_watering: null,
    is_overdue: false,
    watering_history: [],
  };

  const createMockRequest = (method = 'POST') =>
    new Request(`http://localhost/api/water/${mockPlantId}`, { method });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Watering action executes successfully', () => {
    it('should record watering for valid authenticated request', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      const result = await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ success: true, plantId: mockPlantId });
    });

    it('should call recordWatering with correct plant and user ids', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(recordWatering).toHaveBeenCalledWith(mockPlantId, mockUserId);
      expect(recordWatering).toHaveBeenCalledTimes(1);
    });

    it('should return success response with plantId', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      const result = await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result.success).toBe(true);
      expect(result.plantId).toBe(mockPlantId);
      expect(result).not.toHaveProperty('error');
    });
  });

  describe('Authentication and authorization integration', () => {
    it('should verify user authentication before processing', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      const request = createMockRequest();
      await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(requireAuth).toHaveBeenCalledWith(request);
      expect(requireAuth).toHaveBeenCalledTimes(1);
    });

    it('should check plant ownership before recording watering', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(getPlantById).toHaveBeenCalledWith(mockPlantId, mockUserId);
      expect(getPlantById).toHaveBeenCalledTimes(1);
    });

    it('should propagate authentication errors', async () => {
      const authError = new Error('Unauthorized');
      vi.mocked(requireAuth).mockRejectedValue(authError);

      await expect(
        action({
          request: createMockRequest(),
          params: { plantId: mockPlantId },
          unstable_pattern: '',
          context: {},
        })
      ).rejects.toThrow('Unauthorized');
    });

    it('should reject watering if user does not own plant', async () => {
      vi.mocked(requireAuth).mockResolvedValue('different-user-id');
      vi.mocked(getPlantById).mockResolvedValue(null);

      const result = await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Plant not found' });
      expect(result).not.toHaveProperty('success');
    });

    it('should not record watering if plant not found', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(null);

      await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(recordWatering).not.toHaveBeenCalled();
    });
  });

  describe('HTTP method validation integration', () => {
    it('should reject GET requests', async () => {
      const result = await action({
        request: createMockRequest('GET'),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Method not allowed' });
      expect(requireAuth).not.toHaveBeenCalled();
    });

    it('should reject PUT requests', async () => {
      const result = await action({
        request: createMockRequest('PUT'),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Method not allowed' });
    });

    it('should reject DELETE requests', async () => {
      const result = await action({
        request: createMockRequest('DELETE'),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Method not allowed' });
    });

    it('should reject PATCH requests', async () => {
      const result = await action({
        request: createMockRequest('PATCH'),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Method not allowed' });
    });
  });

  describe('Parameter validation integration', () => {
    it('should reject missing plantId', async () => {
      const result = await action({
        request: createMockRequest(),
        params: {} as any,
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Plant ID is required' });
    });

    it('should reject empty plantId string', async () => {
      const result = await action({
        request: createMockRequest(),
        params: { plantId: '' },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Plant ID is required' });
    });

    it('should reject null plantId', async () => {
      const result = await action({
        request: createMockRequest(),
        params: { plantId: null as any },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Plant ID is required' });
    });
  });

  describe('Error handling integration', () => {
    it('should handle getPlantById errors', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockRejectedValue(dbError);

      const result = await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({
        error: 'Database connection failed',
      });
    });

    it('should handle recordWatering errors with custom message', async () => {
      const wateringError = new Error('Constraint violation');
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockRejectedValue(wateringError);

      const result = await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({
        error: 'Constraint violation',
      });
    });

    it('should handle non-Error exceptions gracefully', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockRejectedValue('Unknown error');

      const result = await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({
        error: 'Failed to record watering',
      });
    });
  });

  describe('Plant ownership verification', () => {
    it('should verify plant belongs to authenticated user', async () => {
      const differentUserId = 'other-user-123';
      vi.mocked(requireAuth).mockResolvedValue(differentUserId);
      vi.mocked(getPlantById).mockResolvedValue(null); // Plant not found for this user

      const result = await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result.error).toBeDefined();
      expect(getPlantById).toHaveBeenCalledWith(mockPlantId, differentUserId);
    });

    it('should handle plants with different ownership correctly', async () => {
      const otherUserPlant = { ...mockPlant, user_id: 'other-user-id' };
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(otherUserPlant);

      const result = await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      // getPlantById returns plant but should verify ownership
      // In this case, getPlantById should only return plants owned by user
      expect(result.success).toBe(true); // Plant was returned, so it's owned by user
    });
  });

  describe('Response format validation', () => {
    it('should return JSON-serializable response on success', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      const result = await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      const jsonString = JSON.stringify(result);
      const parsed = JSON.parse(jsonString);

      expect(parsed.success).toBe(true);
      expect(parsed.plantId).toBe(mockPlantId);
    });

    it('should return JSON-serializable response on error', async () => {
      const result = await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      const jsonString = JSON.stringify(result);
      const parsed = JSON.parse(jsonString);

      expect(parsed.error).toBeDefined();
    });
  });

  describe('Action execution order', () => {
    it('should call functions in correct order: requireAuth → getPlantById → recordWatering', async () => {
      const callOrder: string[] = [];

      vi.mocked(requireAuth).mockImplementation(async () => {
        callOrder.push('requireAuth');
        return mockUserId;
      });

      vi.mocked(getPlantById).mockImplementation(async () => {
        callOrder.push('getPlantById');
        return mockPlant;
      });

      vi.mocked(recordWatering).mockImplementation(async () => {
        callOrder.push('recordWatering');
      });

      await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(callOrder).toEqual(['requireAuth', 'getPlantById', 'recordWatering']);
    });

    it('should not call recordWatering if getPlantById fails', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockRejectedValue(new Error('DB error'));

      await action({
        request: createMockRequest(),
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(recordWatering).not.toHaveBeenCalled();
    });

    it('should not call getPlantById if requireAuth fails', async () => {
      vi.mocked(requireAuth).mockRejectedValue(new Error('Unauthorized'));

      await expect(
        action({
          request: createMockRequest(),
          params: { plantId: mockPlantId },
          unstable_pattern: '',
          context: {},
        })
      ).rejects.toThrow();

      expect(getPlantById).not.toHaveBeenCalled();
      expect(recordWatering).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('should handle plantId with special characters', async () => {
      const specialId = 'plant-abc-123_xyz';
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue({
        ...mockPlant,
        id: specialId,
      });
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      const result = await action({
        request: createMockRequest(),
        params: { plantId: specialId },
        unstable_pattern: '',
        context: {},
      });

      expect(result.success).toBe(true);
      expect(result.plantId).toBe(specialId);
      expect(recordWatering).toHaveBeenCalledWith(specialId, mockUserId);
    });

    it('should handle very long plantId', async () => {
      const longId = 'a'.repeat(100);
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue({
        ...mockPlant,
        id: longId,
      });
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      const result = await action({
        request: createMockRequest(),
        params: { plantId: longId },
        unstable_pattern: '',
        context: {},
      });

      expect(result.plantId).toBe(longId);
    });

    it('should handle plants with various watering frequencies', async () => {
      const frequencies = [1, 3, 7, 14, 30, 365];

      for (const freq of frequencies) {
        vi.clearAllMocks();
        vi.mocked(requireAuth).mockResolvedValue(mockUserId);
        vi.mocked(getPlantById).mockResolvedValue({
          ...mockPlant,
          watering_frequency_days: freq,
        });
        vi.mocked(recordWatering).mockResolvedValue(undefined);

        const result = await action({
          request: createMockRequest(),
          params: { plantId: mockPlantId },
          unstable_pattern: '',
          context: {},
        });

        expect(result.success).toBe(true);
      }
    });

    it('should handle multiple watering records for same plant', async () => {
      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      // Record watering 3 times
      for (let i = 0; i < 3; i++) {
        const result = await action({
          request: createMockRequest(),
          params: { plantId: mockPlantId },
          unstable_pattern: '',
          context: {},
        });

        expect(result.success).toBe(true);
      }

      // All 3 calls to recordWatering should succeed
      expect(recordWatering).toHaveBeenCalledTimes(3);
    });
  });
});
