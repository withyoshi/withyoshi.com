import CryptoJS from "crypto-js";
import {
  encryptedCorePrompt,
  encryptedGuestPrompt,
  encryptedProPrompt,
  encryptedVipPrompt,
} from "./data";
import type { ConversationState } from "./state";

/**
 * Decrypts a string using AES-256 decryption
 */
export function decrypt(encryptedData: string): string {
  const secretKey = process.env.CHATBOT_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CHATBOT_SECRET_KEY is required for decryption");
  }
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey as string);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Decrypt all prompts once during module initialization
const corePrompt = decrypt(encryptedCorePrompt);
const guestPrompt = decrypt(encryptedGuestPrompt);
const proPrompt = decrypt(encryptedProPrompt);
const vipPrompt = decrypt(encryptedVipPrompt);

/**
 * Builds the static system prompt with all content.
 * Access control is handled by the ACCESS CONTROL rules in core.md based on conversationState.
 * This is static to enable better token caching.
 */
export function buildSystemPrompt(): string {
  // Include all content statically - access control is enforced by prompt rules
  return [corePrompt, guestPrompt, proPrompt, vipPrompt].join("\n");
}

/**
 * Static system prompt - kept for backward compatibility
 * Use buildSystemPrompt for new code
 */
export const systemPrompt = [
  corePrompt,
  guestPrompt,
  proPrompt,
  vipPrompt,
].join("\n");

/**
 * Generates conversation state context for the system prompt
 */
export function generateConversationStateContext(
  conversationState: ConversationState = {}
): string {
  return `\n## CONVERSATION STATE START\n${JSON.stringify(conversationState)}\n## CONVERSATION STATE END`;
}
