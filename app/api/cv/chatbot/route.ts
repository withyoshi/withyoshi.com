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
import {
  storeChatSession,
  uploadChatTranscript,
} from "@/lib/cv/chatbot/storage";

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

    // Store the conversation state in Redis async
    try {
      updateConversationState(id, latestConversationState);
    } catch (error) {
      logger.warn({ error }, "Failed to update conversation state");
    }

    // Using the new messages and conversation state, update conversation stream.
    const response = await processConversationStream(
      messages,
      latestConversationState,
      async ({ messages: finishedMessages = [], responseMessage }) => {
        logger.info({ responseMessage }, "Chat stream finished");

        // Upload transcript and store chat session data
        try {
          await uploadChatTranscript(chatSession.id, finishedMessages);
          const storedSession = await storeChatSession({
            chatSession,
            messages: finishedMessages,
            responseMessage,
            ip,
          });

          if (storedSession) {
            logger.info({ storedSession }, "Chat session stored successfully");
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
