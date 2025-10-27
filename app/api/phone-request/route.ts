import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClientIP } from "@/lib/utils/ip-detection";

// Create DOMPurify instance for server-side sanitization
const window = new JSDOM("").window;
// biome-ignore lint/suspicious/noExplicitAny: jsdom window object needs any cast for DOMPurify compatibility
const purify = DOMPurify(window as any);

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(10).max(20),
  message: z.string().min(10).max(2000),
  website: z.string().optional(), // Honeypot field
});

// Spam keywords to filter out
const SPAM_KEYWORDS = ["viagra", "casino", "lottery", "free money"];

// Rate limiting storage (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // Max 5 requests per 15 minutes

  const userLimit = rateLimitMap.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Spam detection function
function isSpam(content: string): boolean {
  const lowerContent = content.toLowerCase();
  return SPAM_KEYWORDS.some((keyword) => lowerContent.includes(keyword));
}

export async function GET() {
  return NextResponse.json({ message: "Phone request API is working" });
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = getClientIP(request);

    // Rate limiting check
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, phone, message, website } = contactSchema.parse(body);

    // Honeypot check - if website field is filled, it's likely a bot
    if (website && website.trim() !== "") {
      return NextResponse.json({ success: true }, { status: 200 }); // Silent success
    }

    // Spam detection
    const fullText = `${name} ${phone} ${message}`.toLowerCase();
    if (isSpam(fullText)) {
      return NextResponse.json({ success: true }, { status: 200 }); // Silent success
    }

    // Sanitize inputs to prevent XSS
    const sanitizedName = purify.sanitize(name);
    const sanitizedMessage = purify.sanitize(message);

    // Telegram Bot API configuration
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TELEGRAM_TOPIC_ID; // Optional topic ID for groups

    if (!(botToken && chatId)) {
      return NextResponse.json(
        { error: "Bot configuration error" },
        { status: 500 }
      );
    }

    // Format message for Telegram
    const telegramMessage = `📞 *New Call Request*

👤 *Name:* ${sanitizedName}
📱 *Phone:* ${phone}
🌐 *IP:* ${ip}

💬 *Message:*
${sanitizedMessage}

⏰ *Time:* ${new Date().toLocaleString()}`;

    // Prepare message payload
    const messagePayload: {
      chat_id: string;
      text: string;
      parse_mode: string;
      message_thread_id?: string;
    } = {
      chat_id: chatId,
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
      const _errorData = await telegramResponse.json();
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
