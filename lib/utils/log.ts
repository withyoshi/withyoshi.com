import pino from "pino";

// Configure pino logger
const logger = pino({
  level: (process.env.LOG_LEVEL as any) || "info",
  formatters: {
    log(meta) {
      const { name, routine, msg } = meta;
      let prefix = "[unknown]";

      if (name && routine) {
        prefix = `[${name}:${routine}]`;
      } else if (name) {
        prefix = `[${name}]`;
      }

      return {
        ...meta,
        msg: `${prefix} ${msg}`,
      };
    },
  },
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss.l",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

// Sugar function to create a logger with a name or object
export function createLogger(nameOrObject: string | Record<string, any>) {
  if (typeof nameOrObject === "string") {
    return logger.child({ name: nameOrObject });
  }
  return logger.child(nameOrObject);
}

export { logger };
