import type { ApiRouteMiddleware } from "../types";

// Augment the ApiRouteHandlerContext type
declare module "../types" {
  interface ApiRouteHandlerContext {
    // withErrorHandling doesn't add properties to context
  }
}

export const withErrorHandling: ApiRouteMiddleware = async (
  _request,
  context,
  next
) => {
  try {
    return await next();
  } catch (error) {
    context.logger.child({ routine: "ErrorHandling" }).error(
      {
        error: error instanceof Error ? error.stack : error,
      },
      `Error in ${context.name}: ${error instanceof Error ? error.message : "Unknown error"}`
    );

    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
};
