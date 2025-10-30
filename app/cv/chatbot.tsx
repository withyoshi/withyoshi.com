"use client";

import { useChat } from "@ai-sdk/react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultChatTransport } from "ai";
import { Send } from "lucide-react";
import Image from "next/image";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";

export default function CVChatbot() {
  const filterIdRef = useRef<string>(
    `cv-liquid-glass-${Math.random().toString(36).slice(2)}`
  );
  const _filterId = filterIdRef.current;
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [_showFirstTimeBubble, setShowFirstTimeBubble] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const _customTrackRef = useRef<HTMLDivElement>(null);
  const [_scrollMetrics, _setScrollMetrics] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    trackHeight: 0,
  });
  const [_isDragging, _setIsDragging] = useState(false);
  const _dragOffsetRef = useRef(0);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/cv/chatbot",
    }),
    onError: (chatError) => {
      console.error(chatError);
      setError(chatError.message || "An error occurred while chatting");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Track which messages have already been rendered to gate enter animations
  const seenMessageIdsRef = useRef<Set<string>>(new Set());

  // Focus input helper function
  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Check if this is the first time visiting and show bubble
  useEffect(() => {
    const hasSeenBubble = localStorage.getItem("cv-chatbot-bubble-seen");
    if (hasSeenBubble) {
      setShowFirstTimeBubble(true);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const el = messageListRef.current;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    }
    // Mark current messages as seen after they render once
    for (const m of messages) {
      if (m?.id) {
        seenMessageIdsRef.current.add(m.id as string);
      }
    }
    // Keep input focused after updates
    if (isOpen) {
      focusInput();
    }
  }, [messages, isOpen, focusInput]);

  // Debug: Monitor message metadata for performance and token usage
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages.at(-1);
      if (lastMessage?.metadata) {
        console.log(lastMessage.metadata);
      }
    }
  }, [messages]);

  // Spacer at end of list to keep last message visible above the input bar
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const inputBarEl = document.getElementById(
      "chatbot-input-bar"
    ) as HTMLElement | null;
    const spacerEl = messagesEndRef.current;

    if (!spacerEl) {
      return;
    }

    const applySpacer = () => {
      const height = inputBarEl
        ? Math.round(inputBarEl.getBoundingClientRect().height)
        : 0;
      spacerEl.style.height = `${Math.max(0, height)}px`;
    };

    applySpacer();
    const onResize = () => applySpacer();
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => applySpacer());
    if (inputBarEl) {
      ro.observe(inputBarEl);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      // Clear any previous errors
      setError(null);

      // Send message to chatbot
      sendMessage({ text: input });

      // Clear input
      setInput("");

      // Refocus input
      focusInput();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
  };

  const handleChatToggle = () => {
    setIsOpen((prev) => !prev);
    setError(null);
    setShowFirstTimeBubble(false);
    localStorage.setItem("cv-chatbot-bubble-seen", "true");
    setTimeout(() => focusInput(), 0);
  };

  const _handleBubbleDismiss = () => {
    setShowFirstTimeBubble(false);
    localStorage.setItem("cv-chatbot-bubble-seen", "true");
  };

  // Message renderer component
  const renderMessage = (message: any) => {
    const content =
      message.parts
        ?.filter((part: any) => part.type === "text")
        .map((part: any) => part.text)
        .join("") ||
      message.content ||
      "";

    const isNew = !seenMessageIdsRef.current.has(message.id);

    return content ? (
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
        key={message.id}
      >
        <div
          className={`chatbot-message-item relative z-20 max-w-[85%] ${
            isNew
              ? "animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out"
              : ""
          }`}
        >
          <div
            className={`relative z-20 rounded-2xl text-sm shadow-sm backdrop-contrast-125 ${
              message.role === "user"
                ? "bg-mint-600/90 text-white"
                : "bg-white/50"
            }`}
          >
            <div
              className={`flex gap-1 px-4 py-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`flex flex-1 flex-col ${message.role === "user" ? "text-left" : "text-left"}`}
              >
                <div className="flex items-center gap-1">
                  <span className="font-semibold">
                    {message.role === "user" ? "Mystery Visitor" : "Yoyo"}
                  </span>
                  {message.role === "assistant" && (
                    <span>
                      <Image
                        alt="Chat with Yoshi"
                        className="h-4 w-4"
                        height={24}
                        src="/images/cv-yoyo.svg"
                        width={24}
                      />
                    </span>
                  )}
                </div>
                <div>{content}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : null;
  };

  return (
    <>
      {/* Chat Window */}

      <div className="fixed right-0 bottom-0 z-[60] flex h-auto max-h-screen min-h-0 w-[90vw] max-w-[440px] flex-col px-6 py-8">
        {/* Messages Container */}
        <div
          className={`relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl shadow-mint-500/50 shadow-xl backdrop-blur-sm backdrop-brightness-90 backdrop-contrast-75 transition-all duration-500 ease-out ${
            isOpen
              ? "max-h-[75vh] translate-y-0 opacity-100 sm:max-h-[60vh]"
              : "pointer-events-none max-h-0 translate-y-2 opacity-0"
          }`}
          ref={messageContainerRef}
        >
          <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-[radial-gradient(ellipse_at_top_left,theme(colors.mint.100),transparent)]" />
          <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.gray.100),transparent)]" />
          <div className="mask-linear-135 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-3xl border-2 border-white" />
          <div className="mask-linear-180 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-3xl border-1 border-mint-600/50" />
          <div className="mask-linear mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-3xl border-1 border-gray-400/50" />

          {/* Message List */}
          <div
            className="no-scrollbar relative z-20 max-h-screen space-y-4 overflow-y-auto overscroll-contain px-4 pt-4 sm:max-h-[60vh] [&>*:nth-last-child(2)]:m-0"
            id="chatbot-message-list"
            ref={messageListRef}
          >
            {renderMessage({
              id: "1",
              role: "assistant",
              content: "Hello! I'm Yoyo!",
            })}

            {Array.from({ length: 0 }).map((_, i) => (
              <Fragment key={`intro-${i}`}>
                {renderMessage({
                  id: `assistant-intro-${i}`,
                  role: "assistant",
                  content: "Hello! I'm Yoyo!",
                })}
                {renderMessage({
                  id: `user-intro-${i}`,
                  role: "user",
                  content: "Hello! I'm Yoshi!",
                })}
              </Fragment>
            ))}
            {messages.map(renderMessage)}
            {error && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-4xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm shadow-lg backdrop-blur-sm">
                  <div className="font-medium text-red-800">
                    Error occurred:
                  </div>
                  <div className="mt-1 text-red-700">{error}</div>
                  <button
                    className="mt-2 text-red-600 text-xs transition-colors hover:text-red-800"
                    onClick={() => setError(null)}
                    type="button"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-white/30 bg-white/20 p-2 shadow-lg backdrop-blur-sm">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-mint-400 [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-mint-400 [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-mint-400" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="absolute bottom-0 z-40 w-full p-4"
            id="chatbot-input-bar"
          >
            <form
              className="relative z-20 rounded-2xl border-1 border-white/75 px-4 py-4 shadow-sm backdrop-blur-lg"
              onSubmit={handleSubmit}
            >
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-sm border border-gray-400/50 bg-white/75 px-3 py-2 text-gray-900 text-sm placeholder-gray-400 outline-none transition-all focus:border-mint-400 focus:bg-white/100 focus:ring-2 focus:ring-mint-400/40"
                  onChange={handleInputChange}
                  placeholder="Ask Yoyo anything..."
                  readOnly={isLoading}
                  ref={inputRef}
                  value={input}
                />
                <button
                  aria-label="Send message"
                  className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-mint-600/50 bg-mint-600/80 text-white transition-all hover:scale-105 hover:bg-mint-600/90 disabled:border-gray-400/50 disabled:bg-mint-600/0 disabled:text-gray-400/50"
                  disabled={isLoading || !input.trim()}
                  type="submit"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Floating Chat toggle button */}
        <div
          className="relative flex flex-shrink-0 items-center justify-end pt-4"
          id="chatbot-toggle-bar"
        >
          <button
            aria-label={isOpen ? "Close chat" : "Open chat"}
            className={`relative h-12 w-12 cursor-pointer rounded-full bg-mint-600 shadow-lg backdrop-blur-sm transition-all hover:scale-130 ${isOpen ? "scale-100" : "scale-120"}`}
            onClick={handleChatToggle}
            type="button"
          >
            <div className="absolute top-0 right-0 h-full w-[150%] overflow-hidden rounded-r-full">
              <div className="absolute right-0 aspect-square h-full min-h-full">
                <Image
                  alt="Chat with Yoshi"
                  className={`${isOpen ? "translate-x-[100%] scale-0" : "-translate-x-[12px] scale-96"}  absolute top-0.5 left-0 h-12 h-full w-12 w-full transform transition-transform duration-300 ease-out`}
                  height={24}
                  src="/images/cv-yoyo.svg"
                  width={24}
                />
              </div>
            </div>
            <div className="absolute top-0 right-0 flex h-full w-full items-center justify-center overflow-hidden rounded text-white">
              <FontAwesomeIcon
                className={`text-2xl transform text-white transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-[100%] scale-0"}`}
                icon={faXmark}
              />
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
