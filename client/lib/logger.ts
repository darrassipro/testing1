/**
 * A simple logger service that only logs in development.
 * This prevents console.* calls from cluttering the production console.
 */
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logs a standard message.
 * @param message - The primary message to log.
 * @param context - Optional context (e.g., component name, additional data).
 */
export const log = (message: string, ...context: any[]) => {
  if (isDevelopment) {
    console.log(`[LOG] ${message}`, ...context);
  }
};

/**
 * Logs an information message.
 * @param message - The primary message to log.
 * @param context - Optional context.
 */
export const logInfo = (message: string, ...context: any[]) => {
  if (isDevelopment) {
    console.info(`%c[INFO] ${message}`, 'color: #007BFF', ...context);
  }
};

/**
 * Logs a warning.
 * @param message - The warning message.
 * @param context - Optional context.
 */
export const logWarn = (message: string, ...context: any[]) => {
  if (isDevelopment) {
    console.warn(`%c[WARN] ${message}`, 'color: #FFA500', ...context);
  }
};

/**
 * Logs an error.
 * @param message - The error message.
 * @param error - The error object.
 * @param context - Optional context.
 */
export const logError = (
  message: string,
  error?: any,
  ...context: any[]
) => {
  if (isDevelopment) {
    console.error(`%c[ERROR] ${message}`, 'color: #DC3545', error, ...context);
  }
  // In a real production app, you might send this error to a service like Sentry
  // if (!isDevelopment && error) {
  //   Sentry.captureException(error, { extra: { message, ...context } });
  // }
};

const logger = {
  log,
  info: logInfo,
  warn: logWarn,
  error: logError,
};

export default logger;