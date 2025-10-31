"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useContext, useEffect, useRef } from "react";
import { MessageItem } from "./message-item";
import { MessageItemError } from "./message-item-error";
import { MessageItemLoading } from "./message-item-loading";
import { ChatboxContext } from "./provider";
import { Tipbox } from "./tipbox";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
  metadata?: unknown;
};

type ChatbotMessageProps = {
  messages: ChatMessage[];
  error: string | null;
  onTipSelect: (tip: string) => void;
};

export function ChatbotMessage(props: ChatbotMessageProps) {
  const { messages, error, onTipSelect } = props;
  const { isTipboxVisible, isMessageSubmitted } = useContext(ChatboxContext);

  const messageListRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }
    setTimeout(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  const scrollToBottomImmediate = useCallback(() => {
    const container = messageListRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return (
    <div
      className="no-scrollbar relative z-20 max-h-screen space-y-4 overflow-y-auto overscroll-contain px-4 pt-4 sm:max-h-[60vh] [&>*:nth-last-child(2)]:m-0"
      id="chatbot-message-list"
      ref={messageListRef}
    >
      <MessageItem
        message={{
          id: "1",
          role: "assistant",
          content: "Hello! I'm Yoyo!",
        }}
      />

      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} />
        ))}
      </AnimatePresence>

      {error && <MessageItemError error={error} />}

      {isMessageSubmitted && <MessageItemLoading />}

      {/* Tipbox with framer-motion enter/exit */}
      <AnimatePresence initial={false}>
        {isTipboxVisible && (
          <motion.div
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 6 }}
            initial={{ height: 0, opacity: 0, y: 6 }}
            onUpdate={scrollToBottomImmediate}
            style={{ overflow: "hidden" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Tipbox onTipSelect={onTipSelect} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed spacer height - approximately 100px for input bar with padding */}
      <div className="h-[106px]" />
    </div>
  );
}
