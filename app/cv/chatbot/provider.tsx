"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { nanoid } from "nanoid";
import { createContext, useCallback, useMemo, useRef, useState } from "react";

type ChatboxContextValue = {
  // tipbox
  isTipboxVisible: boolean;
  setTipboxVisible: React.Dispatch<React.SetStateAction<boolean>>;
  // open/close
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // chat input/error
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  // first-time tooltip
  showFirstTimeTooltip: boolean;
  setShowFirstTimeTooltip: React.Dispatch<React.SetStateAction<boolean>>;
  // chat state
  messages: any[];
  sendMessage: (params: { text: string }) => void;
  status: string;
  // message queue
  queuedMessages: Array<{ id: string; text: string }>;
  queueMessage: (text: string) => void;
  addMessage: (text: string) => void;
  // conversation state
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
  const [queuedMessages, setQueuedMessages] = useState<
    Array<{ id: string; text: string }>
  >([]);
  const queuedMessagesRef = useRef<Array<{ id: string; text: string }>>([]);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/cv/chatbot",
    }),
    onError: (chatError) => {
      console.error(chatError);
      setError(chatError.message || "An error occurred while chatting");
    },
    onFinish: () => {
      console.log("onFinish");
      const current = queuedMessagesRef.current;
      if (!current || current.length === 0) {
        return;
      }
      const [next, ...rest] = current;
      queuedMessagesRef.current = rest;
      setQueuedMessages(rest);
      sendMessage({ text: next.text });
    },
  });

  const queueMessage = useCallback((text: string) => {
    setQueuedMessages((prev) => {
      const next = [...prev, { id: nanoid(), text }];
      queuedMessagesRef.current = next;
      return next;
    });
  }, []);

  const addMessage = useCallback(
    (text: string) => {
      if (!text) {
        return;
      }
      if (status === "error") {
        setError(null);
        sendMessage({ text });
      } else if (status === "ready") {
        sendMessage({ text });
      } else {
        queueMessage(text);
      }
    },
    [status, sendMessage, queueMessage]
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
      addMessage,
      conversationState,
    ]
  );

  return (
    <ChatboxContext.Provider value={value}>{children}</ChatboxContext.Provider>
  );
}

// removed useTipbox; consumers should use useContext(ChatboxContext)
