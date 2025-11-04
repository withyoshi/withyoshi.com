import { z } from "zod";
import { encryptedStatePrompt } from "./data";
import { decrypt, generateConversationStateContext } from "./prompt";

/**
 * Zod schema for ConversationState validation
 * Tracks user information and conversation progress in the CV chatbot
 */
export const ConversationStateSchema = z.object({
  userName: z
    .string()
    .nullable()
    .optional()
    .describe(
      "User's personal name as explicitly shared. Must be a personal identifier, not job titles, roles, or company names. Extract only when user explicitly shares their own name."
    ),
  userIntro: z
    .string()
    .nullable()
    .optional()
    .describe(
      "User's introduction including their background, profession, what they do, what they like, their purpose of chatting, or which company they work from. Information should be accumulated/appended throughout the conversation."
    ),
  contact: z
    .string()
    .nullable()
    .optional()
    .describe(
      "User's contact method: email addresses, phone numbers, LinkedIn URLs, website links, or social media profiles. Multiple contact methods can be appended and accumulated throughout the conversation."
    ),
  userType: z
    .enum(["pro", "vip"])
    .nullable()
    .optional()
    .describe(
      "User's access level automatically derived from provided fields: 'pro' when userName is provided (but userIntro or contact is missing), 'vip' when userName, userIntro, and contact are all provided. null/undefined = GUEST (no name provided)."
    ),
  lastActivity: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Timestamp of last activity in the conversation"),
});

/**
 * Unified conversation state type used throughout the CV chatbot system
 * Generated from ConversationStateSchema to ensure type safety
 */
export type ConversationState = z.infer<typeof ConversationStateSchema>;

export function generateConversationStatePrompt(
  conversationState: ConversationState
) {
  const statePrompt = decrypt(encryptedStatePrompt);
  const conversationStateContext =
    generateConversationStateContext(conversationState);

  const prompt = [statePrompt, conversationStateContext].join("\n");

  return prompt;
}
