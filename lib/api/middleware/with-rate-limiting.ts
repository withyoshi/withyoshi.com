import type { NextRequest } from "next/server";
import type { MiddlewareFunction } from "../types";

// Augment the MiddlewareContext type
declare module "../types" {
  interface MiddlewareContext {
    // withRateLimiting doesn't add properties to context
  }
}

// Example:
// 10 requests per 60 seconds => withRateLimiting(10, 60000)

export function withRateLimiting(
  maxRequests: number,
  windowMs: number,
  keyGenerator?: (request: NextRequest) => string
): MiddlewareFunction {
  // Simple in-memory rate limiting (in production, use Redis or similar)
  const requests = new Map<string, { count: number; resetTime: number }>();

  return async (request, context, next) => {
    const key = keyGenerator ? keyGenerator(request) : context.ip || "unknown";
    const now = Date.now();

    const current = requests.get(key);

    if (current) {
      if (now > current.resetTime) {
        // Reset window
        requests.set(key, { count: 1, resetTime: now + windowMs });
      } else if (current.count >= maxRequests) {
        // Rate limit exceeded
        const log = context.logger.child({ routine: "RateLimiting" });
        log.warn(
          {
            key,
            count: current.count,
            maxRequests,
          },
          `Rate limit exceeded for key: ${key}`
        );

        return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
      } else {
        // Increment count
        current.count++;
      }
    } else {
      // First request
      requests.set(key, { count: 1, resetTime: now + windowMs });
    }

    return next();
  };
}
