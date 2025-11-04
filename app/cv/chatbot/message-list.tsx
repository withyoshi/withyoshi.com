"use client";

import { AnimatePresence, motion } from "framer-motion";
import debounce from "lodash.debounce";
import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { MessageItem } from "./message-item";
import { ChatboxContext } from "./provider";
import { Tipbox } from "./tipbox";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
  metadata?: {
    queued?: boolean;
  };
};

type ChatbotMessageProps = {
  messages: ChatMessage[];
  error: string | null;
};

export function MessageList(props: ChatbotMessageProps) {
  const { messages, error } = props;
  const { isTipboxVisible, status, queuedMessages, scrollToBottomRef } =
    useContext(ChatboxContext);

  const messageListRef = useRef<HTMLDivElement>(null);

  const scrollToBottomDebounced = useMemo(
    () =>
      debounce(
        () => {
          const container = messageListRef.current;
          if (!container) {
            return;
          }
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
        },
        50,
        { leading: true, trailing: true }
      ),
    []
  );

  const scrollToBottom = useCallback(() => {
    scrollToBottomDebounced();
  }, [scrollToBottomDebounced]);

  // Expose scrollToBottom through context
  useEffect(() => {
    scrollToBottomRef.current = scrollToBottom;
    return () => {
      scrollToBottomRef.current = null;
    };
  }, [scrollToBottom, scrollToBottomRef]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  return (
    <div
      className="no-scrollbar relative z-20 max-h-screen overflow-y-auto overscroll-contain px-4 pt-4 sm:max-h-[75vh] [&>*:nth-last-child(2)]:m-0"
      id="chatbot-message-list"
      ref={messageListRef}
    >
      <MessageItem
        message={{
          id: "1",
          role: "assistant",
          content:
            "Hey! I'm Yoyo! 👋 Your chatbot assistant to get to know Yan Sern better. Got a question about him? Ask me and I'll tell you everything I know. 🪄 You can also use the message presets below to get started!",
        }}
      />

      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            animate={{ height: "auto", opacity: 1, x: 0, y: 0 }}
            exit={{ height: 0, opacity: 0, x: 10, y: 0 }}
            initial={{ height: 0, opacity: 0, x: 0, y: "100%" }}
            key={m.id}
            onUpdate={scrollToBottom}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <MessageItem message={m} />
          </motion.div>
        ))}
      </AnimatePresence>

      {(status === "submitted" || status === "streaming") && (
        <MessageItem loading />
      )}

      {/* Queued user messages while assistant is streaming */}
      <AnimatePresence initial={false}>
        {queuedMessages.map((queuedMessage) => (
          <motion.div
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: "-100%" }}
            initial={{ height: 0, opacity: 0, y: 10 }}
            key={queuedMessage.id}
            onUpdate={scrollToBottom}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <MessageItem message={queuedMessage} />
          </motion.div>
        ))}
      </AnimatePresence>

      {error && <MessageItem error={error} />}

      {/* Tipbox with framer-motion enter/exit */}
      <AnimatePresence initial={false}>
        {isTipboxVisible && (
          <motion.div
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 6 }}
            initial={{ height: 0, opacity: 0, y: 6 }}
            onUpdate={scrollToBottom}
            transition={{ duration: 0.1, ease: "easeOut" }}
          >
            <Tipbox />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed spacer height - approximately 100px for input bar with padding */}
      <div className="h-[86px] xs:h-[106px]" />
    </div>
  );
}
