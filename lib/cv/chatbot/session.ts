import { redis } from "@/lib/storage/redis";
import { createLogger } from "@/lib/utils/log";
import type { ConversationState } from "./state";

const logger = createLogger({ name: "ChatSession" });

export interface ChatSession {
  id: string;
  conversationState: ConversationState;
  createdAt: number;
  lastActivity: number;
}

/**
 * Create a new chat session
 */
export async function createChatSession(chatId: string): Promise<ChatSession> {
  const chatSession: ChatSession = {
    id: chatId,
    conversationState: {
      userName: "",
      userIntro: "",
      contact: "",
      userType: null,
    },
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };

  await redis.set(`chat:${chatId}`, chatSession, {
    ex: 24 * 60 * 60,
  });

  return chatSession;
}

/**
 * Get or create a chat session
 */
export async function getOrCreateChatSession(
  chatId: string
): Promise<ChatSession> {
  const exists = await redis.exists(`chat:${chatId}`);

  if (exists) {
    const existingChatSession = await getChatSession(chatId);
    if (existingChatSession) {
      // Update last activity
      existingChatSession.lastActivity = Date.now();
      await saveChatSession(existingChatSession);
      return existingChatSession;
    }
  }

  // Create new session
  const newChatSession = await createChatSession(chatId);
  if (!newChatSession) {
    throw new Error("Failed to create new chat session");
  }

  return newChatSession;
}

/**
 * Get a chat session by ID
 */
export async function getChatSession(id: string): Promise<ChatSession | null> {
  try {
    const data = await redis.get<ChatSession>(`chat:${id}`);
    if (!data) {
      return null;
    }

    return data as ChatSession;
  } catch (error) {
    logger.error({ error, id }, "Failed to get or parse chat session");
    return null;
  }
}

/**
 * Save a chat session
 */
export async function saveChatSession(chatSession: ChatSession): Promise<void> {
  chatSession.lastActivity = Date.now();
  await redis.set(`chat:${chatSession.id}`, chatSession, {
    ex: 24 * 60 * 60,
  });
}

/**
 * Update conversation state for a chat
 */
export async function updateConversationState(
  chatId: string,
  updates: Partial<ConversationState>
): Promise<ChatSession | null> {
  const chatSession = await getChatSession(chatId);
  if (!chatSession) {
    return null;
  }

  chatSession.conversationState = {
    ...chatSession.conversationState,
    ...updates,
    lastActivity: Date.now(),
  };

  await saveChatSession(chatSession);
  return chatSession;
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(chatId: string): Promise<boolean> {
  const result = await redis.del(`chat:${chatId}`);
  return result > 0;
}

/**
 * Clean up expired chats (Redis TTL handles this automatically, but this is for manual cleanup)
 */
export async function cleanupExpiredChatSessions(): Promise<number> {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  const keys = await redis.keys("chat:*");
  let cleaned = 0;

  for (const key of keys) {
    try {
      const data = await redis.get<ChatSession>(key);
      if (data) {
        const chatSession = data as ChatSession;
        if (now - chatSession.lastActivity > maxAge) {
          await redis.del(key);
          cleaned++;
        }
      }
    } catch (error) {
      logger.error(
        { error, key },
        "Failed to parse chat session during cleanup"
      );
      // If we can't parse it, consider it corrupted and delete it
      await redis.del(key);
      cleaned++;
    }
  }

  return cleaned;
}
