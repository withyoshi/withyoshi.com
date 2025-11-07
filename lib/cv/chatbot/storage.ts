import { getIPLocation } from "@/lib/net/ip-info";
import { createLogger } from "@/lib/utils/log";
import type { ChatSession } from "./session";

const logger = createLogger({ name: "CvChatbotStorage" });

// ============================================================================
// TYPES
// ============================================================================

export interface ChatSessionRecord {
  id: string;
  created_at: string;
  summary: string;
  total_usage: Record<string, unknown>;
  conversation_state: Record<string, unknown>;
  ip_location: Record<string, unknown>;
  messages: any[];
}

export interface StoreChatSessionParams {
  chatSession: ChatSession;
  messages: any[];
  responseMessage: unknown;
  ip?: string;
}

// ============================================================================
// STORAGE FUNCTIONS
// ============================================================================

/**
 * Store chat session data to PostgreSQL
 */
export async function storeChatSession({
  chatSession,
  messages,
  responseMessage,
  ip,
}: StoreChatSessionParams): Promise<ChatSessionRecord | null> {
  const log = logger.child({
    chatSessionId: chatSession.id,
    messageCount: messages.length,
  });

  try {
    // Get IP location (if IP provided)
    const ipLocation = ip ? await getIPLocation(ip) : null;

    // Helper function to extract text content from a message
    const extractMessageContent = (msg: any): string => {
      // Try parts first (UI message format from @ai-sdk/react)
      if (Array.isArray(msg?.parts)) {
        return msg.parts
          .filter((part: any) => part?.type === "text")
          .map((part: any) => part.text ?? "")
          .join("");
      }

      // Fallback to content field
      if (Array.isArray(msg?.content)) {
        return msg.content
          .map((part: any) =>
            typeof part === "string" ? part : (part?.text ?? "")
          )
          .join("");
      }

      return msg?.content ?? "";
    };

    // Create summary (first 2048 characters of user messages only)
    const conversationText = messages
      .filter((msg: any) => msg?.role === "user")
      .map((msg: any) => extractMessageContent(msg))
      .join("\n");
    const summary = conversationText.substring(0, 2048);

    // Extract usage metadata (simple)
    const meta: any = (responseMessage as any)?.metadata ?? {};
    const totalUsage: Record<string, unknown> = meta.totalUsage ?? {};

    // Prepare data for insertion
    const sessionData = {
      id: chatSession.id,
      created_at: new Date(chatSession.createdAt).toISOString(),
      summary,
      total_usage: totalUsage,
      conversation_state: chatSession.conversationState,
      ip_location: ipLocation || {},
      messages,
    };

    // Upsert into Postgres by chat_session_id
    const { neon } = (await import("@neondatabase/serverless")) as any;
    const connectionString = process.env.POSTGRES_URL as string | undefined;
    if (!connectionString) {
      throw new Error("Missing POSTGRES_URL for Neon connection");
    }
    const sql = neon(connectionString);
    const result = await sql<ChatSessionRecord>`
      INSERT INTO cv_chat_sessions (
        id,
        created_at,
        summary,
        total_usage,
        conversation_state,
        ip_location,
        messages
      ) VALUES (
        ${sessionData.id},
        ${sessionData.created_at},
        ${sessionData.summary},
        ${sessionData.total_usage},
        ${sessionData.conversation_state},
        ${sessionData.ip_location},
        ${JSON.stringify(sessionData.messages)}::jsonb
      )
      ON CONFLICT (id)
      DO UPDATE SET
        summary = EXCLUDED.summary,
        total_usage = EXCLUDED.total_usage,
        conversation_state = EXCLUDED.conversation_state,
        ip_location = EXCLUDED.ip_location,
        messages = EXCLUDED.messages
      RETURNING *;
    `;

    const stored = result[0];

    log.info(
      {
        id: stored.id,
      },
      "Chat session upserted"
    );

    return stored;
  } catch (error) {
    log.error({ error }, "Failed to store chat session");
    return null;
  }
}
