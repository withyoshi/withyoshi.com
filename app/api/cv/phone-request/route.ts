import type { NextRequest } from "next/server";
import { createApiHandler, withRateLimiting, withValidation } from "@/lib/api";
import { PhoneRequestSchema } from "./schema";
import type { TelegramMessagePayload } from "./types";

export const POST = createApiHandler(
  "PhoneRequestAPI",
  [withRateLimiting(5, 60_000), withValidation(PhoneRequestSchema)], // 5 requests per minute
  async (_request: NextRequest, context: any) => {
    const { data, ip, logger } = context;
    const { name, phone, message } = data;

    // Telegram Bot API configuration (now type-safe from env)
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TELEGRAM_TOPIC_ID;

    // Log environment and test
    logger.info(`NODE_ENV: ${process.env.NODE_ENV}`, {
      environment: process.env.NODE_ENV,
      test: "console suppression test",
    });

    // Format message for Telegram
    const telegramMessage = `📞 *New Call Request*

👤 *Name:* ${name}
📱 *Phone:* ${phone}
🌐 *IP:* ${ip}

💬 *Message:*
${message}

⏰ *Time:* ${new Date().toLocaleString()}`;

    // Prepare message payload
    const messagePayload: TelegramMessagePayload = {
      chat_id: chatId as string,
      text: telegramMessage,
      parse_mode: "Markdown",
    };

    // Add topic ID if available (for groups with topics)
    if (topicId) {
      messagePayload.message_thread_id = topicId;
    }

    // Send message to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagePayload),
      }
    );

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json();
      logger.error("Telegram API error", {
        errorData,
        status: telegramResponse.status,
      });
      return Response.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    logger.info(`Phone request sent successfully for: ${name}`, {
      ip,
      name,
    });
    return Response.json({ success: true }, { status: 200 });
  }
);
