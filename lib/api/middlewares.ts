import { withErrorHandling } from "./middlewares/with-error-handling";
import { withIP } from "./middlewares/with-ip";
import { withRequestId } from "./middlewares/with-request-id";
import type { ApiRouteMiddleware, ApiRouteMiddlewareModifier } from "./types";

export const defaultMiddlewares: ApiRouteMiddleware[] = [
  withRequestId,
  withIP,
  withErrorHandling,
];

/**
 * Helper to normalize middleware parameter
 * - If function (ApiRouteMiddlewareModifier): calls it with copy of defaultMiddlewares
 * - If array (including empty): merges with defaultMiddlewares
 * Always returns a new array to prevent mutation of shared references
 */
export const normalizeMiddlewares = (
  middlewares: ApiRouteMiddleware[] | ApiRouteMiddlewareModifier = []
): ApiRouteMiddleware[] => {
  if (typeof middlewares === "function") {
    return middlewares([...defaultMiddlewares]);
  }
  return [...defaultMiddlewares, ...middlewares];
};
