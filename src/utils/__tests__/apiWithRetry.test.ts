/**
 * Tests for API retry logic
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWithRetry, withRetry } from '../apiWithRetry';

describe('apiWithRetry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchWithRetry', () => {
    it('should return response on successful fetch', async () => {
      const mockResponse = new Response('{"data": "test"}', { status: 200 });
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const response = await fetchWithRetry('https://api.test.com/data');
      
      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should retry on 500 error', async () => {
      const mockError = new Response('Server Error', { status: 500 });
      const mockSuccess = new Response('{"data": "test"}', { status: 200 });
      
      global.fetch = vi.fn()
        .mockResolvedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccess);

      const response = await fetchWithRetry('https://api.test.com/data', {}, {
        maxRetries: 1,
        initialDelay: 10
      });
      
      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should retry on network error', async () => {
      const networkError = new TypeError('Failed to fetch');
      const mockSuccess = new Response('{"data": "test"}', { status: 200 });
      
      global.fetch = vi.fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockSuccess);

      const response = await fetchWithRetry('https://api.test.com/data', {}, {
        maxRetries: 1,
        initialDelay: 10
      });
      
      expect(response.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry on 404 error', async () => {
      const mockError = new Response('Not Found', { status: 404 });
      
      global.fetch = vi.fn().mockResolvedValue(mockError);

      const response = await fetchWithRetry('https://api.test.com/data', {}, {
        maxRetries: 3,
        initialDelay: 10
      });
      
      expect(response.status).toBe(404);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries exceeded', async () => {
      const networkError = new TypeError('Failed to fetch');
      
      global.fetch = vi.fn().mockRejectedValue(networkError);

      await expect(
        fetchWithRetry('https://api.test.com/data', {}, {
          maxRetries: 2,
          initialDelay: 10
        })
      ).rejects.toThrow('Failed to fetch');
      
      expect(global.fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should use exponential backoff', async () => {
      const networkError = new TypeError('Failed to fetch');
      const startTime = Date.now();
      
      global.fetch = vi.fn().mockRejectedValue(networkError);

      try {
        await fetchWithRetry('https://api.test.com/data', {}, {
          maxRetries: 2,
          initialDelay: 100,
          backoffMultiplier: 2
        });
      } catch (error) {
        // Expected to fail
      }
      
      const elapsed = Date.now() - startTime;
      // Should wait at least 100ms + 200ms = 300ms
      expect(elapsed).toBeGreaterThanOrEqual(250);
    });
  });

  describe('withRetry', () => {
    it('should wrap function with retry logic', async () => {
      let callCount = 0;
      const mockFn = vi.fn(async () => {
        callCount++;
        if (callCount < 2) {
          throw new Error('Temporary error');
        }
        return { success: true };
      });

      const wrappedFn = withRetry(mockFn, {
        maxRetries: 2,
        initialDelay: 10
      });

      const result = await wrappedFn();
      
      expect(result).toEqual({ success: true });
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should preserve function arguments', async () => {
      const mockFn = vi.fn(async (a: number, b: string) => {
        return { a, b };
      });

      const wrappedFn = withRetry(mockFn);

      const result = await wrappedFn(42, 'test');
      
      expect(result).toEqual({ a: 42, b: 'test' });
      expect(mockFn).toHaveBeenCalledWith(42, 'test');
    });

    it('should not retry non-retryable errors', async () => {
      const mockFn = vi.fn(async () => {
        const error: any = new Error('Bad request');
        error.status = 400;
        throw error;
      });

      const wrappedFn = withRetry(mockFn, {
        maxRetries: 3,
        initialDelay: 10
      });

      await expect(wrappedFn()).rejects.toThrow('Bad request');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
