import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  isNetworkError,
  isRetryable,
  parseError,
  withRetry,
  withTimeout,
} from '../utils/error-handling';

describe('Error Handling Utilities', () => {
  describe('parseError', () => {
    it('parses network errors', () => {
      const error = new Error('Network request failed');
      const parsed = parseError(error);

      expect(parsed.type).toBe('network');
      expect(parsed.canRetry).toBe(true);
      expect(parsed.userMessage).toContain('Network');
    });

    it('parses timeout errors', () => {
      const error = new Error('Request timeout');
      const parsed = parseError(error);

      expect(parsed.type).toBe('timeout');
      expect(parsed.canRetry).toBe(true);
      expect(parsed.userMessage).toContain('too long');
    });

    it('parses file/validation errors', () => {
      const error = new Error('Invalid file format');
      const parsed = parseError(error);

      expect(parsed.type).toBe('invalid_file');
      expect(parsed.canRetry).toBe(false);
    });

    it('parses API errors', () => {
      const error = new Error('API server error');
      const parsed = parseError(error);

      expect(parsed.type).toBe('api_error');
      expect(parsed.canRetry).toBe(true);
    });

    it('parses cancellation errors', () => {
      const error = new Error('Operation cancelled');
      const parsed = parseError(error);

      expect(parsed.type).toBe('cancelled');
      expect(parsed.canRetry).toBe(false);
    });

    it('handles unknown errors', () => {
      const parsed = parseError('Some random string');

      expect(parsed.type).toBe('unknown');
      expect(parsed.canRetry).toBe(true);
      expect(parsed.userMessage).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('withTimeout', () => {
    it('resolves when promise completes within timeout', async () => {
      const promise = Promise.resolve('success');
      const result = await withTimeout(promise, 1000);

      expect(result).toBe('success');
    });

    it('rejects when promise exceeds timeout', async () => {
      const promise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('too late'), 2000);
      });

      await expect(withTimeout(promise, 100)).rejects.toThrow('took too long');
    });

    it('accepts custom timeout message', async () => {
      const promise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('too late'), 2000);
      });

      await expect(withTimeout(promise, 100, 'Custom timeout')).rejects.toThrow('Custom timeout');
    });
  });

  describe('withRetry', () => {
    it('returns value on first success', async () => {
      const fn = vi.fn().mockResolvedValueOnce('success');

      const result = await withRetry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries on failure and succeeds', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const result = await withRetry(fn, { maxRetries: 2, initialDelayMs: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('gives up after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Persistent error'));

      await expect(withRetry(fn, { maxRetries: 2, initialDelayMs: 10 })).rejects.toThrow(
        'Persistent error'
      );

      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('does not retry non-retryable errors', async () => {
      const error = new Error('Invalid file format');
      const fn = vi.fn().mockRejectedValueOnce(error);

      await expect(withRetry(fn)).rejects.toThrow('Invalid file format');

      expect(fn).toHaveBeenCalledTimes(1); // only initial attempt
    });

    it('implements exponential backoff', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce('success');

      const startTime = Date.now();
      await withRetry(fn, {
        maxRetries: 3,
        initialDelayMs: 50,
        backoffMultiplier: 2,
      });
      const elapsed = Date.now() - startTime;

      // Should have at least 50ms + 100ms delay
      expect(elapsed).toBeGreaterThanOrEqual(150 - 50); // Allow some variance
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('caps backoff at maxDelayMs', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Network error'));

      try {
        await withRetry(fn, {
          maxRetries: 5,
          initialDelayMs: 100,
          maxDelayMs: 200,
          backoffMultiplier: 3,
        });
      } catch {
        // Expected to fail after retries
      }

      // With backoff multiplier of 3:
      // Attempt 1: immediate
      // Attempt 2: after 100ms
      // Attempt 3: after min(300, 200) = 200ms
      // Attempt 4: after min(600, 200) = 200ms
      // Attempt 5: after min(600, 200) = 200ms
      // Attempt 6: after min(600, 200) = 200ms

      expect(fn).toHaveBeenCalledTimes(6); // initial + 5 retries
    });
  });

  describe('isNetworkError', () => {
    it('detects network errors', () => {
      const error = new Error('Network request failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('detects timeout errors', () => {
      const error = new Error('Request timeout');
      expect(isNetworkError(error)).toBe(true);
    });

    it('returns false for non-network errors', () => {
      const error = new Error('Invalid file');
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isRetryable', () => {
    it('returns true for retryable errors', () => {
      const error = new Error('Network request failed');
      expect(isRetryable(error)).toBe(true);
    });

    it('returns false for non-retryable errors', () => {
      const error = new Error('Invalid file format');
      expect(isRetryable(error)).toBe(false);
    });
  });
});
