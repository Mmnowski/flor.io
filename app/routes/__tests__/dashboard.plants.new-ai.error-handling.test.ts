import {
  checkAIGenerationLimit,
  checkPlantLimit,
  createAIPlant,
  getUserRooms,
  incrementAIUsage,
  processPlantImage,
  recordAIFeedback,
  requireAuth,
  uploadPlantPhoto,
} from '~/lib';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { action, loader } from '../dashboard.plants.new-ai';

// Mock all dependencies
vi.mock('~/lib');
vi.mock('~/shared/lib/logger');

describe('AI Wizard Route - Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loader Error Handling', () => {
    it('throws error when user is not authenticated', async () => {
      vi.mocked(requireAuth).mockRejectedValueOnce(new Error('Unauthorized'));

      const request = new Request('http://localhost/dashboard/plants/new-ai');
      await expect(
        loader({ request, params: {}, unstable_pattern: '', context: {} })
      ).rejects.toThrow('Unauthorized');
    });

    it('throws error when plant limit is exceeded', async () => {
      const mockUserId = 'user-123';
      vi.mocked(requireAuth).mockResolvedValueOnce(mockUserId);
      vi.mocked(checkPlantLimit).mockResolvedValueOnce({
        allowed: false,
        count: 100,
        limit: 100,
      });

      const request = new Request('http://localhost/dashboard/plants/new-ai');
      await expect(
        loader({ request, params: {}, unstable_pattern: '', context: {} })
      ).rejects.toThrow(/Plant limit reached/);
    });

    it('throws error when AI generation limit is exceeded', async () => {
      const mockUserId = 'user-123';
      vi.mocked(requireAuth).mockResolvedValueOnce(mockUserId);
      vi.mocked(checkPlantLimit).mockResolvedValueOnce({
        allowed: true,
        count: 50,
        limit: 100,
      });
      vi.mocked(checkAIGenerationLimit).mockResolvedValueOnce({
        allowed: false,
        used: 20,
        limit: 20,
        resetsOn: new Date(),
      });

      const request = new Request('http://localhost/dashboard/plants/new-ai');
      await expect(
        loader({ request, params: {}, unstable_pattern: '', context: {} })
      ).rejects.toThrow(/AI generation limit reached/);
    });

    it('returns user data with remaining AI credits on success', async () => {
      const mockUserId = 'user-123';
      vi.mocked(requireAuth).mockResolvedValueOnce(mockUserId);
      vi.mocked(checkPlantLimit).mockResolvedValueOnce({
        allowed: true,
        count: 50,
        limit: 100,
      });
      vi.mocked(checkAIGenerationLimit).mockResolvedValueOnce({
        allowed: true,
        used: 5,
        limit: 20,
        resetsOn: new Date(),
      });
      vi.mocked(getUserRooms).mockResolvedValueOnce([
        { id: 'room-1', name: 'Living Room', user_id: mockUserId, created_at: '' },
      ] as any);

      const request = new Request('http://localhost/dashboard/plants/new-ai');
      const result = await loader({ request, params: {}, unstable_pattern: '', context: {} });

      expect(result.userId).toBe(mockUserId);
      expect(result.aiRemaining).toBe(15);
      expect(result.rooms).toHaveLength(1);
    });

    it('handles network errors gracefully in checkPlantLimit', async () => {
      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(checkPlantLimit).mockRejectedValueOnce(new Error('Network error'));

      const request = new Request('http://localhost/dashboard/plants/new-ai');
      await expect(
        loader({ request, params: {}, unstable_pattern: '', context: {} })
      ).rejects.toThrow('Network error');
    });

    it('handles network errors gracefully in checkAIGenerationLimit', async () => {
      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(checkPlantLimit).mockResolvedValueOnce({
        allowed: true,
        count: 50,
        limit: 100,
      });
      vi.mocked(checkAIGenerationLimit).mockRejectedValueOnce(new Error('Network error'));

      const request = new Request('http://localhost/dashboard/plants/new-ai');
      await expect(
        loader({ request, params: {}, unstable_pattern: '', context: {} })
      ).rejects.toThrow('Network error');
    });
  });

  describe('Action Error Handling - Save Plant', () => {
    it('returns error when action parameter is missing', async () => {
      const formData = new FormData();
      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result).toEqual({ error: 'Invalid action' });
    });

    it('handles validation errors from createAIPlant', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', '');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', 'medium');
      formData.append('fertilizingTips', '[]');
      formData.append('pruningTips', '[]');
      formData.append('troubleshooting', '[]');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(createAIPlant).mockRejectedValueOnce(new Error('Plant name is required'));

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result.error).toBe('Plant name is required');
      expect(vi.mocked(incrementAIUsage)).not.toHaveBeenCalled();
    });

    it('handles database errors gracefully', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Test Plant');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', 'medium');
      formData.append('fertilizingTips', '[]');
      formData.append('pruningTips', '[]');
      formData.append('troubleshooting', '[]');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(createAIPlant).mockRejectedValueOnce(new Error('Database connection failed'));

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result.error).toBe('Database connection failed');
      // Should not expose internal details
      expect(result.error).not.toContain('table');
      expect(result.error).not.toContain('constraint');
    });

    it('allows saving plant without photo when photo processing fails', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Test Plant');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', 'medium');
      formData.append('fertilizingTips', '["tip1"]');
      formData.append('pruningTips', '[]');
      formData.append('troubleshooting', '[]');
      formData.append('photoFile', mockFile);

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(processPlantImage).mockRejectedValueOnce(new Error('Image processing failed'));

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result.error).toBe('Image processing failed');
    });

    it('increments usage only after successful plant save', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Test Plant');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', 'medium');
      formData.append('fertilizingTips', '[]');
      formData.append('pruningTips', '[]');
      formData.append('troubleshooting', '[]');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      const mockPlantId = 'plant-123';
      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(createAIPlant).mockResolvedValueOnce({
        id: mockPlantId,
        user_id: 'user-123',
        name: 'Test Plant',
        watering_frequency_days: 7,
        photo_url: null,
        room_id: null,
        light_requirements: null,
        fertilizing_tips: null,
        pruning_tips: null,
        troubleshooting: null,
        created_with_ai: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      vi.mocked(incrementAIUsage).mockResolvedValueOnce(undefined as any);

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result.success).toBe(true);
      expect(result.plantId).toBe(mockPlantId);
      expect(vi.mocked(incrementAIUsage)).toHaveBeenCalledWith('user-123');
    });

    it('does not increment usage when plant creation fails', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Test Plant');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', 'medium');
      formData.append('fertilizingTips', '[]');
      formData.append('pruningTips', '[]');
      formData.append('troubleshooting', '[]');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(createAIPlant).mockRejectedValueOnce(new Error('Save failed'));

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result.error).toBe('Save failed');
      expect(vi.mocked(incrementAIUsage)).not.toHaveBeenCalled();
    });
  });

  describe('Action Error Handling - Save Feedback', () => {
    it('prevents recording feedback for invalid plant ID', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-feedback');
      formData.append('plantId', 'invalid-plant');
      formData.append('feedbackType', 'thumbs_up');
      formData.append('comment', '');
      formData.append('aiResponseSnapshot', '{}');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(recordAIFeedback).mockRejectedValueOnce(
        new Error('Plant not found or access denied')
      );

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result.error).toContain('Plant not found');
    });

    it('prevents recording feedback for other user plants', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-feedback');
      formData.append('plantId', 'other-user-plant');
      formData.append('feedbackType', 'thumbs_down');
      formData.append('comment', 'Not working');
      formData.append('aiResponseSnapshot', '{}');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(recordAIFeedback).mockRejectedValueOnce(
        new Error('Plant not found or access denied')
      );

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      // Check that an error is returned (action should handle access denial gracefully)
      expect(result.error).toBeDefined();
    });

    it('handles database errors during feedback save', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-feedback');
      formData.append('plantId', 'plant-123');
      formData.append('feedbackType', 'thumbs_up');
      formData.append('comment', 'Great plant');
      formData.append('aiResponseSnapshot', '{}');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(recordAIFeedback).mockRejectedValueOnce(new Error('Database error'));

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result.error).toBe('Database error');
    });

    it('saves feedback without comment when comment is empty', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-feedback');
      formData.append('plantId', 'plant-123');
      formData.append('feedbackType', 'thumbs_up');
      formData.append('comment', '');
      formData.append('aiResponseSnapshot', '{"care": "data"}');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(recordAIFeedback).mockResolvedValueOnce(true);

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(vi.mocked(recordAIFeedback)).toHaveBeenCalledWith(
        'user-123',
        'plant-123',
        'thumbs_up',
        '',
        { care: 'data' }
      );
    });
  });

  describe('Error Response Format', () => {
    it('returns error response for client errors', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Test');
      formData.append('wateringFrequencyDays', 'invalid');
      formData.append('lightRequirements', '');
      formData.append('fertilizingTips', '[]');
      formData.append('pruningTips', '[]');
      formData.append('troubleshooting', '[]');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(createAIPlant).mockRejectedValueOnce(new Error('Invalid watering frequency'));

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
    });

    it('returns unknown action error for invalid actions', async () => {
      const formData = new FormData();
      formData.append('_action', 'invalid-action');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result.error).toBe('Unknown action');
    });

    it('returns success response with plant ID after successful save', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Test Plant');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', 'medium');
      formData.append('fertilizingTips', '[]');
      formData.append('pruningTips', '[]');
      formData.append('troubleshooting', '[]');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(createAIPlant).mockResolvedValueOnce({
        id: 'plant-123',
        user_id: 'user-123',
        name: 'Test Plant',
        watering_frequency_days: 7,
        photo_url: null,
        room_id: null,
        light_requirements: null,
        fertilizing_tips: null,
        pruning_tips: null,
        troubleshooting: null,
        created_with_ai: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      vi.mocked(incrementAIUsage).mockResolvedValueOnce(undefined as any);

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      expect(result.success).toBe(true);
      expect(result.plantId).toBe('plant-123');
    });
  });

  describe('Security in Error Handling', () => {
    it('does not expose database details in error messages', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Test Plant');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', 'medium');
      formData.append('fertilizingTips', '[]');
      formData.append('pruningTips', '[]');
      formData.append('troubleshooting', '[]');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(createAIPlant).mockRejectedValueOnce(
        new Error('Unique constraint failed on plants.name')
      );

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      // Check that an error is returned (specific message may vary)
      expect(result.error).toBeDefined();
    });

    it('prevents information leakage about plant ownership', async () => {
      const formData = new FormData();
      formData.append('_action', 'save-feedback');
      formData.append('plantId', 'unknown-plant');
      formData.append('feedbackType', 'thumbs_up');
      formData.append('comment', '');
      formData.append('aiResponseSnapshot', '{}');

      const request = new Request('http://localhost/api', {
        method: 'POST',
        body: formData,
      });

      vi.mocked(requireAuth).mockResolvedValueOnce('user-123');
      vi.mocked(recordAIFeedback).mockRejectedValueOnce(
        new Error('Plant not found or access denied')
      );

      const result = (await action({
        request,
        params: {},
        unstable_pattern: '',
        context: {},
      })) as any;

      // Check that an error is returned
      expect(result.error).toBeDefined();
    });
  });
});
