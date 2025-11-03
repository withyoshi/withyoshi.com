import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  generateObject,
  streamText,
  type UIMessage,
  type UIMessageStreamOnFinishCallback,
} from "ai";
import { createLogger } from "../../utils/log";
import { generateConversationStateContext, systemPrompt } from "./prompt";
import type { ConversationState } from "./state";
import {
  ConversationStateSchema,
  generateConversationStatePrompt,
} from "./state";

export interface ChatbotRequest {
  messages: UIMessage[];
  chatId?: string;
}

export interface ChatbotResponse {
  response: Response;
  chatId: string;
  conversationState: ConversationState;
  chatSession: {
    id: string;
    conversationState: ConversationState;
    createdAt: number;
    lastActivity: number;
  };
}

const logger = createLogger({ name: "ChatbotService" });

export async function analyzeConversationState(
  messages: UIMessage[],
  currentConversationState: ConversationState
): Promise<ConversationState | null> {
  const log = logger.child({ routine: "analyzeConversationState" });

  // Convert UIMessage[] to ModelMessage[] format
  const modelMessage = convertToModelMessages(messages);

  const prompt = generateConversationStatePrompt(currentConversationState);

  // Add system prompt to the messages
  const messagesWithSystem = [
    {
      role: "system" as const,
      content: prompt,
    },
    ...modelMessage,
  ];

  try {
    const { object: extractedConversationState } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: ConversationStateSchema,
      messages: messagesWithSystem,
      temperature: 0,
    });

    log.info({ extractedConversationState }, "Conversation state extracted");

    return extractedConversationState;
  } catch (error) {
    log.warn({ error }, "Failed to extract conversation state");
    return null;
  }
}

export async function processConversationStream(
  messages: UIMessage[],
  conversationState: ConversationState,
  onFinish?: UIMessageStreamOnFinishCallback<UIMessage>
): Promise<Response> {
  // Convert UIMessage[] to ModelMessage[] format
  const modelMessage = convertToModelMessages(messages);

  // Generate conversation state context
  const conversationStateContext =
    generateConversationStateContext(conversationState);

  // Track time to first token
  const startTime = Date.now();
  let timeToFirstToken: number | undefined;

  // 9) Create the streaming response with metadata
  const streamResult = streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt, // Static system prompt - cached.
    messages: [
      // Dynamic conversation state contect - uncached.
      {
        role: "system" as const,
        content: conversationStateContext,
      },
      ...modelMessage,
    ],
    temperature: 0.7,
  });

  // 10) Convert to UI message stream response with metadata
  const response = streamResult.toUIMessageStreamResponse({
    originalMessages: messages,
    messageMetadata: ({ part }) => {
      // Send metadata when streaming starts
      if (part.type === "start") {
        return {
          createdAt: Date.now(),
conversationState,
        };
      }

      // Track time to first token
      if (part.type === "text-delta" && !timeToFirstToken) {
        timeToFirstToken = Date.now() - startTime;
      }

      // Send additional metadata when streaming completes
      if (part.type === "finish") {
        const generationTime = Date.now() - startTime;

        return {
          timeToFirstToken,
          generationTime,
          totalUsage: part.totalUsage,
          finishReason: part.finishReason,
        };
      }
    },
    onFinish,
  });

  return response;
}
