"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { nanoid } from "nanoid";
import { createContext, useCallback, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "./message-item";

type ChatboxContextValue = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isTipboxVisible: boolean;
  setTipboxVisible: React.Dispatch<React.SetStateAction<boolean>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  showFirstTimeTooltip: boolean;
  setShowFirstTimeTooltip: React.Dispatch<React.SetStateAction<boolean>>;
  messages: any[];
  sendMessage: (params: { text: string }) => void;
  status: string;
  queuedMessages: ChatMessage[];
  queueMessage: (text: string) => void;
  removeQueuedMessage: (id: string) => void;
  addMessage: (text: string) => void;
  conversationState: {
    userName: string | null;
    isPro: boolean;
    isVip: boolean;
  };
  setConversationState: React.Dispatch<
    React.SetStateAction<{
      userName: string | null;
      isPro: boolean;
      isVip: boolean;
    }>
  >;
};

export const ChatboxContext = createContext<ChatboxContextValue>(
  {} as ChatboxContextValue
);

export function ChatboxProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTipboxVisible, setTipboxVisible] = useState(true);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showFirstTimeTooltip, setShowFirstTimeTooltip] = useState(true);
  const [conversationState, setConversationState] = useState({
    userName: null as string | null,
    isPro: false,
    isVip: true,
  });
  const [queuedMessages, setQueuedMessages] = useState<ChatMessage[]>([]);
  const sendPipelineRef = useRef<Promise<void>>(Promise.resolve());
  const cancelledMessageIdsRef = useRef<Set<string>>(new Set());

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/cv/chatbot",
    }),
    onError: (chatError) => {
      console.error(chatError);
      setError(chatError.message || "An error occurred while chatting");
    },
    // No need to manually advance a queue; the promise pipeline serializes sends
  });

  const queueMessage = useCallback(
    (text: string) => {
      const queuedId = nanoid();
      // Add to UI queue immediately
      setQueuedMessages((prev) => [
        ...prev,
        {
          id: queuedId,
          role: "user",
          content: text,
          metadata: { queued: true },
        },
      ]);

      // Serialize actual sends via promise pipeline
      sendPipelineRef.current = sendPipelineRef.current
        .then(async () => {
          // If user canceled this queued message, skip sending
          if (cancelledMessageIdsRef.current.has(queuedId)) {
            // Ensure it's not shown in UI anymore
            setQueuedMessages((prev) => prev.filter((m) => m.id !== queuedId));
            return;
          }
          // Remove from UI queue right before sending and send
          setQueuedMessages((prev) => prev.filter((m) => m.id !== queuedId));
          await sendMessage({ text });
        })
        .catch(() => {
          // Keep chain alive; error is handled by onError or inside sendMessage
        });
    },
    [sendMessage]
  );

  const removeQueuedMessage = useCallback((id: string) => {
    cancelledMessageIdsRef.current.add(id);
    setQueuedMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addMessage = useCallback(
    (text: string) => {
      if (!text) {
        return;
      }
      if (status === "error") {
        setError(null);
      }
      // Always enqueue; pipeline ensures strict serialization
      queueMessage(text);
    },
    [status, queueMessage]
  );

  const value = useMemo(
    () => ({
      isTipboxVisible,
      setTipboxVisible,
      isOpen,
      setIsOpen,
      input,
      setInput,
      error,
      setError,
      showFirstTimeTooltip,
      setShowFirstTimeTooltip,
      messages: messages as any[],
      sendMessage,
      status,
      queuedMessages,
      queueMessage,
      removeQueuedMessage,
      addMessage,
      conversationState,
      setConversationState,
    }),
    [
      isTipboxVisible,
      isOpen,
      input,
      error,
      showFirstTimeTooltip,
      messages,
      sendMessage,
      status,
      queuedMessages,
      queueMessage,
      removeQueuedMessage,
      addMessage,
      conversationState,
    ]
  );

  return (
    <ChatboxContext.Provider value={value}>{children}</ChatboxContext.Provider>
  );
}

// removed useTipbox; consumers should use useContext(ChatboxContext)
