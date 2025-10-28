import pino from "pino";

// Configure pino logger
const isNodeRuntime = process.env.NEXT_RUNTIME === "nodejs";
const isDev = process.env.NODE_ENV === "development";

const logger = pino(
  {
    level: (process.env.LOG_LEVEL as any) || "info",
  },
  (() => {
    if (!(isDev && isNodeRuntime)) {
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pinoPretty = require("pino-pretty");
      return pinoPretty({
        colorize: true,
        translateTime: "HH:MM:ss.l",
        ignore: "pid,hostname",
        customPrettifiers: {
          name: (name: string, _key: string, log: any) =>
            log.routine ? `${name}->${log.routine}` : name,
        },
      }) as NodeJS.WritableStream;
    } catch {
      // Fallback to default stream if pino-pretty is unavailable
      return;
    }
  })()
);

// Sugar function to create a logger with a name or object
export function createLogger(nameOrObject: string | Record<string, any>) {
  if (typeof nameOrObject === "string") {
    return logger.child({ name: nameOrObject });
  }
  return logger.child(nameOrObject);
}

export { logger };
