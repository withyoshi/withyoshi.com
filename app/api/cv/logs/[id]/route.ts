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

      // Fetch session details
      const session = await sql`
        SELECT
          id,
          created_at,
          summary,
          total_usage,
          conversation_state,
          ip_location
        FROM cv_chat_sessions
        WHERE id = ${id}
        LIMIT 1
      `;

      if (!session[0]) {
        return Response.json({ error: "Session not found" }, { status: 404 });
      }

      // Fetch full chat transcript from Vercel Blob
      let fullTranscript: any = null;

      try {
        const { head } = (await import("@vercel/blob")) as any;
        const transcriptPath = `cv-chat-logs/chat-${id}.json`;
        const blobInfo = await head(transcriptPath);

        if (blobInfo) {
          const transcriptResponse = await fetch(blobInfo.url);
          if (transcriptResponse.ok) {
            fullTranscript = await transcriptResponse.json();
          }
        }
      } catch (error) {
        logger.warn(
          { error, id },
          "Failed to fetch transcript from blob storage"
        );
      }

      logger.info({ id }, "Fetched chat log details");

      return Response.json({
        session: {
          id: session[0].id,
          date: session[0].created_at,
          userName: session[0].conversation_state?.userName || "Unknown",
          totalTokens: session[0].total_usage?.totalTokens || 0,
          ip: session[0].ip_location?.ip || "Unknown",
          country: session[0].ip_location?.country || "Unknown",
          summary: session[0].summary || "",
          conversationState: session[0].conversation_state,
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
