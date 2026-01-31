import { requireAuth } from '~/lib/auth/require-auth.server';
import { createAIPlant, recordAIFeedback } from '~/lib/plants/ai.server';
import { getUserRooms } from '~/lib/rooms/rooms.server';
import { processPlantImage } from '~/lib/storage/image.server';
import { uploadPlantPhoto } from '~/lib/storage/storage.server';
import {
  checkAIGenerationLimit,
  checkPlantLimit,
  incrementAIUsage,
} from '~/lib/usage-limits/usage-limits.server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Route } from '../+types/dashboard.plants.new-ai';

// Mock dependencies - must be before imports
vi.mock('~/lib/auth/require-auth.server', () => ({
  requireAuth: vi.fn().mockResolvedValue('user-123'),
}));

vi.mock('~/lib/usage-limits/usage-limits.server', () => ({
  checkAIGenerationLimit: vi.fn().mockResolvedValue({
    allowed: true,
    used: 5,
    limit: 20,
    resetsOn: new Date(),
  }),
  checkPlantLimit: vi.fn().mockResolvedValue({
    allowed: true,
    count: 10,
    limit: 100,
  }),
  incrementAIUsage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('~/lib/rooms/rooms.server', () => ({
  getUserRooms: vi
    .fn()
    .mockResolvedValue([{ id: 'room-1', name: 'Living Room', user_id: 'user-123' }]),
}));

vi.mock('~/lib/plants/ai.server', () => ({
  createAIPlant: vi.fn().mockResolvedValue({
    id: 'plant-123',
    user_id: 'user-123',
    name: 'Monstera',
    watering_frequency_days: 7,
    created_with_ai: true,
  }),
  recordAIFeedback: vi.fn().mockResolvedValue(true),
}));

vi.mock('~/lib/storage/storage.server', () => ({
  uploadPlantPhoto: vi.fn().mockResolvedValue('https://storage/plant-photo.jpg'),
}));

vi.mock('~/lib/storage/image.server', () => ({
  processPlantImage: vi.fn().mockResolvedValue(Buffer.from('compressed')),
}));

describe('AI Wizard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('authenticates user before checking limits', async () => {
      const { loader } = await import('../dashboard.plants.new-ai');

      await loader({
        request: new Request('http://localhost/dashboard/plants/new-ai'),
        params: {},
      } as any);

      expect(requireAuth).toHaveBeenCalledWith(expect.objectContaining({ method: 'GET' }));
    });

    it('checks AI generation limit before allowing access', async () => {
      const { loader } = await import('../dashboard.plants.new-ai');

      await loader({
        request: new Request('http://localhost/dashboard/plants/new-ai'),
        params: {},
      } as any);

      expect(checkAIGenerationLimit).toHaveBeenCalledWith('user-123');
    });

    it('checks plant limit before allowing access', async () => {
      const { loader } = await import('../dashboard.plants.new-ai');

      await loader({
        request: new Request('http://localhost/dashboard/plants/new-ai'),
        params: {},
      } as any);

      expect(checkPlantLimit).toHaveBeenCalledWith('user-123');
    });

    it('rejects access when AI generation limit exceeded', async () => {
      vi.mocked(checkAIGenerationLimit).mockResolvedValueOnce({
        allowed: false,
        used: 20,
        limit: 20,
        resetsOn: new Date(),
      });

      const { loader } = await import('../dashboard.plants.new-ai');

      await expect(
        loader({
          request: new Request('http://localhost/dashboard/plants/new-ai'),
          params: {},
        } as any)
      ).rejects.toThrow('AI generation limit reached');
    });

    it('rejects access when plant limit exceeded', async () => {
      vi.mocked(checkPlantLimit).mockResolvedValueOnce({
        allowed: false,
        count: 100,
        limit: 100,
      });

      const { loader } = await import('../dashboard.plants.new-ai');

      await expect(
        loader({
          request: new Request('http://localhost/dashboard/plants/new-ai'),
          params: {},
        } as any)
      ).rejects.toThrow('Plant limit reached');
    });

    it('returns user info and rooms on success', async () => {
      const { loader } = await import('../dashboard.plants.new-ai');

      const result = await loader({
        request: new Request('http://localhost/dashboard/plants/new-ai'),
        params: {},
      } as any);

      expect(result).toEqual({
        userId: 'user-123',
        aiRemaining: 15,
        rooms: [{ id: 'room-1', name: 'Living Room', user_id: 'user-123' }],
      });
    });

    it('fetches user rooms for dropdown', async () => {
      const { loader } = await import('../dashboard.plants.new-ai');

      await loader({
        request: new Request('http://localhost/dashboard/plants/new-ai'),
        params: {},
      } as any);

      expect(getUserRooms).toHaveBeenCalledWith('user-123');
    });
  });

  describe('action - save-plant', () => {
    it('creates AI plant with provided data', async () => {
      const { action } = await import('../dashboard.plants.new-ai');

      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Monstera deliciosa');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', 'Bright indirect light');
      formData.append('fertilizingTips', JSON.stringify(['Fertilize monthly']));
      formData.append('pruningTips', JSON.stringify(['Prune in spring']));
      formData.append('troubleshooting', JSON.stringify(['Yellow leaves']));
      formData.append('roomId', 'room-1');

      const result = (await action({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(createAIPlant).toHaveBeenCalledWith('user-123', {
        name: 'Monstera deliciosa',
        watering_frequency_days: 7,
        watering_amount: null,
        light_requirements: 'Bright indirect light',
        fertilizing_tips: ['Fertilize monthly'],
        pruning_tips: ['Prune in spring'],
        troubleshooting: ['Yellow leaves'],
        photo_url: null,
        room_id: 'room-1',
      });

      expect(result).toEqual({
        success: true,
        plantId: 'plant-123',
      });
    });

    it('increments AI usage after successful plant creation', async () => {
      const { action } = await import('../dashboard.plants.new-ai');

      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Test Plant');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', '');
      formData.append('fertilizingTips', JSON.stringify([]));
      formData.append('pruningTips', JSON.stringify([]));
      formData.append('troubleshooting', JSON.stringify([]));

      (await action({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(incrementAIUsage).toHaveBeenCalledWith('user-123');
    });

    it('handles missing action gracefully', async () => {
      const { action } = await import('../dashboard.plants.new-ai');

      const result = (await action({
        request: new Request('http://localhost', { method: 'POST', body: new FormData() }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(result).toEqual({ error: 'Invalid action' });
    });

    it('catches and returns errors from plant creation', async () => {
      vi.mocked(createAIPlant).mockRejectedValueOnce(new Error('Database error'));

      const { action } = await import('../dashboard.plants.new-ai');

      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Test');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', '');
      formData.append('fertilizingTips', JSON.stringify([]));
      formData.append('pruningTips', JSON.stringify([]));
      formData.append('troubleshooting', JSON.stringify([]));

      const result = (await action({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(result).toEqual({
        error: 'Database error',
      });
    });
  });

  describe('action - save-feedback', () => {
    it('records user feedback with snapshot', async () => {
      const { action } = await import('../dashboard.plants.new-ai');

      const formData = new FormData();
      formData.append('_action', 'save-feedback');
      formData.append('plantId', 'plant-123');
      formData.append('feedbackType', 'thumbs_up');
      formData.append('comment', 'Great recommendations!');
      formData.append(
        'aiResponseSnapshot',
        JSON.stringify({
          plant_name: 'Monstera',
          confidence: 0.92,
        })
      );

      (await action({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(recordAIFeedback).toHaveBeenCalledWith(
        'user-123',
        'plant-123',
        'thumbs_up',
        'Great recommendations!',
        { plant_name: 'Monstera', confidence: 0.92 }
      );
    });

    it('handles feedback without comment', async () => {
      const { action } = await import('../dashboard.plants.new-ai');

      const formData = new FormData();
      formData.append('_action', 'save-feedback');
      formData.append('plantId', 'plant-123');
      formData.append('feedbackType', 'thumbs_down');
      formData.append('comment', '');
      formData.append('aiResponseSnapshot', JSON.stringify({}));

      (await action({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(recordAIFeedback).toHaveBeenCalledWith('user-123', 'plant-123', 'thumbs_down', '', {});
    });
  });

  describe('Complete Wizard Flow', () => {
    it('handles full wizard flow: upload → identify → confirm → generate → preview → feedback', async () => {
      // This simulates the complete flow through the wizard
      const { action } = await import('../dashboard.plants.new-ai');

      // Step 1: Upload photo (no server call)
      // Step 2: Identify plant (mocked, no server call)
      // Step 3: Confirm identification (no server call)
      // Step 4: Generate care (mocked, no server call)
      // Step 5: Preview & save plant
      const plantFormData = new FormData();
      plantFormData.append('_action', 'save-plant');
      plantFormData.append('name', 'Monstera deliciosa');
      plantFormData.append('wateringFrequencyDays', '7');
      plantFormData.append('lightRequirements', 'Bright indirect light');
      plantFormData.append('fertilizingTips', JSON.stringify(['Fertilize monthly']));
      plantFormData.append('pruningTips', JSON.stringify(['Prune in spring']));
      plantFormData.append('troubleshooting', JSON.stringify(['Yellow leaves']));
      plantFormData.append('roomId', 'room-1');

      const plantResult = (await action({
        request: new Request('http://localhost', {
          method: 'POST',
          body: plantFormData,
        }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(plantResult).toHaveProperty('plantId');
      expect(createAIPlant).toHaveBeenCalled();

      // Step 6: Submit feedback
      const feedbackFormData = new FormData();
      feedbackFormData.append('_action', 'save-feedback');
      feedbackFormData.append('plantId', plantResult.plantId);
      feedbackFormData.append('feedbackType', 'thumbs_up');
      feedbackFormData.append('comment', 'Perfect!');
      feedbackFormData.append('aiResponseSnapshot', JSON.stringify({}));

      (await action({
        request: new Request('http://localhost', {
          method: 'POST',
          body: feedbackFormData,
        }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(recordAIFeedback).toHaveBeenCalled();
    });
  });

  describe('Error Cases', () => {
    it('handles invalid watering frequency', async () => {
      vi.mocked(createAIPlant).mockRejectedValueOnce(
        new Error('Watering frequency must be between 1 and 365 days')
      );

      const { action } = await import('../dashboard.plants.new-ai');

      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', 'Test');
      formData.append('wateringFrequencyDays', '500');
      formData.append('lightRequirements', '');
      formData.append('fertilizingTips', JSON.stringify([]));
      formData.append('pruningTips', JSON.stringify([]));
      formData.append('troubleshooting', JSON.stringify([]));

      const result = (await action({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(result.error).toContain('Watering frequency');
    });

    it('handles missing plant name', async () => {
      vi.mocked(createAIPlant).mockRejectedValueOnce(new Error('Plant name is required'));

      const { action } = await import('../dashboard.plants.new-ai');

      const formData = new FormData();
      formData.append('_action', 'save-plant');
      formData.append('name', '');
      formData.append('wateringFrequencyDays', '7');
      formData.append('lightRequirements', '');
      formData.append('fertilizingTips', JSON.stringify([]));
      formData.append('pruningTips', JSON.stringify([]));
      formData.append('troubleshooting', JSON.stringify([]));

      const result = (await action({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(result.error).toContain('Plant name');
    });

    it('handles feedback recording failure gracefully', async () => {
      vi.mocked(recordAIFeedback).mockRejectedValueOnce(new Error('Database connection failed'));

      const { action } = await import('../dashboard.plants.new-ai');

      const formData = new FormData();
      formData.append('_action', 'save-feedback');
      formData.append('plantId', 'plant-123');
      formData.append('feedbackType', 'thumbs_up');
      formData.append('comment', '');
      formData.append('aiResponseSnapshot', JSON.stringify({}));

      const result = (await action({
        request: new Request('http://localhost', { method: 'POST', body: formData }),
        params: {},
        unstable_pattern: '',
        context: {},
      } as any)) as any;

      expect(result).toHaveProperty('error');
      expect(result.error).toContain('Database');
    });
  });
});
