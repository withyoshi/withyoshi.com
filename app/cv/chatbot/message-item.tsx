"use client";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useContext } from "react";
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

function VipBadge() {
  return (
    <span className="rounded-sm bg-purple-500 px-[4px] py-[2px] font-semibold text-[9px] text-white">
      VIP
    </span>
  );
}

function ProBadge() {
  return (
    <span className="rounded-sm bg-white/25 px-[4px] py-[2px] font-semibold text-[9px] text-white">
      PRO
    </span>
  );
}

function MessageHeaderUser() {
  const { conversationState } = useContext(ChatboxContext);
  return (
    <div className="flex min-w-0 items-start gap-1">
      <span className="min-w-0 truncate font-semibold">
        {conversationState.userName || "Mystery Visitor"}
      </span>
      {conversationState.isVip ? (
        <VipBadge />
      ) : conversationState.isPro ? (
        <ProBadge />
      ) : null}
    </div>
  );
}

function MessageHeaderAssistant() {
  return (
    <div className="flex min-w-0 items-start gap-1">
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
    </div>
  );
}

function MessageItemUser({
  content,
  className,
}: {
  content: string;
  className: string;
}) {
  return (
    <div
      className={`${className} border-t-1 border-t-mint-100 ml-auto min-w-0 flex-col text-left text-white bg-[linear-gradient(0deg,theme(colors.mint.700/0.9),theme(colors.mint.600/0.7))]`}
    >
      <MessageHeaderUser />
      <div>{content}</div>
    </div>
  );
}

function MessageItemAssistant({
  content,
  className,
}: {
  content: string;
  className: string;
}) {
  return (
    <div
      className={`${className} border-t-1 border-t-white min-w-0 flex-col bg-[linear-gradient(90deg,theme(colors.white/0.8),theme(colors.white/0.4))] text-left`}
    >
      <MessageHeaderAssistant />
      <div>{content}</div>
    </div>
  );
}

function MessageItemQueued({
  message,
  content,
  className,
}: {
  message: ChatMessage;
  content: string;
  className: string;
}) {
  const { removeQueuedMessage } = useContext(ChatboxContext);

  return (
    <div
      className={`${className} ml-auto flex-row-reverse items-center gap-4 border border-mint-600 bg-transparent text-mint-600`}
    >
      <button
        aria-label="Remove queued message"
        className="relative aspect-square h-8 w-8 cursor-pointer rounded-full border-1 border-mint-600 p-1 text-mint-600/80 hover:bg-mint-600/50 hover:text-white focus:outline-none"
        onClick={() => removeQueuedMessage(message.id)}
        type="button"
      >
        <FontAwesomeIcon className="-top-0.5 relative h-4 w-4" icon={faXmark} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col text-left">
        <MessageHeaderUser />
        <div>{content}</div>
      </div>
    </div>
  );
}

function MessageItemError({
  error,
  className,
}: {
  error: string;
  className: string;
}) {
  return (
    <div
      className={`${className} border border-red-400/30 bg-red-500/20 shadow-lg backdrop-blur-sm`}
    >
      <div className="font-medium text-red-800">Error occurred</div>
      <div className="mt-1 break-all text-red-700 text-xs">{error}</div>
    </div>
  );
}

function MessageItemLoading({ className }: { className: string }) {
  return (
    <div
      className={`${className} gap-1 border border-white/30 bg-white/25 p-2 shadow-lg`}
    >
      <div className="relative top-0.5 h-2 w-2 animate-bounce rounded-full bg-mint-400 [animation-delay:-0.3s]" />
      <div className="relative top-0.5 h-2 w-2 animate-bounce rounded-full bg-mint-400 [animation-delay:-0.15s]" />
      <div className="relative top-0.5 h-2 w-2 animate-bounce rounded-full bg-mint-400" />
    </div>
  );
}

export function MessageItem({
  message,
  error,
  loading,
}: {
  message?: ChatMessage;
  error?: string;
  loading?: boolean;
}) {
  const className =
    "relative z-20 flex w-fit max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm";

  if (loading) {
    return (
      <div className="pb-4">
        <MessageItemLoading className={className} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pb-4">
        <MessageItemError className={className} error={error} />
      </div>
    );
  }

  if (!message) {
    return null;
  }

  const content = extractMessageContent(message);
  const isUser = message.role === "user";
  const isQueued = message.metadata?.queued;

  if (!content) {
    return null;
  }

  return (
    <div className="pb-4">
      {isUser && isQueued ? (
        <MessageItemQueued
          className={className}
          content={content}
          message={message}
        />
      ) : isUser ? (
        <MessageItemUser className={className} content={content} />
      ) : (
        <MessageItemAssistant className={className} content={content} />
      )}
    </div>
  );
}
