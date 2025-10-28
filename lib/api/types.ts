import type { NextRequest } from "next/server";
import type { logger } from "@/lib/utils/log";

// Core types
export interface ApiRouteHandlerContext {
  name: string;
  params: Promise<Record<string, string>>;
  logger: typeof logger;
  [key: string]: any; // Allow additional properties
}

export type ApiRouteMiddleware = (
  request: NextRequest,
  context: ApiRouteHandlerContext,
  next: () => Promise<Response>
) => Promise<Response>;

// Function that can modify the default middleware stack
export type ApiRouteMiddlewareModifier = (
  defaultMiddlewares: ApiRouteMiddleware[]
) => ApiRouteMiddleware[];

export type ApiRouteHandler = (
  request: NextRequest,
  context: ApiRouteHandlerContext
) => Promise<Response>;

// Type for Next.js API route handlers
export type NextApiRouteHandler = (
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) => Promise<Response>;

// Route creation config
export interface ApiRouteConfig {
  name?: string;
  middlewares?: ApiRouteMiddleware[];
  handler: ApiRouteHandler;
}

// Endpoint types

// Type for individual method configuration
export interface ApiRouteHandlerConfig {
  name?: string;
  middlewares?: ApiRouteMiddleware[] | ApiRouteMiddlewareModifier;
  handler: ApiRouteHandler;
}

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
  middlewares?: ApiRouteMiddleware[] | ApiRouteMiddlewareModifier;
  handlers: ApiRouteHandlers;
}

// Type for the returned endpoint object
export type ApiEndpoint = {
  [K in keyof ApiRouteHandlers]?: NextApiRouteHandler;
};
