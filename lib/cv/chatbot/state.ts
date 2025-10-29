import { z } from "zod";

/**
 * Zod schema for ConversationState validation
 * Tracks user information and conversation progress in the CV chatbot
 */
export const ConversationStateSchema = z.object({
  userName: z
    .string()
    .optional()
    .describe("User's name as provided during conversation"),
  company: z
    .string()
    .optional()
    .describe("User's company or organization name"),
  email: z.string().email().optional().describe("User's email address"),
  hasProvidedCompany: z
    .boolean()
    .optional()
    .describe("Whether user has explicitly provided company information"),
  hasProvidedEmail: z
    .boolean()
    .optional()
    .describe("Whether user has explicitly provided email information"),
  nameAttempts: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe("Number of attempts made to collect user's name"),
  hasAcknowledgedYoshi: z
    .boolean()
    .optional()
    .describe("Whether user has acknowledged the Yoshi nickname"),
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
  const prompt = [
    "You are analyzing a conversation to extract and update user information. Here's what each field represents:",
    "",
    "FIELD DESCRIPTIONS:",
    "- userName: The user's actual name as they provided it (e.g., 'John Smith', 'Sarah')",
    "- company: The user's company or organization name (e.g., 'Google', 'Microsoft', 'Acme Corp')",
    "- email: The user's email address (must be valid email format)",
    "- hasProvidedCompany: Boolean indicating if user explicitly mentioned their company",
    "- hasProvidedEmail: Boolean indicating if user explicitly provided their email",
    "- nameAttempts: Number of times we've tried to collect the user's name (0-3 max)",
    "- hasAcknowledgedYoshi: Boolean indicating if user acknowledged the 'Yoshi' nickname",
    "- lastActivity: Timestamp of when this conversation state was last updated",
    "",
    "CURRENT CONVERSATION STATE:",
    JSON.stringify(conversationState, null, 2),
    "",
    "INSTRUCTIONS:",
    "1. Only update fields you can infer confidently from the conversation text",
    "2. If no clear data is found for a field, leave it unchanged (don't set to undefined)",
    "3. For boolean fields, only set to true if explicitly mentioned or clearly implied",
    "4. For nameAttempts, increment only if you made an attempt to ask for their name",
    "5. Preserve existing data unless you have new, more complete information",
    "6. Return the updated conversation state as a JSON object",
  ].join("\n");

  return prompt;
}

/**
 * Helper function to check if user has provided company info
 */
export function hasProvidedCompany(state: ConversationState): boolean {
  return Boolean(state.company || state.hasProvidedCompany);
}

/**
 * Helper function to check if user has provided email info
 */
export function hasProvidedEmail(state: ConversationState): boolean {
  return Boolean(state.email || state.hasProvidedEmail);
}

/**
 * Helper function to check if name collection should continue
 */
export function shouldAskForName(state: ConversationState): boolean {
  return (state.nameAttempts || 0) < 3;
}

/**
 * Helper function to check if Yoshi nickname has been acknowledged
 */
export function hasAcknowledgedYoshi(state: ConversationState): boolean {
  return Boolean(state.hasAcknowledgedYoshi);
}

/**
 * Helper function to update conversation state with new data
 */
export function updateConversationState(
  currentState: ConversationState,
  updates: Partial<ConversationState>
): ConversationState {
  return {
    ...currentState,
    ...updates,
    lastActivity: Date.now(),
  };
}
