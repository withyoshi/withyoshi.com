import { nanoid } from "nanoid";
import type { MiddlewareFunction } from "../types";

// Augment the MiddlewareContext type
declare module "../types" {
  interface MiddlewareContext {
    requestId?: string; // Added by withRequestId middleware
  }
}

export const withRequestId: MiddlewareFunction = async (
  _request,
  context,
  next
) => {
  // Create requestId
  const requestId = nanoid(); // 21 characters, URL-safe

  // Add requestId to the middleware context
  context.requestId = requestId;

  // Add requestId to the logger metadata
  context.logger = context.logger.child({ requestId });

  // Add requestId to the response header
  const response = await next();
  response.headers.set("x-request-id", requestId);

  return response;
};
