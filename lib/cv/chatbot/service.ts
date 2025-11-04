import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  generateObject,
  streamText,
  type UIMessage,
  type UIMessageStreamOnFinishCallback,
} from "ai";
import { createLogger } from "../../utils/log";
import { buildSystemPrompt, generateConversationStateContext } from "./prompt";
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
  conversationState?: {
    lastActivity: number;
  };
}

const logger = createLogger({ name: "ChatbotService" });

export async function analyzeConversationState(
  messages: UIMessage[],
  currentConversationState: ConversationState
): Promise<ConversationState | null> {
  const log = logger.child({ routine: "analyzeConversationState" });

  // Filter to only user messages - assistant messages mention Yan Sern and confuse extraction
  const userMessages = messages.filter((msg) => msg.role === "user");

  // Convert UIMessage[] to ModelMessage[] format
  const modelMessage = convertToModelMessages(userMessages);

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

  // Use static system prompt for better token caching
  // Dynamic conversation state is passed in messages array
  const staticSystemPrompt = buildSystemPrompt();

  // Track time to first token
  const startTime = Date.now();
  let timeToFirstToken: number | undefined;

  // Create the streaming response with metadata
  const streamResult = streamText({
    model: openai("gpt-4o"),
    system: staticSystemPrompt,
    messages: [
      // Dynamic conversation state context - uncached.
      {
        role: "system" as const,
        content: conversationStateContext,
      },
      ...modelMessage,
    ],
    temperature: 0.7,
    // Note: With average output of ~40 tokens and input of ~20k tokens, you're well within GPT-4o's
    // 128k token limit. "Unknown" finish reasons are likely due to Edge runtime timeouts (~30s limit)
    // rather than token limits. The retry mechanism handles these timeout cases automatically.
  });

  // Convert to UI message stream response with metadata
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
