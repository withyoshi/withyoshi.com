import type { ApiRouteMiddleware } from "../types";

// Augment the MiddlewareContext type
declare module "../types" {
  interface MiddlewareContext {
    // withAuth doesn't add properties to context
  }
}

/**
 * Middleware for Bearer token authentication
 * @param token - The token to validate against the Bearer token
 * @returns MiddlewareFunction that validates Authorization header
 */

export function withAuth(token: string): ApiRouteMiddleware {
  return async (request, context, next) => {
    const authHeader = request.headers.get("authorization");

    const logger = context.logger.child({ routine: "Auth" });

    logger.info(
      {
        hasHeader: !!authHeader,
        hasToken: !!token,
      },
      "Auth check"
    );

    if (!token) {
      logger.error("Missing token parameter");
      return Response.json(
        {
          error: "Server configuration error",
          details: "Authentication token not provided",
          requestId: context.requestId,
        },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${token}`) {
      logger.error(
        {
          hasHeader: !!authHeader,
          headerPrefix: authHeader ? authHeader.substring(0, 10) : "none",
        },
        "Unauthorized access"
      );
      return Response.json(
        {
          error: "Unauthorized",
          details: "Invalid or missing authorization header",
          requestId: context.requestId,
        },
        { status: 401 }
      );
    }

    return next();
  };
}
