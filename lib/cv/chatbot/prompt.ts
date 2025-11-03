import CryptoJS from "crypto-js";
import {
  encryptedCorePrompt,
  encryptedCvPrompt,
  encryptedProPrompt,
  encryptedVipPrompt,
} from "./data";
import type { ConversationState } from "./state";

/**
 * Decrypts a string using AES-256 decryption
 */
function decrypt(encryptedData: string): string {
  const secretKey = process.env.CHATBOT_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CHATBOT_SECRET_KEY is required for decryption");
  }
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey as string);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Decrypt all prompts once during module initialization
const corePrompt = decrypt(encryptedCorePrompt);
const cvPrompt = decrypt(encryptedCvPrompt);
const proPrompt = decrypt(encryptedProPrompt);
const vipPrompt = decrypt(encryptedVipPrompt);

/**
 * Generates the complete system prompt by combining all decrypted prompt data
 */
export const systemPrompt = [corePrompt, cvPrompt, proPrompt, vipPrompt].join(
  "\n"
);

/**
 * Generates conversation state context for the system prompt
 */
export function generateConversationStateContext(
  conversationState: ConversationState = {}
): string {
  const { userName, intro, contact, isPro, isVip } = conversationState;

  return [
    "## CONVERSATION STATE",
    userName ? `Name: ${userName}` : "Name: Not provided",
    intro ? `Introduction: ${intro}` : "",
    contact ? `Contact: ${contact}` : "",
    isPro
      ? "✅ PRO ACCESS UNLOCKED - Name provided, can share PRO level content (marked with # PRO_LEVEL_CONTENT_START/END)"
      : "🔒 PRO ACCESS LOCKED - Need userName to access PRO level content",
    isVip
      ? "✅ VIP ACCESS UNLOCKED - Introduced + contact provided, can share VIP level content (marked with # VIP_LEVEL_CONTENT_START/END)"
      : "🔒 VIP ACCESS LOCKED - Need intro and contact to access VIP level content",
  ].join("\n");
}
