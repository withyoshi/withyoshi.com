export const runtime = "edge";

import type { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api";
import { withAuth } from "@/lib/api/middlewares/with-auth";

export const GET = createApiHandler(
  "CvLogsAPI",
  [withAuth(process.env.ADMIN_AUTH_KEY || "")],
  async (_request: NextRequest, context: any) => {
    const { logger } = context;

    try {
      // Connect to PostgreSQL
      const { neon } = (await import("@neondatabase/serverless")) as any;
      const connectionString = process.env.POSTGRES_URL as string | undefined;
      if (!connectionString) {
        throw new Error("Missing POSTGRES_URL for Neon connection");
      }
      const sql = neon(connectionString);

      // Fetch chat sessions with basic stats
      const sessions = await sql`
        SELECT
          id,
          created_at,
          summary,
          total_usage,
          conversation_state,
          ip_location,
          COALESCE(
            ((conversation_state->>'lastActivity')::bigint / 1000) - EXTRACT(EPOCH FROM created_at),
            0
          ) as duration_seconds
        FROM cv_chat_sessions
        ORDER BY created_at DESC
        LIMIT 100
      `;

      // Calculate global stats
      const globalStats = await sql`
        SELECT
          COUNT(*) as total_sessions,
          SUM((total_usage->>'totalTokens')::bigint) as total_tokens,
          SUM((total_usage->>'cachedInputTokens')::bigint) as cached_input_tokens,
          SUM(((total_usage->>'totalTokens')::bigint - (total_usage->>'cachedInputTokens')::bigint)) as charged_tokens,
          SUM((total_usage->>'promptTokens')::bigint) as prompt_tokens,
          SUM((total_usage->>'completionTokens')::bigint) as completion_tokens
        FROM cv_chat_sessions
      `;

      const stats = globalStats[0] || {
        total_sessions: 0,
        total_tokens: 0,
        cached_input_tokens: 0,
        charged_tokens: 0,
        prompt_tokens: 0,
        completion_tokens: 0,
      };

      // Calculate costs (Gemini Flash 2.5 pricing)
      const inputTokens =
        Number.parseInt(String(stats.prompt_tokens || 0), 10) || 0;
      const outputTokens =
        Number.parseInt(String(stats.completion_tokens || 0), 10) || 0;
      const cachedInputTokens =
        Number.parseInt(String(stats.cached_input_tokens || 0), 10) || 0;

      const chargedInputTokens = Math.max(0, inputTokens - cachedInputTokens);
      const inputCost = (chargedInputTokens * 0.1) / 1_000_000; // $0.10 per 1M tokens (Gemini Flash 2.5)
      const cachedInputCost = (cachedInputTokens * 0.1) / 1_000_000; // $0.10 per 1M tokens (Gemini Flash 2.5)
      const outputCost = (outputTokens * 0.4) / 1_000_000; // $0.40 per 1M tokens (Gemini Flash 2.5)
      const totalCost =
        (Number.isFinite(inputCost) ? inputCost : 0) +
        (Number.isFinite(cachedInputCost) ? cachedInputCost : 0) +
        (Number.isFinite(outputCost) ? outputCost : 0);

      logger.info({ sessionCount: sessions.length }, "Fetched chat logs");

      return Response.json({
        sessions: sessions.map((session: any) => {
          // Calculate cost for this session
          const sessionInputTokens = Number(
            session.total_usage?.promptTokens || 0
          );
          const sessionOutputTokens = Number(
            session.total_usage?.completionTokens || 0
          );
          const sessionCachedTokens = Number(
            session.total_usage?.cachedInputTokens || 0
          );

          const sessionChargedInputTokens = Math.max(
            0,
            sessionInputTokens - sessionCachedTokens
          );
          const sessionInputCost = Number.isFinite(sessionChargedInputTokens)
            ? (sessionChargedInputTokens * 0.1) / 1_000_000
            : 0; // $0.10 per 1M tokens (Gemini Flash 2.5)
          const sessionCachedInputCost = Number.isFinite(sessionCachedTokens)
            ? (sessionCachedTokens * 0.1) / 1_000_000
            : 0; // $0.10 per 1M tokens (Gemini Flash 2.5)
          const sessionOutputCost = Number.isFinite(sessionOutputTokens)
            ? (sessionOutputTokens * 0.4) / 1_000_000
            : 0; // $0.40 per 1M tokens (Gemini Flash 2.5)
          const sessionTotalCost =
            (Number.isFinite(sessionInputCost) ? sessionInputCost : 0) +
            (Number.isFinite(sessionCachedInputCost)
              ? sessionCachedInputCost
              : 0) +
            (Number.isFinite(sessionOutputCost) ? sessionOutputCost : 0);

          // Handle duration - ensure it's a valid number
          const durationSeconds = Number(session.duration_seconds);
          const validDuration = Number.isFinite(durationSeconds)
            ? Math.max(0, durationSeconds)
            : 0;

          return {
            id: session.id,
            date: session.created_at,
            userName: session.conversation_state?.userName || "Anonymous",
            duration: Math.round(validDuration),
            totalTokens: Number(session.total_usage?.totalTokens) || 0,
            ip: session.ip_location?.ip || "Unknown",
            country: session.ip_location?.country || "Unknown",
            summary: session.summary || "",
            cost: Number.isFinite(sessionTotalCost) ? sessionTotalCost : 0,
          };
        }),
        globalStats: {
          totalSessions: Number.parseInt(stats.total_sessions, 10) || 0,
          totalTokens: Number.parseInt(stats.total_tokens, 10) || 0,
          cachedInputTokens:
            Number.parseInt(stats.cached_input_tokens, 10) || 0,
          chargedTokens: Number.parseInt(stats.charged_tokens, 10) || 0,
          promptTokens: Number.parseInt(stats.prompt_tokens, 10) || 0,
          completionTokens: Number.parseInt(stats.completion_tokens, 10) || 0,
          inputCost,
          cachedInputCost,
          outputCost,
          totalCost,
        },
      });
    } catch (error) {
      logger.error({ error }, "Failed to fetch chat logs");
      return Response.json(
        { error: "Failed to fetch chat logs" },
        { status: 500 }
      );
    }
  }
);

export const DELETE = createApiHandler(
  "CvLogsBulkDeleteAPI",
  [withAuth(process.env.ADMIN_AUTH_KEY || "")],
  async (request: NextRequest, context: any) => {
    const { logger } = context;

    try {
      const body = await request.json();
      const { ids } = body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return Response.json(
          { error: "Invalid request: ids must be a non-empty array" },
          { status: 400 }
        );
      }

      // Connect to PostgreSQL
      const { neon } = (await import("@neondatabase/serverless")) as any;
      const connectionString = process.env.POSTGRES_URL as string | undefined;
      if (!connectionString) {
        throw new Error("Missing POSTGRES_URL for Neon connection");
      }
      const sql = neon(connectionString);

      // Delete multiple sessions
      await sql`
        DELETE FROM cv_chat_sessions
        WHERE id = ANY(${ids})
      `;

      logger.info({ count: ids.length }, "Bulk deleted chat sessions");

      return Response.json({ success: true, deletedCount: ids.length });
    } catch (error) {
      logger.error({ error }, "Failed to bulk delete chat sessions");
      return Response.json(
        { error: "Failed to bulk delete chat sessions" },
        { status: 500 }
      );
    }
  }
);
