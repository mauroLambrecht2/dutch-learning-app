/**
 * API Retry Utility
 * 
 * Provides retry logic for failed API calls with exponential backoff.
 * Handles network errors and transient failures gracefully.
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
};

/**
 * Delays execution for a specified time
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Determines if an error is retryable
 */
function isRetryableError(error: any, retryableStatuses: number[]): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }

  // HTTP status codes
  if (error.status && retryableStatuses.includes(error.status)) {
    return true;
  }

  // Generic errors without status are considered retryable
  // (could be network issues, temporary failures, etc.)
  if (error instanceof Error && !error.hasOwnProperty('status')) {
    return true;
  }

  return false;
}

/**
 * Wraps a fetch call with retry logic
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const config = { ...DEFAULT_OPTIONS, ...retryOptions };
  let lastError: any;
  let currentDelay = config.initialDelay;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If response is ok or not retryable, return it
      if (response.ok || !config.retryableStatuses.includes(response.status)) {
        return response;
      }

      // Store error for potential retry
      lastError = {
        status: response.status,
        statusText: response.statusText
      };

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        return response;
      }

    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        throw error;
      }

      // Check if error is retryable
      if (!isRetryableError(error, config.retryableStatuses)) {
        throw error;
      }
    }

    // Wait before retrying
    await delay(Math.min(currentDelay, config.maxDelay));
    currentDelay *= config.backoffMultiplier;
  }

  // If we get here, all retries failed
  throw lastError;
}

/**
 * Creates a retry wrapper for API methods
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  retryOptions?: RetryOptions
): T {
  return (async (...args: any[]) => {
    const config = { ...DEFAULT_OPTIONS, ...retryOptions };
    let lastError: any;
    let currentDelay = config.initialDelay;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;

        // Don't retry on last attempt
        if (attempt === config.maxRetries) {
          throw error;
        }

        // Check if error is retryable
        if (!isRetryableError(error, config.retryableStatuses)) {
          throw error;
        }

        // Wait before retrying
        await delay(Math.min(currentDelay, config.maxDelay));
        currentDelay *= config.backoffMultiplier;
      }
    }

    throw lastError;
  }) as T;
}
