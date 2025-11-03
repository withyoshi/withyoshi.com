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
  intro: z
    .string()
    .optional()
    .describe("User's introduction and background information"),
  contact: z
    .string()
    .optional()
    .describe("User's contact method (email, phone, LinkedIn URL, etc.)"),
  isPro: z
    .boolean()
    .optional()
    .describe(
      "Whether user has provided their userName (unlocks pro.txt content)"
    ),
  isVip: z
    .boolean()
    .optional()
    .describe(
      "Whether user has introduced themselves and provided contact method (unlocks vip.txt content)"
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
  const prompt = [
    "You are extracting user information from a conversation. Your job is to understand what the user has genuinely shared, not to infer or guess.",
    "",
    "FIELD MEANINGS - Understand These Principles:",
    "",
    "userName: The user's personal identifier - something they would write on a form under 'Name'",
    "- A personal name identifies an individual person",
    "- Job titles, roles, positions, and organization names are NOT names",
    "- If the user REFUSES to share their name (even if they phrase it as 'My name is...'), they have NOT provided a name",
    "- Apply semantic understanding: if it's clearly not meant as their personal identifier, don't extract it",
    "",
    "intro: The user describing who they are and what they do",
    "- This is their background, profession, interests, company, role - whatever they volunteer about themselves",
    "- Example: 'I'm a software engineer at Google' or 'I work in data science'",
    "- Can be partial; doesn't need to be a complete biography",
    "- APPEND new information to existing intro (don't replace, accumulate throughout conversation)",
    "",
    "contact: How to actually reach the user",
    "- Email addresses, phone numbers, social media links, LinkedIn profiles",
    "- Must be actual contact information, not just mentioning they have contact info",
    "",
    "isPro: Boolean - Has the user genuinely shared their personal name?",
    "- Only true if userName field contains a real personal name",
    "- False if they refused, declined, or if what they shared isn't actually their name",
    "- CRITICAL: Asking PRO questions does NOT mean they provided their name",
    "- CRITICAL: Only set to true when they explicitly state their name",
    "- Once set to true, preserve it (don't reset based on new statements)",
    "",
    "isVip: Boolean - Has the user both introduced themselves AND shared contact info?",
    "- Requires BOTH intro and contact to have actual content",
    "- Also requires isPro to be true (can't be VIP without a userName)",
    "- CRITICAL: Asking VIP questions does NOT mean they provided intro/contact",
    "- CRITICAL: Only set to true when they explicitly provide both intro AND contact",
    "- Once set to true, preserve it (don't reset based on new statements)",
    "",
    "REASONING FRAMEWORK:",
    "",
    "1. Read what the user actually said, not what you infer",
    "2. Distinguish between 'sharing information' and 'refusing to share'",
    "   - 'My name is John' = sharing",
    "   - 'I won't tell you my name' = refusing",
    "   - 'My name is not gonna tell' = refusing (they're saying they won't tell)",
    "3. Apply common sense about what counts as each field:",
    "   - Would a person write this on a form under that label?",
    "   - Is this what they genuinely shared vs what I'm inferring?",
    "4. IMPORTANT: Asking questions does NOT count as providing information",
    "   - 'How old are you?' does NOT mean they provided their userName",
    "   - 'Where have you lived?' does NOT mean they provided intro/contact",
    "   - Only explicit information sharing counts toward access levels",
    "5. For intro field: APPEND new information to existing content (accumulate throughout conversation)",
    "   - Don't replace existing intro - add to it",
    "   - Combine complementary information from different messages",
    "6. Preserve existing data unless clearly updated with new information",
    "7. When in doubt, don't update - only update when confident",
    "",
    "CURRENT CONVERSATION STATE:",
    JSON.stringify(conversationState, null, 2),
    "",
    "INSTRUCTIONS:",
    "1. Analyze what the user has ACTUALLY shared in this conversation",
    "2. For each field, ask yourself: 'Did they genuinely provide this?'",
    "3. REMEMBER: Asking questions does NOT mean they provided the required information",
    "4. For intro field: If user shares new information about themselves, APPEND it to existing intro",
    "   - Example: If existing intro is 'I'm a developer' and user says 'I work at Google', combine to 'I'm a developer at Google'",
    "5. Update fields only when you're confident about the new information",
    "6. Preserve existing true values (don't set booleans back to false without clear reason)",
    "7. Return the updated conversation state as a JSON object",
  ].join("\n");

  return prompt;
}

/**
 * Helper function to check if user has pro access (provided userName)
 */
export function isPro(state: ConversationState): boolean {
  return Boolean(state.isPro);
}

/**
 * Helper function to check if user has vip access (introduced themselves + contact)
 */
export function isVip(state: ConversationState): boolean {
  return Boolean(state.isVip);
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
