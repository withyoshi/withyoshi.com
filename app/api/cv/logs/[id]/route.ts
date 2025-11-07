export const runtime = "edge";

import type { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api";
import { withAuth } from "@/lib/api/middlewares/with-auth";

export const GET = createApiHandler(
  "CvLogDetailAPI",
  [withAuth(process.env.ADMIN_AUTH_KEY || "")],
  async (_request: NextRequest, context: any) => {
    const { logger } = context;
    const { id } = await context.params;

    try {
      // Connect to PostgreSQL
      const { neon } = (await import("@neondatabase/serverless")) as any;
      const connectionString = process.env.POSTGRES_URL as string | undefined;
      if (!connectionString) {
        throw new Error("Missing POSTGRES_URL for Neon connection");
      }
      const sql = neon(connectionString);

      // Fetch session details including messages from PostgreSQL
      const session = await sql`
        SELECT
          id,
          created_at,
          summary,
          total_usage,
          conversation_state,
          ip_location,
          messages,
          COALESCE(
            ((conversation_state->>'lastActivity')::bigint / 1000) - EXTRACT(EPOCH FROM created_at),
            0
          ) as duration_seconds
        FROM cv_chat_sessions
        WHERE id = ${id}
        LIMIT 1
      `;

      if (!session[0]) {
        return Response.json({ error: "Session not found" }, { status: 404 });
      }

      // Extract messages from PostgreSQL
      const fullTranscript = session[0].messages
        ? {
            chatSessionId: id,
            messages: session[0].messages,
          }
        : null;

      // Calculate cost for this session (Gemini Flash 2.5 pricing)
      const sessionInputTokens = Number(
        session[0].total_usage?.promptTokens || 0
      );
      const sessionOutputTokens = Number(
        session[0].total_usage?.completionTokens || 0
      );
      const sessionCachedTokens = Number(
        session[0].total_usage?.cachedInputTokens || 0
      );

      const sessionChargedInputTokens = Math.max(
        0,
        sessionInputTokens - sessionCachedTokens
      );
      const sessionInputCost = Number.isFinite(sessionChargedInputTokens)
        ? (sessionChargedInputTokens * 0.10) / 1_000_000
        : 0; // $0.10 per 1M tokens (Gemini Flash 2.5)
      const sessionCachedInputCost = Number.isFinite(sessionCachedTokens)
        ? (sessionCachedTokens * 0.10) / 1_000_000
        : 0; // $0.10 per 1M tokens (Gemini Flash 2.5)
      const sessionOutputCost = Number.isFinite(sessionOutputTokens)
        ? (sessionOutputTokens * 0.40) / 1_000_000
        : 0; // $0.40 per 1M tokens (Gemini Flash 2.5)
      const sessionTotalCost =
        (Number.isFinite(sessionInputCost) ? sessionInputCost : 0) +
        (Number.isFinite(sessionCachedInputCost) ? sessionCachedInputCost : 0) +
        (Number.isFinite(sessionOutputCost) ? sessionOutputCost : 0);

      logger.info({ id }, "Fetched chat log details");

      return Response.json({
        session: {
          id: session[0].id,
          date: session[0].created_at,
          userName: session[0].conversation_state?.userName || "Unknown",
          duration: Math.round(Number(session[0].duration_seconds) || 0),
          totalTokens: Number(session[0].total_usage?.totalTokens) || 0,
          ip: session[0].ip_location?.ip || "Unknown",
          country: session[0].ip_location?.country || "Unknown",
          summary: session[0].summary || "",
          conversationState: session[0].conversation_state,
          cost: Number.isFinite(sessionTotalCost) ? sessionTotalCost : 0,
        },
        transcript: fullTranscript,
      });
    } catch (error) {
      logger.error({ error, id }, "Failed to fetch chat log details");
      return Response.json(
        { error: "Failed to fetch chat log details" },
        { status: 500 }
      );
    }
  }
);

export const DELETE = createApiHandler(
  "CvLogDeleteAPI",
  [withAuth(process.env.ADMIN_AUTH_KEY || "")],
  async (_request: NextRequest, context: any) => {
    const { logger } = context;
    const { id } = await context.params;

    try {
      // Connect to PostgreSQL
      const { neon } = (await import("@neondatabase/serverless")) as any;
      const connectionString = process.env.POSTGRES_URL as string | undefined;
      if (!connectionString) {
        throw new Error("Missing POSTGRES_URL for Neon connection");
      }
      const sql = neon(connectionString);

      // Delete the session
      await sql`
        DELETE FROM cv_chat_sessions
        WHERE id = ${id}
      `;

      logger.info({ id }, "Deleted chat session");

      return Response.json({ success: true, id });
    } catch (error) {
      logger.error({ error, id }, "Failed to delete chat session");
      return Response.json(
        { error: "Failed to delete chat session" },
        { status: 500 }
      );
    }
  }
);
