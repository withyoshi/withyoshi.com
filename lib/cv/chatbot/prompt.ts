import CryptoJS from "crypto-js";
import {
  encryptedCorePrompt,
  encryptedCvPrompt,
  encryptedFaqPrompt,
  encryptedGatedPrompt,
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
const faqPrompt = decrypt(encryptedFaqPrompt);
const gatedPrompt = decrypt(encryptedGatedPrompt);

/**
 * Generates the complete system prompt by combining all decrypted prompt data
 */
export const systemPrompt = [corePrompt, cvPrompt, faqPrompt, gatedPrompt].join(
  "\n"
);

/**
 * Generates conversation state context for the system prompt
 */
export function generateConversationStateContext(
  conversationState: ConversationState = {}
): string {
  const {
    userName,
    company,
    email,
    nameAttempts = 0,
    hasAcknowledgedYoshi,
  } = conversationState;

  const hasGatedAccess = company && email;
  const maxNameAttemptsReached = nameAttempts >= 3;

  return [
    "## CONVERSATION STATE",
    userName ? `User: ${userName}` : "User: Anonymous",
    company ? `Company: ${company}` : "",
    email ? `Email: ${email}` : "",
    hasGatedAccess
      ? "✅ GATED INFO UNLOCKED - Personal details can be shared"
      : "🔒 GATED INFO LOCKED - Need both company and email",
    nameAttempts > 0
      ? `Name attempts: ${nameAttempts}/3${maxNameAttemptsReached ? " (STOP asking)" : ""}`
      : "",
    hasAcknowledgedYoshi
      ? "✅ Yoshi nickname acknowledged - Don't repeat surprise"
      : "",
  ].join("\n");
}
