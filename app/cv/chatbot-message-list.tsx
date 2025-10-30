"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
  metadata?: unknown;
};

type ConversationState = {
  userName: string | null;
  isPro: boolean;
  isVip: boolean;
};

function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm shadow-lg backdrop-blur-sm">
        <div className="font-medium text-red-800">Error occurred:</div>
        <div className="mt-1 text-red-700">{error}</div>
      </div>
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl border border-white/30 bg-white/20 p-2 shadow-lg backdrop-blur-sm">
        <div className="flex gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-mint-400 [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-mint-400 [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-mint-400" />
        </div>
      </div>
    </div>
  );
}

function extractMessageContent(message: ChatMessage): string {
  return (
    message.parts
      ?.filter((part) => part.type === "text")
      .map((part) => part.text || "")
      .join("") ||
    message.content ||
    ""
  );
}

function UserBadge({ isPro, isVip }: { isPro: boolean; isVip: boolean }) {
  if (isVip) {
    return (
      <span className="rounded-sm bg-purple-500 px-[4px] py-[2px] font-semibold text-[9px] text-white">
        VIP
      </span>
    );
  }
  if (isPro) {
    return (
      <span className="rounded-sm bg-white/25 px-[4px] py-[2px] font-semibold text-[9px] text-white">
        PRO
      </span>
    );
  }
  return null;
}

function MessageHeader({
  role,
  conversationState,
}: {
  role: string;
  conversationState: ConversationState;
}) {
  if (role === "user") {
    return (
      <>
        <span className="font-semibold">
          {conversationState.userName || "Mystery Visitor"}
        </span>
        <UserBadge
          isPro={conversationState.isPro}
          isVip={conversationState.isVip}
        />
      </>
    );
  }

  if (role === "assistant") {
    return (
      <>
        <span className="font-semibold">Yoyo</span>
        <span className="-mt-0.5 ml-0.5 rounded-full bg-mint-600">
          <Image
            alt="Chat with Yoshi"
            className="-left-1 relative top-0.5 h-4 w-4"
            height={24}
            src="/images/cv-yoyo.svg"
            width={24}
          />
        </span>
      </>
    );
  }

  return null;
}

function MessageItem({
  message,
  conversationState,
}: {
  message: ChatMessage;
  conversationState: ConversationState;
}) {
  const content = extractMessageContent(message);
  const isUser = message.role === "user";

  if (!content) {
    return null;
  }

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      style={{
        animation: "fadeInUp 0.2s ease-out",
      }}
    >
      <div className="chatbot-message-item relative z-20 max-w-[85%]">
        <div
          className={`relative z-20 rounded-2xl text-sm shadow-sm backdrop-contrast-125 ${
            isUser ? "bg-mint-600/90 text-white" : "bg-white/50"
          }`}
        >
          <div
            className={`flex gap-1 px-4 py-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className="flex flex-1 flex-col text-left">
              <div className="flex items-center gap-1">
                <MessageHeader
                  conversationState={conversationState}
                  role={message.role}
                />
              </div>
              <div>{content}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type ChatbotMessageListProps = {
  messages: ChatMessage[];
  error: string | null;
  isLoading: boolean;
  conversationState: ConversationState;
};

export function ChatbotMessageList(props: ChatbotMessageListProps) {
  const { messages, error, isLoading, conversationState } = props;

  const messageListRef = useRef<HTMLDivElement>(null);

  // Inject fadeInUp animation styles
  useEffect(() => {
    const styleId = "chatbot-fadeInUp-animation";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const el = messageListRef.current;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    }
  }, [messages]);

  return (
    <div
      className="no-scrollbar relative z-20 max-h-screen space-y-4 overflow-y-auto overscroll-contain px-4 pt-4 sm:max-h-[60vh] [&>*:nth-last-child(2)]:m-0"
      id="chatbot-message-list"
      ref={messageListRef}
    >
      <MessageItem
        conversationState={conversationState}
        message={{
          id: "1",
          role: "assistant",
          content: "Hello! I'm Yoyo!",
        }}
      />

      {messages.map((m) => (
        <MessageItem
          conversationState={conversationState}
          key={m.id}
          message={m}
        />
      ))}

      {error && <ErrorMessage error={error} />}

      {isLoading && <LoadingIndicator />}

      {/* Fixed spacer height - approximately 100px for input bar with padding */}
      <div className="h-[106px]" />
    </div>
  );
}
