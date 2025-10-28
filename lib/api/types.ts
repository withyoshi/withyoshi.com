import type { NextRequest } from "next/server";
import type { logger } from "@/lib/utils/log";

// Core types
export interface ApiRouteHandlerContext {
  params: Promise<Record<string, string>>; // Added by createRoute
  name: string; // Added by createRoute (service name)
  logger: typeof logger;
  [key: string]: any; // Allow additional properties
}

export type ApiRouteMiddleware = (
  request: NextRequest,
  context: ApiRouteHandlerContext,
  next: () => Promise<Response>
) => Promise<Response>;

export type ApiRouteHandler = (
  request: NextRequest,
  context: ApiRouteHandlerContext
) => Promise<Response>;

// Type for Next.js API route handlers
export type NextApiRouteHandler = (
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) => Promise<Response>;
