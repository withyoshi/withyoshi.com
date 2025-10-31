"use client";

import { useContext, useEffect, useRef } from "react";
import { ChatBar, type ChatBarHandle } from "./chat-bar";
import { ChatbotMessage } from "./message-list";
import { ChatboxContext } from "./provider";
export function ChatWindow() {
  const { isOpen, messages, sendMessage, input, setInput, error, setError } =
    useContext(ChatboxContext);
  const inputBarRef = useRef<ChatBarHandle>(null);

  // Focus input whenever chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputBarRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setError(null);
      sendMessage({ text: input });
      setInput("");
    }
  };

  const handleTipSelect = (tip: string) => {
    setError(null);
    sendMessage({ text: tip });
  };

  return (
    <>
      {/* Messages Container */}
      <div
        className={`relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl shadow-mint-500/50 shadow-xl backdrop-blur-sm backdrop-brightness-90 backdrop-contrast-75 transition-all duration-500 ease-out ${
          isOpen
            ? "max-h-screen xs:max-h-[75vh] translate-y-0 opacity-100"
            : "pointer-events-none max-h-0 translate-y-2 opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 h-[50%]z-10 rounded-3xl bg-[radial-gradient(ellipse_at_top_left,theme(colors.mint.100),transparent)]" />
        <div className="pointer-events-none absolute inset-0 z-0 rounded-3xl bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.mint.50),transparent)]" />
        <div className="mask-linear-135 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-3xl border-2 border-white" />
        <div className="mask-linear-180 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-3xl border-1 border-mint-600/50" />
        <div className="mask-linear mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-3xl border-1 border-gray-400/50" />

        {/* Message List */}
        <ChatbotMessage
          error={error}
          messages={messages as any}
          onTipSelect={handleTipSelect}
        />

        {/* Input */}
        <ChatBar
          input={input}
          onChange={(e) => setInput(e.target.value)}
          onSubmit={handleSubmit}
          ref={inputBarRef}
        />
      </div>
    </>
  );
}
