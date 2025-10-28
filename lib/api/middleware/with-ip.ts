import { getClientIP } from "@/lib/net/ip-info";
import type { MiddlewareFunction } from "../types";

// Augment the MiddlewareContext type
declare module "../types" {
  interface MiddlewareContext {
    ip?: string; // Added by withIPDetection middleware
  }
}

export const withIP: MiddlewareFunction = async (request, context, next) => {
  // Get client ip
  const ip = getClientIP(request);

  // Add ip to the middleware context
  context.ip = ip;

  // Add ip to the logger metadata
  context.logger = context.logger.child({ ip });

  // Call next middleware
  return next();
};
