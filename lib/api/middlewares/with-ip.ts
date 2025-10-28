import { getClientIP } from "@/lib/net/ip-info";
import type { ApiRouteMiddleware } from "../types";

// Augment the ApiRouteHandlerContext type
declare module "../types" {
  interface ApiRouteHandlerContext {
    ip?: string; // Added by withIPDetection middleware
  }
}

export const withIP: ApiRouteMiddleware = async (request, context, next) => {
  // Get client ip
  const ip = getClientIP(request);

  // Add ip to the middleware context
  context.ip = ip;

  // Add ip to the logger metadata
  context.logger = context.logger.child({ ip });

  // Call next middleware
  return next();
};
