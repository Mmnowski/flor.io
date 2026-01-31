/**
 * Error handling utilities for AI Wizard
 * Provides consistent error messages and recovery strategies
 */

export type ErrorType =
  | 'network'
  | 'timeout'
  | 'invalid_file'
  | 'api_error'
  | 'validation'
  | 'cancelled'
  | 'unknown';

/**
 * Custom error class with type information
 */
export class TypedError extends Error {
  type: ErrorType;

  constructor(message: string, type: ErrorType = 'unknown') {
    super(message);
    this.type = type;
    Object.setPrototypeOf(this, TypedError.prototype);
  }
}

export interface ErrorInfo {
  type: ErrorType;
  message: string;
  code?: string;
  canRetry: boolean;
  userMessage: string;
}

/**
 * Parse error into structured format with user-friendly message
 */
export function parseError(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Network errors
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: 'network',
        message: error.message,
        canRetry: true,
        userMessage: 'Network connection failed. Please check your internet and try again.',
      };
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('took too long')) {
      return {
        type: 'timeout',
        message: error.message,
        canRetry: true,
        userMessage: 'The request took too long. Please try again.',
      };
    }

    // File/validation errors
    if (message.includes('file') || message.includes('invalid')) {
      return {
        type: 'invalid_file',
        message: error.message,
        canRetry: false,
        userMessage: error.message,
      };
    }

    // API errors
    if (message.includes('api') || message.includes('server')) {
      return {
        type: 'api_error',
        message: error.message,
        canRetry: true,
        userMessage: error.message, // Show actual error message for API errors
      };
    }

    // Cancelled
    if (message.includes('cancel')) {
      return {
        type: 'cancelled',
        message: error.message,
        canRetry: false,
        userMessage: 'Operation cancelled.',
      };
    }
  }

  // Default unknown error
  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : String(error),
    canRetry: true,
    userMessage: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Timeout promise utility
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Request took too long'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        reject(new TypedError(timeoutMessage, 'timeout'));
      }, timeoutMs)
    ),
  ]);
}

/**
 * Retry utility with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
  } = options;

  let lastError: Error | undefined;
  let delay = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if it's not a retryable error
      const errorInfo = parseError(error);
      if (!errorInfo.canRetry) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  const errorInfo = parseError(error);
  return errorInfo.type === 'network' || errorInfo.type === 'timeout';
}

/**
 * Check if error is retryable
 */
export function isRetryable(error: unknown): boolean {
  const errorInfo = parseError(error);
  return errorInfo.canRetry;
}
