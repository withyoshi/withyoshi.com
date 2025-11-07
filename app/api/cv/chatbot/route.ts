export const runtime = "edge";

import type { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api";
import {
  analyzeConversationState,
  processConversationStream,
} from "@/lib/cv/chatbot/service";
import {
  getOrCreateChatSession,
  updateConversationState,
} from "@/lib/cv/chatbot/session";
import { storeChatSession } from "@/lib/cv/chatbot/storage";

export const POST = createApiHandler(
  "CvChatbotAPI",
  async (_request: NextRequest, context: any) => {
    const { logger, ip } = context;

    const { id, messages = [] } = await _request.json();

    logger.info(
      { id, lastMessage: messages.slice(-1) },
      "Received chatbot messages"
    );

    // Get or create chat session
    const chatSession = await getOrCreateChatSession(id);
    const { conversationState } = chatSession;

    // Analyze messages and update conversation state
    const updatedConversationState = await analyzeConversationState(
      messages,
      conversationState
    );

    // Just in case updatedConversationState fails, we call back to the previous conversation state
    const latestConversationState =
      updatedConversationState || conversationState;

    // Store the conversation state in Redis (non-blocking)
    updateConversationState(id, latestConversationState).catch((error) => {
      logger.warn({ error }, "Failed to update conversation state");
    });

    // Process conversation
    const response = await processConversationStream(
      messages,
      latestConversationState,
      async ({ messages: finishedMessages = [], responseMessage }) => {
        const finishReason = (responseMessage as any)?.metadata?.finishReason;
        const logData = {
          finishReason,
          generationTime: (responseMessage as any)?.metadata?.generationTime,
          totalUsage: (responseMessage as any)?.metadata?.totalUsage,
          chatId: chatSession.id,
        };

        if (finishReason === "unknown") {
          logger.warn(
            { ...logData, responseMessage },
            "Chat stream finished with UNKNOWN finish reason - potential rate limit issues."
          );
        } else {
          logger.info({ ...logData, responseMessage }, "Chat stream finished");
        }

        // Store chat session data (including messages) directly in PostgreSQL
        try {
          const storedSession = await storeChatSession({
            chatSession,
            messages: finishedMessages,
            responseMessage,
            ip,
          });

          if (storedSession) {
            logger.info(
              { storedSession, messageCount: finishedMessages.length },
              "Chat session stored successfully in PostgreSQL"
            );
          }
        } catch (error) {
          logger.error({ error }, "Failed to store chat session");
        }
      }
    );

    logger.info({ chatSession }, "Chatbot request processed");

    return response;
  }
);
