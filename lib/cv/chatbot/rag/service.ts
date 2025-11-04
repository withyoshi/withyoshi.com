/**
 * RAG Service
 *
 * Main service that integrates RAG with the chatbot
 */

import { google } from "@ai-sdk/google";
import type { UIMessage, UIMessageStreamOnFinishCallback } from "ai";
import { convertToModelMessages, streamText } from "ai";
import { encryptedCoreRagPrompt } from "../data";
import { decrypt, generateConversationStateContext } from "../prompt";
import type { ConversationState } from "../state";
import { formatChunksForContext, retrieveRelevantChunks } from "./retriever";
import type { VectorStore } from "./vector-store";
import { NeonPostgresVectorStore } from "./vercel-postgres-store";

// Initialize vector store with Neon Postgres
// Note: Make sure pgvector extension is enabled and table exists before using
const vectorStore: VectorStore = new NeonPostgresVectorStore();

/**
 * Build static system prompt (core-rag.md instructions only)
 * This can be cached by the LLM provider
 */
function buildStaticSystemPrompt(): string {
  // Decrypt core-rag prompt (instructions)
  return decrypt(encryptedCoreRagPrompt);
}

/**
 * Build dynamic context (retrieved context + conversation state)
 * This goes in the messages array as the first system message
 */
function buildDynamicContext(
  retrievedContext: string,
  conversationState: ConversationState
): string {
  // Generate conversation state context
  const stateContext = generateConversationStateContext(conversationState);

  // Combine: retrieved context + conversation state
  return [
    "## RETRIEVED CONTEXT START",
    retrievedContext,
    "## RETRIEVED CONTEXT END",
    stateContext,
  ].join("\n");
}

/**
 * Process conversation with RAG
 */
export async function processConversationWithRAG(
  messages: UIMessage[],
  conversationState: ConversationState,
  onFinish?: UIMessageStreamOnFinishCallback<UIMessage>
): Promise<Response> {
  // Get the last user message and extract query
  const lastMessage = messages.at(-1);
  let userQuery = "";
  if (lastMessage?.role === "user") {
    // Extract content from UIMessage (handles both string and parts array)
    const msg = lastMessage as any;
    if (Array.isArray(msg?.parts)) {
      // UI message format from @ai-sdk/react
      userQuery = msg.parts
        .filter((part: any) => part?.type === "text")
        .map((part: any) => part.text ?? "")
        .join("");
    } else if (Array.isArray(msg?.content)) {
      // Content as array
      userQuery = msg.content
        .map((part: any) =>
          typeof part === "string" ? part : (part?.text ?? "")
        )
        .join("");
    } else {
      // Content as string
      userQuery = msg?.content ?? "";
    }
  }

  // Retrieve relevant chunks with access control
  // Uses retrieval-based classification: queries vector DB to determine required access level
  const retrievalResult = await retrieveRelevantChunks(
    userQuery,
    conversationState,
    vectorStore,
    {
      topK: 5,
      minScore: 0.7,
    }
  );

  // If user needs to be redirected, include redirect instructions instead of content
  let retrievedContext: string;
  if (retrievalResult.shouldRedirect) {
    // Don't retrieve chunks - instead, the core prompt will handle redirect
    // We'll add a special marker so the LLM knows to redirect
    retrievedContext = `## ACCESS CONTROL NOTICE
The user asked a ${retrievalResult.redirectReason?.toUpperCase()} question but only has ${conversationState.userType || "GUEST"} access.
DO NOT answer the question. Instead, use the redirect format from the GATED CONTENT REDIRECT RESPONSE SECTION in core.md.
`;
  } else {
    // Format chunks for context
    retrievedContext = formatChunksForContext(retrievalResult.chunks);

    // Add note about higher-level content if available
    if (retrievalResult.hasHigherLevelContent) {
      const { pro, vip } = retrievalResult.hasHigherLevelContent;
      const userType = conversationState.userType;

      if (pro && userType !== "pro" && userType !== "vip") {
        retrievedContext += `\n\n## ADDITIONAL INFORMATION AVAILABLE
More detailed information about this topic is available in PRO content. You can mention this to the user after answering their question. For example: "There's even more detailed information about this available in PRO content—just share your name to unlock it!" or "Want to dive deeper? PRO access has more detailed insights on this topic. Just tell me your name to unlock it!"`;
      }

      if (vip && userType !== "vip") {
        retrievedContext += `\n\n## ADDITIONAL INFORMATION AVAILABLE
More detailed information about this topic is available in VIP content. You can mention this to the user after answering their question. For example: "There's even more personal and detailed information about this in VIP content—share your name, introduce yourself, and provide contact info to unlock it!" or "Want the full picture? VIP access has the most detailed insights on this topic. Just share your name, a bit about yourself, and your contact info to unlock it!"`;
      }
    }
  }

  // Build static system prompt (core instructions only - can be cached)
  const staticSystemPrompt = buildStaticSystemPrompt();

  // Build dynamic context (retrieved context + conversation state - goes in messages array)
  const dynamicContext = buildDynamicContext(
    retrievedContext,
    conversationState
  );

  // Convert messages to model format
  const modelMessages = convertToModelMessages(messages);

  // Track time to first token
  const startTime = Date.now();
  let timeToFirstToken: number | undefined;

  // Stream response
  // Static core prompt goes in `system` parameter (cached by provider)
  // Dynamic context goes as first system message in messages array
  const streamResult = streamText({
    model: google("gemini-2.5-flash"),
    system: staticSystemPrompt,
    messages: [
      // Dynamic context as first system message (not cached, but allows provider optimization)
      {
        role: "system" as const,
        content: dynamicContext,
      },
      ...modelMessages,
    ],
    temperature: 0.7,
  });

  return streamResult.toUIMessageStreamResponse({
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
}
