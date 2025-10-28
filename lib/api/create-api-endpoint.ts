import { createApiHandler } from "./create-api-handler";
import type { ApiRouteHandler, ApiRouteMiddleware } from "./types";

// Type for individual method configuration
export interface ApiRouteHandlerConfig {
  name?: string;
  middlewares?: ApiRouteMiddleware[] | (() => ApiRouteMiddleware[]);
  handler: ApiRouteHandler;
}

// Shorthand not needed; use ApiRouteHandler directly

// Type for handlers object
export type ApiRouteHandlers = {
  GET?: ApiRouteHandlerConfig | ApiRouteHandler;
  POST?: ApiRouteHandlerConfig | ApiRouteHandler;
  PUT?: ApiRouteHandlerConfig | ApiRouteHandler;
  PATCH?: ApiRouteHandlerConfig | ApiRouteHandler;
  DELETE?: ApiRouteHandlerConfig | ApiRouteHandler;
  HEAD?: ApiRouteHandlerConfig | ApiRouteHandler;
  OPTIONS?: ApiRouteHandlerConfig | ApiRouteHandler;
};

// Type for endpoint configuration
export interface ApiRouteEndpointConfig {
  name?: string;
  middlewares?: ApiRouteMiddleware[] | (() => ApiRouteMiddleware[]);
  handlers: ApiRouteHandlers;
}

// Type for the returned endpoint object
export type ApiEndpoint = {
  [K in keyof ApiRouteEndpointConfig["handlers"]]: ReturnType<
    typeof createApiHandler
  >;
};

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
    | (() => ApiRouteMiddleware[])
    | ApiRouteHandlers,
  handlers?: ApiRouteHandlers
): ApiEndpoint {
  // Determine the actual parameters based on the overload
  let name: string;
  let middlewares: ApiRouteMiddleware[];
  let handlersObject: ApiRouteHandlers;

  if (typeof nameOrConfigOrHandlers === "string") {
    // createApiEndpoint(name, handlers) or createApiEndpoint(name, middlewares, handlers)
    name = nameOrConfigOrHandlers;
    if (
      Array.isArray(middlewaresOrHandlers) ||
      typeof middlewaresOrHandlers === "function"
    ) {
      // createApiEndpoint(name, middlewares, handlers)
      middlewares =
        typeof middlewaresOrHandlers === "function"
          ? middlewaresOrHandlers()
          : middlewaresOrHandlers;
      handlersObject = handlers || {};
    } else {
      // createApiEndpoint(name, handlers)
      middlewares = [];
      handlersObject = middlewaresOrHandlers || {};
    }
  } else if (
    typeof nameOrConfigOrHandlers === "object" &&
    "handlers" in nameOrConfigOrHandlers
  ) {
    // Full config object: createApiEndpoint(config)
    const config = nameOrConfigOrHandlers;
    name = config.name || "api";
    middlewares =
      typeof config.middlewares === "function"
        ? config.middlewares()
        : config.middlewares || [];
    handlersObject = config.handlers;
  } else if (
    Array.isArray(nameOrConfigOrHandlers) ||
    typeof nameOrConfigOrHandlers === "function"
  ) {
    // createApiEndpoint(middlewares, handlers)
    name = "api";
    middlewares =
      typeof nameOrConfigOrHandlers === "function"
        ? nameOrConfigOrHandlers()
        : nameOrConfigOrHandlers;
    handlersObject = (middlewaresOrHandlers as ApiRouteHandlers) || {};
  } else {
    // createApiEndpoint(handlers)
    name = "api";
    middlewares = [];
    handlersObject = nameOrConfigOrHandlers as ApiRouteHandlers;
  }

  const endpoint: Partial<ApiEndpoint> = {};

  // Create handlers for each configured method
  for (const [method, methodConfig] of Object.entries(handlersObject)) {
    if (!methodConfig) {
      continue;
    }

    // Handle both shorthand syntax (function) and full config object
    let methodMiddlewares: ApiRouteMiddleware[] = [];
    let handler: ApiRouteHandler;
    let handlerName: string;

    if (typeof methodConfig === "function") {
      // Shorthand syntax: GET: async () => {}
      handler = methodConfig;
      handlerName = name;
    } else {
      // Full config object: GET: { name?, middlewares: [...], handler: ... }
      methodMiddlewares =
        typeof methodConfig.middlewares === "function"
          ? methodConfig.middlewares()
          : methodConfig.middlewares || [];
      handler = methodConfig.handler;
      handlerName = methodConfig.name || name;
    }

    // Combine endpoint middlewares with method-specific middlewares
    const finalMiddlewares = [...middlewares, ...methodMiddlewares];

    // Create the API handler for this method
    endpoint[method as keyof ApiEndpoint] = createApiHandler(
      handlerName,
      finalMiddlewares,
      handler
    );
  }

  return endpoint as ApiEndpoint;
}
