"use client";

import { useContext } from "react";
import { ChatBar } from "./chat-bar";
import { MessageList } from "./message-list";
import { ChatboxContext } from "./provider";
export function ChatWindow() {
  const { isOpen, messages, error } = useContext(ChatboxContext);

  return (
    <div
      className={`relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl shadow-mint-500/50 shadow-xl backdrop-blur-sm backdrop-brightness-90 backdrop-contrast-75 transition-all duration-500 ease-out ${
        isOpen
          ? "max-h-screen xs:max-h-[75vh] translate-y-0 opacity-100"
          : "pointer-events-none max-h-0 translate-y-2 opacity-0"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-[radial-gradient(ellipse_at_top_left,theme(colors.mint.100),transparent)]" />
      <div className="pointer-events-none absolute inset-0 z-0 rounded-3xl bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.mint.50),transparent)]" />

      {/* Message List */}
      <MessageList error={error} messages={messages as any} />

      {/* Input */}
      <ChatBar className="absolute bottom-0 z-40 xs:p-4" />

      <div className="mask-linear-135 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-50 rounded-3xl border-2 border-white" />
      <div className="mask-linear-180 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-50 rounded-3xl border-1 border-mint-600/50" />
      <div className="mask-linear mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-50 rounded-3xl border-1 border-gray-400/50" />
    </div>
  );
}
