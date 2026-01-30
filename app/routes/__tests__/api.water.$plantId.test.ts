import { requireAuth } from '~/lib/auth/require-auth.server';
import { getPlantById } from '~/lib/plants/queries.server';
import { recordWatering } from '~/lib/watering/watering.server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { action } from '../api.water.$plantId';

// Mock dependencies
vi.mock('~/lib/auth/require-auth.server');
vi.mock('~/lib/plants/queries.server');
vi.mock('~/lib/watering/watering.server');

describe('api.water.$plantId - Action', () => {
  const mockUserId = 'user-123';
  const mockPlantId = 'plant-456';
  const mockPlant = {
    id: mockPlantId,
    user_id: mockUserId,
    name: 'Test Plant',
    watering_frequency_days: 7,
    photo_url: null,
    room_id: null,
    light_requirements: null,
    fertilizing_tips: null,
    pruning_tips: null,
    troubleshooting: null,
    created_with_ai: false,
    created_at: '2024-01-01',
    updated_at: '2024-01-20',
    room_name: null,
    next_watering_date: null,
    last_watered_date: null,
    days_until_watering: null,
    is_overdue: false,
    watering_history: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST request handling', () => {
    it('should record watering for valid POST request', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      const result = await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ success: true, plantId: mockPlantId });
    });

    it('should call requireAuth with the request', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(requireAuth).toHaveBeenCalledWith(request);
    });

    it('should verify plant ownership via getPlantById', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(getPlantById).toHaveBeenCalledWith(mockPlantId, mockUserId);
    });

    it('should call recordWatering with correct parameters', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(recordWatering).toHaveBeenCalledWith(mockPlantId, mockUserId);
    });
  });

  describe('HTTP method validation', () => {
    it('should reject GET requests', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'GET',
      });

      const result = await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Method not allowed' });
    });

    it('should reject PUT requests', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'PUT',
      });

      const result = await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Method not allowed' });
    });

    it('should reject DELETE requests', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'DELETE',
      });

      const result = await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Method not allowed' });
    });
  });

  describe('parameter validation', () => {
    it('should return error when plantId is missing', async () => {
      const request = new Request('http://localhost/api/water', {
        method: 'POST',
      });

      const result = await action({
        request,
        params: {} as any,
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Plant ID is required' });
    });

    it('should return error when plantId is empty string', async () => {
      const request = new Request('http://localhost/api/water', {
        method: 'POST',
      });

      const result = await action({
        request,
        params: { plantId: '' },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Plant ID is required' });
    });
  });

  describe('authentication and authorization', () => {
    it('should return authentication error when requireAuth fails', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      const authError = new Error('Unauthorized');
      vi.mocked(requireAuth).mockRejectedValue(authError);

      await expect(
        action({ request, params: { plantId: mockPlantId }, unstable_pattern: '', context: {} })
      ).rejects.toThrow('Unauthorized');
    });

    it('should return error when plant not found (ownership check)', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(null);

      const result = await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({ error: 'Plant not found' });
    });

    it('should not call recordWatering if plant not found', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(null);

      await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(recordWatering).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return error message when recordWatering throws Error object', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockRejectedValue(new Error('Database constraint violated'));

      const result = await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({
        error: 'Database constraint violated',
      });
    });

    it('should return generic error message when non-Error is thrown', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockRejectedValue('Unknown error');

      const result = await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({
        error: 'Failed to record watering',
      });
    });

    it('should handle getPlantById errors', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockRejectedValue(new Error('Database connection failed'));

      const result = await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toEqual({
        error: 'Database connection failed',
      });
    });
  });

  describe('response structure', () => {
    it('should return success response with plantId', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(mockPlant);
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      const result = await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('plantId');
      expect(result.success).toBe(true);
      expect(result.plantId).toBe(mockPlantId);
    });

    it('should return error response with error property', async () => {
      const request = new Request('http://localhost/api/water/plant-456', {
        method: 'POST',
      });

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue(null);

      const result = await action({
        request,
        params: { plantId: mockPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result).toHaveProperty('error');
      expect(result.error).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle plants with special characters in plantId', async () => {
      const request = new Request('http://localhost/api/water/plant-abc-123-xyz', {
        method: 'POST',
      });
      const specialPlantId = 'plant-abc-123-xyz';

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue({ ...mockPlant, id: specialPlantId });
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      const result = await action({
        request,
        params: { plantId: specialPlantId },
        unstable_pattern: '',
        context: {},
      });

      expect(result.success).toBe(true);
      expect(getPlantById).toHaveBeenCalledWith(specialPlantId, mockUserId);
    });

    it('should handle very long plantId strings', async () => {
      const request = new Request('http://localhost/api/water/plant-very-long-id', {
        method: 'POST',
      });
      const longId = 'a'.repeat(100);

      vi.mocked(requireAuth).mockResolvedValue(mockUserId);
      vi.mocked(getPlantById).mockResolvedValue({ ...mockPlant, id: longId });
      vi.mocked(recordWatering).mockResolvedValue(undefined);

      const result = await action({
        request,
        params: { plantId: longId },
        unstable_pattern: '',
        context: {},
      });

      expect(result.success).toBe(true);
      expect(getPlantById).toHaveBeenCalledWith(longId, mockUserId);
    });
  });
});
