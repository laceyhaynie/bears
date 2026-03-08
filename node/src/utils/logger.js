/**
 * Simple Logger Utility
 *
 * Provides consistent logging across the application.
 * In production, you might want to use a library like Winston or Pino.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log levels with colors for console output
 */
const colors = {
  info: '\x1b[36m',    // Cyan
  success: '\x1b[32m', // Green
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  reset: '\x1b[0m'     // Reset color
};

/**
 * Format timestamp for logs
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Log informational message
 */
export function info(message, ...args) {
  console.log(
    `${colors.info}[${getTimestamp()}] INFO:${colors.reset}`,
    message,
    ...args
  );
}

/**
 * Log success message
 */
export function success(message, ...args) {
  console.log(
    `${colors.success}[${getTimestamp()}] SUCCESS:${colors.reset}`,
    message,
    ...args
  );
}

/**
 * Log warning message
 */
export function warn(message, ...args) {
  console.warn(
    `${colors.warn}[${getTimestamp()}] WARN:${colors.reset}`,
    message,
    ...args
  );
}

/**
 * Log error message
 */
export function error(message, ...args) {
  console.error(
    `${colors.error}[${getTimestamp()}] ERROR:${colors.reset}`,
    message,
    ...args
  );
}

/**
 * Log debug message (only in development)
 */
export function debug(message, ...args) {
  if (isDevelopment) {
    console.log(
      `${colors.info}[${getTimestamp()}] DEBUG:${colors.reset}`,
      message,
      ...args
    );
  }
}

export default { info, success, warn, error, debug };
