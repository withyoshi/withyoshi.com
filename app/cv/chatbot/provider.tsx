"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { nanoid } from "nanoid";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  isInputFocused: boolean;
  setIsInputFocused: React.Dispatch<React.SetStateAction<boolean>>;
  messages: any[];
  sendMessage: (params: { text: string }) => void;
  status: string;
  queuedMessages: ChatMessage[];
  queueMessage: (text: string) => void;
  removeQueuedMessage: (id: string) => void;
  addMessage: (text: string) => void;
  conversationState: {
    userName: string | null;
    userIntro: string | null;
    contact: string | null;
    userType: "pro" | "vip" | null;
  };
  setConversationState: React.Dispatch<
    React.SetStateAction<{
      userName: string | null;
      userIntro: string | null;
      contact: string | null;
      userType: "pro" | "vip" | null;
    }>
  >;
  scrollToBottomRef: React.MutableRefObject<(() => void) | null>;
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [conversationState, setConversationState] = useState({
    userName: null as string | null,
    userIntro: null as string | null,
    contact: null as string | null,
    userType: null as "pro" | "vip" | null,
  });
  const [queuedMessages, setQueuedMessages] = useState<ChatMessage[]>([]);
  const scrollToBottomRef = useRef<(() => void) | null>(null);
  const sendPipelineRef = useRef<Promise<void>>(Promise.resolve());
  const cancelledMessageIdsRef = useRef<Set<string>>(new Set());
  // Track retries by message content hash (more reliable than ID)
  const retryAttemptsRef = useRef<Map<string, number>>(new Map());
  // Track processed messages by a combination of index and metadata
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/cv/chatbot",
    }),
    onError: (chatError) => {
      console.error(chatError);
      setError(chatError.message || "An error occurred while chatting");
    },
    // No need to manually advance a queue; the promise pipeline serializes sends
  });

  // Update conversation state from message metadata
  useEffect(() => {
    const lastMessage = messages.at(-1);
    if (lastMessage && (lastMessage as any).metadata?.conversationState) {
      const fullState = (lastMessage as any).metadata.conversationState;
      setConversationState({
        userName: fullState.userName ?? null,
        userIntro: fullState.userIntro ?? null,
        contact: fullState.contact ?? null,
        userType: fullState.userType ?? null,
      });
    }
  }, [messages]);

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

  // Retry logic for unknown finish reasons
  useEffect(() => {
    const lastMessage = messages.at(-1);
    if (!lastMessage) {
      return;
    }

    const metadata = (lastMessage as any).metadata;

    // Only process assistant messages
    if ((lastMessage as any).role !== "assistant") {
      return;
    }

    // Only process when finish reason is available (streaming is complete)
    // This early return prevents the effect from running during streaming
    if (!metadata?.finishReason) {
      return;
    }

    // Create a unique key using message index + generationTime (more reliable)
    // Use message index as a stable identifier
    const messageIndex = messages.length - 1;
    const finishTime = metadata.generationTime || Date.now();
    const messageKey = `${messageIndex}-${finishTime}-${metadata.finishReason}`;

    // Only retry if finish reason is "unknown" and not currently streaming/error
    const shouldRetry =
      metadata.finishReason === "unknown" &&
      status !== "streaming" &&
      status !== "error";

    // For unknown finish reasons, we need to wait until status is ready before processing
    // So we use a different key that includes status to track processing
    const processingKey = shouldRetry ? `${messageKey}-ready` : messageKey;

    // Skip if we've already processed this message
    if (processedMessagesRef.current.has(processingKey)) {
      return;
    }

    // Debug log only when we actually process something
    console.log("[Chatbot Retry] Processing message:", {
      messageKey,
      finishReason: metadata.finishReason,
      status,
      shouldRetry,
    });

    // If it's not an unknown finish reason, mark as processed and return
    if (!shouldRetry) {
      processedMessagesRef.current.add(processingKey);
      return;
    }

    // For unknown finish reasons, process the retry logic
    if (shouldRetry) {
      // Find the previous user message and its index
      let previousUserMessage: any = null;
      let previousUserMessageIndex = -1;
      for (let i = messages.length - 2; i >= 0; i--) {
        if ((messages[i] as any).role === "user") {
          previousUserMessage = messages[i];
          previousUserMessageIndex = i;
          break;
        }
      }

      if (!previousUserMessage || previousUserMessageIndex === -1) {
        console.warn("[Chatbot Retry] No previous user message found");
        // Mark as processed even if we can't retry
        processedMessagesRef.current.add(processingKey);
        return;
      }

      // Extract text content from the user message
      const extractText = (msg: any): string => {
        if (typeof msg.content === "string") {
          return msg.content;
        }
        if (Array.isArray(msg.content)) {
          return msg.content
            .map((part: any) =>
              typeof part === "string" ? part : (part?.text ?? "")
            )
            .join("");
        }
        if (Array.isArray(msg.parts)) {
          return msg.parts
            .filter((part: any) => part?.type === "text")
            .map((part: any) => part.text ?? "")
            .join("");
        }
        return "";
      };

      const textToRetry = extractText(previousUserMessage);
      if (!textToRetry) {
        console.warn(
          "[Chatbot Retry] Could not extract text from user message",
          previousUserMessage
        );
        // Mark as processed even if we can't retry
        processedMessagesRef.current.add(processingKey);
        return;
      }

      // Track retries by message content (more reliable than ID)
      const contentHash = textToRetry.slice(0, 100); // Use first 100 chars as hash
      const currentRetries = retryAttemptsRef.current.get(contentHash) || 0;

      // Only retry if we haven't exceeded 3 attempts
      if (currentRetries < 3) {
        const newRetryCount = currentRetries + 1;
        retryAttemptsRef.current.set(contentHash, newRetryCount);
        console.log(
          `[Chatbot Retry] Will retry message in 30 seconds (attempt ${newRetryCount}/3):`,
          `${textToRetry.slice(0, 50)}...`
        );

        // Mark as processed before modifying messages to avoid race conditions
        processedMessagesRef.current.add(processingKey);

        // Remove both the failed assistant message AND the previous user message
        // This prevents duplicate user messages when retrying
        setMessages((prev) => {
          const filtered = prev.filter((msg: any, index: number) => {
            // Remove the last assistant message (the failed one)
            if (index === prev.length - 1 && msg.role === "assistant") {
              return false;
            }
            // Remove the previous user message that we're retrying
            if (index === previousUserMessageIndex && msg.role === "user") {
              return false;
            }
            // Also filter out any assistant messages with unknown finishReason
            if (
              msg.role === "assistant" &&
              msg.metadata?.finishReason === "unknown"
            ) {
              return false;
            }
            return true;
          });
          console.log(
            "[Chatbot Retry] Removed failed assistant and user message, messages count:",
            prev.length,
            "->",
            filtered.length
          );
          return filtered;
        });

        // Resend the previous user message after 30 second delay
        setTimeout(() => {
          queueMessage(textToRetry);
        }, 30_000); // 30 seconds = 30000 milliseconds
      } else {
        console.warn(
          "[Chatbot Retry] Max retry attempts (3) reached for message:",
          `${textToRetry.slice(0, 50)}...`
        );
        // Mark as processed even if we've reached max retries
        processedMessagesRef.current.add(processingKey);
      }
    }
  }, [messages, status, queueMessage, setMessages]);

  // Filter out assistant messages with unknown finishReason from display
  const filteredMessages = useMemo(() => {
    return messages.filter((msg: any) => {
      // Don't filter out messages without metadata (they might be in progress)
      if (!msg.metadata) {
        return true;
      }
      // Filter out assistant messages with unknown finishReason
      if (msg.role === "assistant" && msg.metadata.finishReason === "unknown") {
        return false;
      }
      return true;
    });
  }, [messages]);

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
      isInputFocused,
      setIsInputFocused,
      messages: filteredMessages as any[],
      sendMessage,
      status,
      queuedMessages,
      queueMessage,
      removeQueuedMessage,
      addMessage,
      conversationState,
      setConversationState,
      scrollToBottomRef,
    }),
    [
      isTipboxVisible,
      isOpen,
      input,
      error,
      showFirstTimeTooltip,
      isInputFocused,
      filteredMessages,
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
