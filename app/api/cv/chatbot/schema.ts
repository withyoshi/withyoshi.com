import { z } from "zod";

// Message schema for individual chat messages (AI SDK format)
const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  parts: z.array(
    z.object({
      type: z.literal("text"),
      text: z.string(),
    })
  ),
  id: z.string(),
});

// Main chatbot request schema
export const ChatbotRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1, "Messages array cannot be empty"),
  chatId: z.string().optional(),
});

// Export inferred types
export type ChatbotRequest = z.infer<typeof ChatbotRequestSchema>;
