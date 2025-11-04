/**
 * Chatbot Configuration
 *
 * Controls which prompt approach to use:
 * - "default": Uses core.md + guest.md + pro.md + vip.md (all content in prompt)
 * - "rag": Uses core-rag.md + RAG retrieval (dynamic content from vector store)
 */

export type ChatbotPromptApproach = "default" | "rag";

/**
 * Get the chatbot prompt approach from environment variable
 * Defaults to "rag" if not set
 */
export function getChatbotPromptApproach(): ChatbotPromptApproach {
  const approach = process.env.CHATBOT_PROMPT_APPROACH as
    | ChatbotPromptApproach
    | undefined;

  if (approach && ["default", "rag"].includes(approach)) {
    return approach;
  }

  // Default to RAG if not specified
  return "default";
}
