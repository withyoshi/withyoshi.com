import { createApiHandler } from "./create-api-handler";
import { defaultMiddlewares, normalizeMiddlewares } from "./middlewares";
import type {
  ApiEndpoint,
  ApiRouteEndpointConfig,
  ApiRouteHandler,
  ApiRouteHandlers,
  ApiRouteMiddleware,
  ApiRouteMiddlewareModifier,
} from "./types";

/**
 * Creates a complete API endpoint with multiple HTTP methods
 *
 * Supports four syntaxes:
 * 1. createApiEndpoint(handlers) - Just handlers
 * 2. createApiEndpoint(name, handlers) - Name and handlers
 * 3. createApiEndpoint(name, middlewares, handlers) - Name, middlewares, and handlers
 * 4. createApiEndpoint(middlewares, handlers) - Middlewares and handlers
 * 5. createApiEndpoint(config) - Full config object
 *
 * Middlewares can be arrays or functions that return arrays for dynamic behavior.
 */
// Function overloads for different syntaxes
export function createApiEndpoint(handlers: ApiRouteHandlers): ApiEndpoint;
export function createApiEndpoint(
  name: string,
  handlers: ApiRouteHandlers
): ApiEndpoint;
export function createApiEndpoint(
  name: string,
  middlewares: ApiRouteMiddleware[] | (() => ApiRouteMiddleware[]),
  handlers: ApiRouteHandlers
): ApiEndpoint;
export function createApiEndpoint(
  middlewares: ApiRouteMiddleware[] | (() => ApiRouteMiddleware[]),
  handlers: ApiRouteHandlers
): ApiEndpoint;
export function createApiEndpoint(config: ApiRouteEndpointConfig): ApiEndpoint;

// Main implementation
export function createApiEndpoint(
  nameOrConfigOrHandlers:
    | string
    | ApiRouteEndpointConfig
    | ApiRouteHandlers
    | ApiRouteMiddleware[]
    | (() => ApiRouteMiddleware[]),
  middlewaresOrHandlers?:
    | ApiRouteMiddleware[]
    | ApiRouteMiddlewareModifier
    | ApiRouteHandlers,
  handlers?: ApiRouteHandlers
): ApiEndpoint {
  // Normalize arguments based on overload pattern
  let endpointName = "";
  let endpointMiddlewares: ApiRouteMiddleware[];
  let endpointHandlers: ApiRouteHandlers;

  // Pattern: createApiEndpoint({ name?, middlewares?, handlers })
  if (
    typeof nameOrConfigOrHandlers === "object" &&
    "handlers" in nameOrConfigOrHandlers
  ) {
    const { name = "", middlewares, handlers: h } = nameOrConfigOrHandlers;
    endpointName = name;
    endpointMiddlewares = normalizeMiddlewares(middlewares);
    endpointHandlers = h;
  }
  // Pattern: createApiEndpoint(name, ...) - string as first arg
  else if (typeof nameOrConfigOrHandlers === "string") {
    endpointName = nameOrConfigOrHandlers;
    const isMiddleware =
      Array.isArray(middlewaresOrHandlers) ||
      typeof middlewaresOrHandlers === "function";

    if (isMiddleware) {
      // Pattern: createApiEndpoint(name, middlewares, handlers)
      endpointMiddlewares = normalizeMiddlewares(
        middlewaresOrHandlers as
          | ApiRouteMiddleware[]
          | ApiRouteMiddlewareModifier
      );
      endpointHandlers = handlers || {};
    } else {
      // Pattern: createApiEndpoint(name, handlers)
      endpointMiddlewares = defaultMiddlewares;
      endpointHandlers = middlewaresOrHandlers || {};
    }
  }
  // Pattern: createApiEndpoint(middlewares, handlers) - array/function as first arg
  else if (
    Array.isArray(nameOrConfigOrHandlers) ||
    typeof nameOrConfigOrHandlers === "function"
  ) {
    endpointMiddlewares = normalizeMiddlewares(
      nameOrConfigOrHandlers as
        | ApiRouteMiddleware[]
        | ApiRouteMiddlewareModifier
    );
    endpointHandlers = (middlewaresOrHandlers as ApiRouteHandlers) || {};
  }
  // Pattern: createApiEndpoint(handlers) - just handlers object
  else {
    endpointMiddlewares = defaultMiddlewares;
    endpointHandlers = nameOrConfigOrHandlers;
  }

  const endpoint: Partial<ApiEndpoint> = {};

  // Create handlers for each configured method
  for (const [method, methodConfig] of Object.entries(endpointHandlers)) {
    if (!methodConfig) {
      continue;
    }

    let name = endpointName;
    let middlewares: ApiRouteMiddleware[] = endpointMiddlewares;
    let handler: ApiRouteHandler;

    if (typeof methodConfig === "function") {
      // Shorthand syntax: GET: async () => {}
      handler = methodConfig;
    } else {
      // Full config object: GET: { name?, middlewares: [...], handler: ... }
      const handlerMiddlewares = methodConfig.middlewares;

      if (typeof handlerMiddlewares === "function") {
        middlewares = (handlerMiddlewares as ApiRouteMiddlewareModifier)(
          endpointMiddlewares
        );
      } else {
        middlewares = [
          ...(endpointMiddlewares || []),
          ...(handlerMiddlewares || []),
        ];
      }
      handler = methodConfig.handler;
      name = methodConfig.name || name;
    }

    // Create the API handler for this method
    endpoint[method as keyof ApiEndpoint] = createApiHandler(
      name,
      middlewares,
      handler
    );
  }

  return endpoint as ApiEndpoint;
}
