import type { NextRequest } from "next/server";
import { logger } from "@/lib/utils/log";
import type {
  ApiRouteConfig,
  ApiRouteHandlerContext,
  NextApiRouteHandler,
} from "./types";

export function createApiRoute(config: ApiRouteConfig): NextApiRouteHandler {
  const name = config.name || "api";
  const middlewares = config.middlewares || [];
  const handler = config.handler;

  return async (
    request: NextRequest,
    { params }: { params: Promise<Record<string, string>> }
  ) => {
    const context: ApiRouteHandlerContext = {
      name,
      params,
      logger: logger.child({ name }),
    };

    let next = () => handler(request, context);

    for (let i = middlewares.length - 1; i >= 0; i--) {
      const middleware = middlewares[i];
      const currentNext = next;
      next = () => middleware(request, context, currentNext);
    }

    return next();
  };
}
