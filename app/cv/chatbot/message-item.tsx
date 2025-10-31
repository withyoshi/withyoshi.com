"use client";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useContext } from "react";
import { ProBadge, VipBadge } from "./message-item-badges";
import { ChatboxContext } from "./provider";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
  metadata?: {
    queued?: boolean;
  };
};

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

function MessageHeader({ role }: { role: string }) {
  const { conversationState } = useContext(ChatboxContext);
  if (role === "user") {
    return (
      <>
        <span className="min-w-0 truncate font-semibold">
          {conversationState.userName || "Mystery Visitor"}
        </span>
        {conversationState.isVip ? (
          <VipBadge />
        ) : conversationState.isPro ? (
          <ProBadge />
        ) : null}
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

export function MessageItem({
  message,
  className = "",
}: {
  message: ChatMessage;
  className?: string;
}) {
  const content = extractMessageContent(message);
  const isUser = message.role === "user";
  const isQueued = message.metadata?.queued;
  const { removeQueuedMessage } = useContext(ChatboxContext);

  if (!content) {
    return null;
  }

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} ${className}`}
    >
      <div className="relative z-20 max-w-[85%]">
        <div
          className={`relative z-20 rounded-2xl text-sm shadow-sm ${
            isUser
              ? isQueued
                ? "border border-mint-600 bg-transparent text-mint-600"
                : "bg-mint-600/90 text-white"
              : "bg-white/50"
          }`}
        >
          <div
            className={`flex gap-1 px-4 py-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
          >
            {isUser && isQueued ? (
              <button
                aria-label="Remove queued message"
                className="-mr-2 relative aspect-square h-10 w-10 cursor-pointer rounded-full p-1 text-mint-600/80 hover:bg-mint-600/50 hover:text-white focus:outline-none"
                onClick={() => removeQueuedMessage(message.id)}
                type="button"
              >
                <FontAwesomeIcon className="h-4 w-4" icon={faXmark} />
              </button>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col text-left">
              <div className="flex min-w-0 items-start gap-1">
                <MessageHeader role={message.role} />
              </div>
              <div>{content}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
