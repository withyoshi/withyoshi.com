import { createApiRoute } from "./create-api-route";
import { normalizeMiddlewares } from "./middlewares";
import type {
  ApiRouteHandler,
  ApiRouteMiddleware,
  ApiRouteMiddlewareModifier,
  NextApiRouteHandler,
} from "./types";

// Function overloads for different parameter combinations
export function createApiHandler(handler: ApiRouteHandler): NextApiRouteHandler;
export function createApiHandler(
  name: string,
  handler: ApiRouteHandler
): NextApiRouteHandler;
export function createApiHandler(
  name: string,
  middlewares: ApiRouteMiddleware[] | (() => ApiRouteMiddleware[]),
  handler: ApiRouteHandler
): NextApiRouteHandler;
export function createApiHandler(
  middlewares: ApiRouteMiddleware[] | (() => ApiRouteMiddleware[]),
  handler: ApiRouteHandler
): NextApiRouteHandler;

/**
 * Creates an API handler with flexible parameter handling
 *
 * Supports multiple function signatures:
 * - createApiHandler(handler) - Just a handler function
 * - createApiHandler(name, handler) - Handler with service name
 * - createApiHandler(name, middlewares, handler) - Full configuration
 * - createApiHandler(middlewares, handler) - Middlewares without service name
 *
 * @param nameOrMiddlewaresOrHandler - Service name, middlewares array/function, or handler function
 * @param middlewaresOrHandler - Middlewares array/function or handler function
 * @param handler - Handler function (when using 3-parameter form)
 * @returns Configured API route handler
 */
export function createApiHandler(
  nameOrMiddlewaresOrHandler:
    | string
    | ApiRouteMiddleware[]
    | (() => ApiRouteMiddleware[])
    | ApiRouteHandler,
  middlewaresOrHandler?:
    | ApiRouteMiddleware[]
    | (() => ApiRouteMiddleware[])
    | ApiRouteHandler,
  handler?: ApiRouteHandler
): NextApiRouteHandler {
  let name = "";
  let middlewares: ApiRouteMiddleware[] | ApiRouteMiddlewareModifier;
  let finalHandler: ApiRouteHandler;

  // Determine which parameter combination we're dealing with based on parameter types
  if (
    typeof nameOrMiddlewaresOrHandler === "function" &&
    !middlewaresOrHandler
  ) {
    // createApiHandler(handler)
    middlewares = [];
    finalHandler = nameOrMiddlewaresOrHandler as ApiRouteHandler;
  } else if (
    typeof nameOrMiddlewaresOrHandler === "string" &&
    typeof middlewaresOrHandler === "function" &&
    !handler
  ) {
    // createApiHandler(name, handler)
    name = nameOrMiddlewaresOrHandler;
    middlewares = [];
    finalHandler = middlewaresOrHandler as ApiRouteHandler;
  } else if (
    typeof nameOrMiddlewaresOrHandler === "string" &&
    middlewaresOrHandler &&
    typeof handler === "function"
  ) {
    // createApiHandler(name, middlewares, handler)
    name = nameOrMiddlewaresOrHandler;
    middlewares = middlewaresOrHandler as
      | ApiRouteMiddleware[]
      | (() => ApiRouteMiddleware[]);
    finalHandler = handler;
  } else if (
    typeof nameOrMiddlewaresOrHandler !== "string" &&
    typeof middlewaresOrHandler === "function"
  ) {
    // createApiHandler(middlewares, handler)
    middlewares = nameOrMiddlewaresOrHandler as
      | ApiRouteMiddleware[]
      | (() => ApiRouteMiddleware[]);
    finalHandler = middlewaresOrHandler as ApiRouteHandler;
  } else {
    throw new Error("Invalid parameter combination for createApiHandler");
  }

  // Normalize middlewares using the helper
  const finalMiddlewares = normalizeMiddlewares(
    middlewares as ApiRouteMiddleware[] | ApiRouteMiddlewareModifier | undefined
  );

  // Delegate route creation; createApiRoute will default name to "api" if needed
  return createApiRoute({
    name,
    middlewares: finalMiddlewares,
    handler: finalHandler,
  });
}
