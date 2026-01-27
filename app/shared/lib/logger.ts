/**
 * Logger Utility
 *
 * Centralized logging for the application.
 * Replaces direct console calls with structured logging.
 *
 * In development, logs to console.
 * In production, logs could be sent to external service.
 */

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDev = import.meta.env.DEV;

  /**
   * Log debug information (lowest priority)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  /**
   * Log general information
   */
  info(message: string, context?: LogContext): void {
    console.info(`[INFO] ${message}`, context);
  }

  /**
   * Log warnings (something unexpected but handled)
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context);
  }

  /**
   * Log errors (something went wrong)
   * @param message - Description of the error
   * @param error - Optional error object or exception
   * @param context - Optional additional context
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorObj =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;

    console.error(`[ERROR] ${message}`, {
      error: errorObj,
      ...context,
    });
  }
}

export const logger = new Logger();
