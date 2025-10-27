import pino from "pino";

// Configure pino logger
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

// Logger factory that pre-fills common context
export const createLogger = (service: string) => ({
  info: (operation: string, message: string, extra?: any) =>
    logger.info({ service, operation, ...extra }, message),

  warn: (operation: string, message: string, extra?: any) =>
    logger.warn({ service, operation, ...extra }, message),

  error: (operation: string, message: string, extra?: any) =>
    logger.error({ service, operation, ...extra }, message),

  debug: (operation: string, message: string, extra?: any) =>
    logger.debug({ service, operation, ...extra }, message),

  // Fluent API for repeated operations
  for: (operation: string) => ({
    info: (message: string, extra?: any) =>
      logger.info({ service, operation, ...extra }, message),

    warn: (message: string, extra?: any) =>
      logger.warn({ service, operation, ...extra }, message),

    error: (message: string, extra?: any) =>
      logger.error({ service, operation, ...extra }, message),

    debug: (message: string, extra?: any) =>
      logger.debug({ service, operation, ...extra }, message),
  }),
});

// Export the base logger for cases where you need it directly
export { logger };
