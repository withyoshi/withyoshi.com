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
          ((conversation_state->>'lastActivity')::bigint / 1000) - EXTRACT(EPOCH FROM created_at) as duration_seconds
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

      // Calculate costs (GPT-4o-mini pricing)
      const inputTokens = Number.parseInt(stats.prompt_tokens, 10) || 0;
      const outputTokens = Number.parseInt(stats.completion_tokens, 10) || 0;
      const cachedInputTokens =
        Number.parseInt(stats.cached_input_tokens, 10) || 0;

      const chargedInputTokens = inputTokens - cachedInputTokens;
      const inputCost = (chargedInputTokens * 2.5) / 1_000_000; // $2.50 per 1M tokens (gpt-4o)
      const outputCost = (outputTokens * 10.0) / 1_000_000; // $10.00 per 1M tokens (gpt-4o)
      const totalCost = inputCost + outputCost;

      logger.info({ sessionCount: sessions.length }, "Fetched chat logs");

      return Response.json({
        sessions: sessions.map((session: any) => {
          // Calculate cost for this session
          const sessionInputTokens = session.total_usage?.promptTokens || 0;
          const sessionOutputTokens =
            session.total_usage?.completionTokens || 0;
          const sessionCachedTokens =
            session.total_usage?.cachedInputTokens || 0;

          const sessionChargedInputTokens =
            sessionInputTokens - sessionCachedTokens;
          const sessionInputCost =
            (sessionChargedInputTokens * 2.5) / 1_000_000; // $2.50 per 1M tokens (gpt-4o)
          const sessionOutputCost = (sessionOutputTokens * 10.0) / 1_000_000; // $10.00 per 1M tokens (gpt-4o)
          const sessionTotalCost = sessionInputCost + sessionOutputCost;

          return {
            id: session.id,
            date: session.created_at,
            userName: session.conversation_state?.userName || "Anonymous",
            duration: Math.round(session.duration_seconds || 0),
            totalTokens: session.total_usage?.totalTokens || 0,
            ip: session.ip_location?.ip || "Unknown",
            country: session.ip_location?.country || "Unknown",
            summary: session.summary || "",
            cost: sessionTotalCost,
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
