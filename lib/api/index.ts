// Core functions

export type {
  ApiEndpoint,
  ApiRouteEndpointConfig,
  ApiRouteHandlerConfig,
  ApiRouteHandlers,
} from "./create-api-endpoint";
export { createApiEndpoint } from "./create-api-endpoint";
export { createApiHandler } from "./create-api-handler";
export { withAuth } from "./middleware/with-auth";
export { withErrorHandling } from "./middleware/with-error-handling";
export { withIP } from "./middleware/with-ip";
export { withRateLimiting } from "./middleware/with-rate-limiting";
// Middleware functions
export { withRequestId } from "./middleware/with-request-id";
export { withValidation } from "./middleware/with-validation";
// Types
export type {
  ApiRouteHandler,
  ApiRouteHandlerContext,
  ApiRouteMiddleware,
  NextApiRouteHandler,
} from "./types";
