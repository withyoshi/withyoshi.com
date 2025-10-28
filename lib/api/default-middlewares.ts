import { withErrorHandling } from "./middleware/with-error-handling";
import { withIP } from "./middleware/with-ip";
import { withRequestId } from "./middleware/with-request-id";
import type { ApiRouteMiddleware } from "./types";

export const defaultMiddlewares: ApiRouteMiddleware[] = [
  withRequestId,
  withIP,
  withErrorHandling,
];
