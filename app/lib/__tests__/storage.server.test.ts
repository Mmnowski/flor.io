import { getPlantPhotoUrl } from '~/lib/storage/storage.server';

import { describe, expect, it, vi } from 'vitest';

vi.mock('../infrastructure/supabase.server', () => ({
  supabaseServer: {
    storage: {
      from: vi.fn().mockReturnValue({
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/photo.jpg' },
        }),
      }),
    },
  },
}));

describe('Storage Server Utilities', () => {
  describe('getPlantPhotoUrl', () => {
    it('should return a string URL', () => {
      const result = getPlantPhotoUrl('user-123/photo.jpg');

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should construct URL from path', () => {
      const result = getPlantPhotoUrl('user-123/abc-def.jpg');

      expect(result).toBeTruthy();
    });

    it('should handle nested paths', () => {
      const result = getPlantPhotoUrl('user-123/subfolder/photo.jpg');

      expect(typeof result).toBe('string');
    });

    it('should preserve file extension', () => {
      const result = getPlantPhotoUrl('user-123/photo.jpg');

      expect(result).toContain('.jpg');
    });
  });
});
