import { describe, expect, it } from 'vitest';

describe('Vitest Setup', () => {
  it('should run basic assertions', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  it('should support async tests', async () => {
    const result = await Promise.resolve('success');
    expect(result).toBe('success');
  });

  it('should support string matching', () => {
    const message = 'Testing is working!';
    expect(message).toContain('working');
  });

  it('should support object comparisons', () => {
    const obj = { name: 'Plant', type: 'Succulent' };
    expect(obj).toEqual({ name: 'Plant', type: 'Succulent' });
  });
});
