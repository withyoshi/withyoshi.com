import type { NextRequest } from "next/server";
import { logger } from "@/lib/utils/log";
import { defaultMiddlewares } from "./default-middlewares";
import type {
  ApiRouteHandler,
  ApiRouteHandlerContext,
  ApiRouteMiddleware,
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
  // Default middleware stack
  const builtinDefaultMiddlewares: ApiRouteMiddleware[] = defaultMiddlewares;

  let name: string;
  let middlewares: ApiRouteMiddleware[] | (() => ApiRouteMiddleware[]);
  let finalHandler: ApiRouteHandler;

  // Determine which parameter combination we're dealing with based on parameter types
  if (
    typeof nameOrMiddlewaresOrHandler === "function" &&
    !middlewaresOrHandler
  ) {
    // createApiHandler(handler)
    name = "api";
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
    name = "api";
    middlewares = nameOrMiddlewaresOrHandler as
      | ApiRouteMiddleware[]
      | (() => ApiRouteMiddleware[]);
    finalHandler = middlewaresOrHandler as ApiRouteHandler;
  } else {
    throw new Error("Invalid parameter combination for createApiHandler");
  }

  // Determine which middlewares to use
  let finalMiddlewares: ApiRouteMiddleware[];

  if (typeof middlewares === "function") {
    // If a function is provided, it returns an array of middlewares that overrides defaults
    finalMiddlewares = middlewares();
  } else {
    // Otherwise, add custom middlewares to the default stack
    finalMiddlewares = [...builtinDefaultMiddlewares, ...middlewares];
  }

  // Return the merged createRoute logic directly
  return async (
    request: NextRequest,
    { params }: { params: Promise<Record<string, string>> }
  ) => {
    const context: ApiRouteHandlerContext = {
      name,
      params,
      logger: logger.child({ type: "route", name }),
    };

    // Create middleware chain
    let next = () => finalHandler(request, context);

    for (let i = finalMiddlewares.length - 1; i >= 0; i--) {
      const middleware = finalMiddlewares[i];
      const currentNext = next;
      next = () => middleware(request, context, currentNext);
    }

    return next();
  };
}
