import { z } from "zod";
import type { MiddlewareFunction } from "../types";

// Augment the HandlerContext type
declare module "../types" {
  interface HandlerContext {
    data?: any; // Added by withValidation middleware
  }
}

export function withValidation<T extends z.ZodType>(
  schema: T
): MiddlewareFunction {
  return async (request, context, next) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);

      // Store validated data in context
      context.data = validatedData;

      return next();
    } catch (error) {
      const log = context.logger.child({ routine: "RequestValidation" });

      if (error instanceof z.ZodError) {
        log.warn({ error }, "Validation failed");

        return Response.json(
          {
            error: "Validation failed",
            details: error.issues,
          },
          { status: 400 }
        );
      }

      log.error({ error }, "Request parsing failed");

      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
  };
}
