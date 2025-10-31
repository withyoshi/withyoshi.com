"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { createContext, useMemo, useState } from "react";

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
  // derived flags
  isMessageStreaming: boolean;
  isMessageSubmitted: boolean;
  isMessageReady: boolean;
  isMessageError: boolean;
  isMessageLoading: boolean;
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
    isPro: true,
    isVip: false,
  });

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/cv/chatbot",
    }),
    onError: (chatError) => {
      console.error(chatError);
      setError(chatError.message || "An error occurred while chatting");
    },
  });

  const isMessageStreaming = status === "streaming";
  const isMessageSubmitted = status === "submitted";
  const isMessageReady = status === "ready";
  const isMessageError = !!error;
  const isMessageLoading = isMessageStreaming && isMessageSubmitted;

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
      isMessageStreaming,
      isMessageSubmitted,
      isMessageReady,
      isMessageError,
      isMessageLoading,
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
      isMessageStreaming,
      isMessageSubmitted,
      isMessageReady,
      isMessageError,
      isMessageLoading,
      conversationState,
    ]
  );

  return (
    <ChatboxContext.Provider value={value}>{children}</ChatboxContext.Provider>
  );
}

// removed useTipbox; consumers should use useContext(ChatboxContext)
