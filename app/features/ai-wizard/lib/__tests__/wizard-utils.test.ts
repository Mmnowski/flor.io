import { describe, expect, it } from 'vitest';

import { buildFeedbackFormData, buildPlantFormData, fileToBase64 } from '../wizard-utils';

describe('wizard-utils', () => {
  describe('fileToBase64', () => {
    it('should convert a file to base64 string', async () => {
      const content = 'test image content';
      const file = new File([content], 'test.jpg', { type: 'image/jpeg' });

      const result = await fileToBase64(file);

      // The result should be a base64 string (without the data URL prefix)
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Should not contain the data URL prefix
      expect(result).not.toContain('data:');
    });

    it('should handle empty file', async () => {
      const file = new File([], 'empty.jpg', { type: 'image/jpeg' });

      const result = await fileToBase64(file);

      expect(typeof result).toBe('string');
    });

    it('should handle different file types', async () => {
      const pngFile = new File(['png content'], 'test.png', { type: 'image/png' });
      const webpFile = new File(['webp content'], 'test.webp', { type: 'image/webp' });

      const pngResult = await fileToBase64(pngFile);
      const webpResult = await fileToBase64(webpFile);

      expect(typeof pngResult).toBe('string');
      expect(typeof webpResult).toBe('string');
    });
  });

  describe('buildPlantFormData', () => {
    const mockState = {
      manualPlantName: 'Test Plant',
      careInstructions: {
        wateringFrequencyDays: 7,
        wateringAmount: 'mid' as const,
        lightRequirements: 'Bright indirect light',
        fertilizingTips: ['Tip 1', 'Tip 2'],
        pruningTips: ['Prune tip'],
        troubleshooting: ['Debug tip'],
      },
      selectedRoomId: 'room-123',
    };

    it('should build FormData with all required fields', () => {
      const formData = buildPlantFormData(mockState, null);

      expect(formData.get('_action')).toBe('save-plant');
      expect(formData.get('name')).toBe('Test Plant');
      expect(formData.get('wateringFrequencyDays')).toBe('7');
      expect(formData.get('wateringAmount')).toBe('mid');
      expect(formData.get('lightRequirements')).toBe('Bright indirect light');
      expect(formData.get('roomId')).toBe('room-123');
    });

    it('should serialize array fields as JSON', () => {
      const formData = buildPlantFormData(mockState, null);

      const fertilizingTips = JSON.parse(formData.get('fertilizingTips') as string);
      const pruningTips = JSON.parse(formData.get('pruningTips') as string);
      const troubleshooting = JSON.parse(formData.get('troubleshooting') as string);

      expect(fertilizingTips).toEqual(['Tip 1', 'Tip 2']);
      expect(pruningTips).toEqual(['Prune tip']);
      expect(troubleshooting).toEqual(['Debug tip']);
    });

    it('should include photoBase64 when provided', () => {
      const formData = buildPlantFormData(mockState, 'base64EncodedPhoto');

      expect(formData.get('photoBase64')).toBe('base64EncodedPhoto');
    });

    it('should not include photoBase64 when null', () => {
      const formData = buildPlantFormData(mockState, null);

      expect(formData.get('photoBase64')).toBeNull();
    });

    it('should use default values for missing care instructions', () => {
      const stateWithNullInstructions = {
        manualPlantName: 'Test Plant',
        careInstructions: null,
        selectedRoomId: null,
      };

      const formData = buildPlantFormData(stateWithNullInstructions, null);

      expect(formData.get('wateringFrequencyDays')).toBe('7');
      expect(formData.get('wateringAmount')).toBe('mid');
      expect(formData.get('lightRequirements')).toBe('');
      expect(formData.get('roomId')).toBe('');
    });

    it('should handle empty selectedRoomId', () => {
      const stateWithNoRoom = {
        ...mockState,
        selectedRoomId: null,
      };

      const formData = buildPlantFormData(stateWithNoRoom, null);

      expect(formData.get('roomId')).toBe('');
    });
  });

  describe('buildFeedbackFormData', () => {
    it('should build FormData with all required fields', () => {
      const aiSnapshot = {
        identification: { name: 'Monstera' },
        careInstructions: { wateringFrequencyDays: 7 },
      };

      const formData = buildFeedbackFormData('plant-123', 'thumbs_up', 'Great!', aiSnapshot);

      expect(formData.get('_action')).toBe('save-feedback');
      expect(formData.get('plantId')).toBe('plant-123');
      expect(formData.get('feedbackType')).toBe('thumbs_up');
      expect(formData.get('comment')).toBe('Great!');
    });

    it('should serialize aiResponseSnapshot as JSON', () => {
      const aiSnapshot = {
        identification: { scientificName: 'Monstera deliciosa' },
        careInstructions: { wateringFrequencyDays: 7 },
      };

      const formData = buildFeedbackFormData(
        'plant-123',
        'thumbs_down',
        'Not accurate',
        aiSnapshot
      );

      const snapshot = JSON.parse(formData.get('aiResponseSnapshot') as string);
      expect(snapshot.identification.scientificName).toBe('Monstera deliciosa');
      expect(snapshot.careInstructions.wateringFrequencyDays).toBe(7);
    });

    it('should handle empty comment', () => {
      const aiSnapshot = { identification: null, careInstructions: null };

      const formData = buildFeedbackFormData('plant-123', 'thumbs_up', '', aiSnapshot);

      expect(formData.get('comment')).toBe('');
    });

    it('should handle thumbs_down feedback type', () => {
      const aiSnapshot = { identification: null, careInstructions: null };

      const formData = buildFeedbackFormData('plant-123', 'thumbs_down', 'Incorrect', aiSnapshot);

      expect(formData.get('feedbackType')).toBe('thumbs_down');
    });
  });
});
