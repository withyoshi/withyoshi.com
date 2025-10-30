"use client";

import { useChat } from "@ai-sdk/react";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChatbotInputBar,
  type ChatbotInputBarHandle,
} from "./chatbot-input-bar";
import { ChatbotMessageList } from "./chatbot-message-list";
import { ChatbotToggleButton } from "./chatbot-toggle-button";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showFirstTimeTooltip, setShowFirstTimeTooltip] = useState(false);
  const inputBarRef = useRef<ChatbotInputBarHandle>(null);
  const previousStatusRef = useRef<string>("");

  const [conversationState, _setConversationState] = useState({
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

  const isLoading = status === "streaming" || status === "submitted";

  // Focus input helper function
  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputBarRef.current?.focus();
    }, 0);
  }, []);

  // Show chatbox and consolidate common logic
  const showChatbox = useCallback(() => {
    setIsOpen(true);
    setError(null);
    setShowFirstTimeTooltip(false);
    focusInput();
  }, [focusInput]);

  // Hide chatbox and consolidate common logic
  const hideChatbox = useCallback(() => {
    setIsOpen(false);
    setError(null);
    setShowFirstTimeTooltip(false);
  }, []);

  // Show tooltip on first load for this session only
  useEffect(() => {
    setShowFirstTimeTooltip(true);
  }, []);

  // Keep input focused after updates
  useEffect(() => {
    if (isOpen) {
      focusInput();
    }
  }, [isOpen, focusInput]);

  // Focus input when status transitions to "ready"
  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    if (previousStatus !== "ready" && status === "ready" && isOpen) {
      focusInput();
    }
    previousStatusRef.current = status;
  }, [status, isOpen, focusInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      setError(null);
      sendMessage({ text: input });
      setInput("");
      focusInput();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
  };

  const handleChatToggle = () => {
    if (isOpen) {
      hideChatbox();
    } else {
      showChatbox();
    }
  };

  const handleTooltipDismiss = () => {
    setShowFirstTimeTooltip(false);
  };

  const handleStartChatFromTooltip = () => {
    showChatbox();
  };

  const FirstTimeTooltip = ({
    onClose,
    onStart,
  }: {
    onClose: () => void;
    onStart: () => void;
  }) => (
    <div className="relative z-10 overflow-hidden rounded-2xl shadow-lg shadow-mint-500/50 backdrop-blur-sm backdrop-brightness-95 backdrop-contrast-90">
      {/* overlays matching messages container (5 empty children) */}
      <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,theme(colors.mint.100),transparent)]" />
      <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.gray.100),transparent)]" />
      <div className="mask-linear-135 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-2xl border-2 border-white" />
      <div className="mask-linear-180 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-2xl border-1 border-mint-600/50" />
      <div className="mask-linear mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-2xl border-1 border-gray-400/50" />

      <div className="relative z-20 p-4 text-sm">
        <div className="mb-3 text-gray-900">
          <div className="flex items-center justify-between gap-2">
            <h5 className="font-semibold text-lg text-mint-600">
              Ask Yoyo anything!
            </h5>
            <button
              aria-label="Close"
              className="group flex aspect-square h-5 w-5 cursor-pointer items-center justify-center rounded-full p-2 text-gray-500 transition-all duration-100 hover:bg-mint-600/90 hover:text-white"
              onClick={onClose}
              type="button"
            >
              <FontAwesomeIcon
                className="text-[12px] transition-all duration-100 group-hover:text-[10px]"
                icon={faXmark}
              />
            </button>
          </div>
          <span>
            Get to know Yan Sern personally through Yoyo, an AI chatbot that
            knows everything about him.
          </span>
        </div>
        <div className="flex justify-start">
          <button
            className="cursor-pointer rounded-md border border-mint-600/50 bg-mint-600/90 px-3 py-1.5 font-semibold text-white text-xs transition-colors hover:bg-mint-600"
            onClick={onStart}
            type="button"
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );

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
        >
          <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-[radial-gradient(ellipse_at_top_left,theme(colors.mint.100),transparent)]" />
          <div className="pointer-events-none absolute inset-0 z-0 rounded-3xl bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.gray.100),transparent)]" />
          <div className="mask-linear-135 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-3xl border-2 border-white" />
          <div className="mask-linear-180 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-3xl border-1 border-mint-600/50" />
          <div className="mask-linear mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-3xl border-1 border-gray-400/50" />

          {/* Message List */}
          <ChatbotMessageList
            conversationState={conversationState}
            error={error}
            isLoading={isLoading}
            messages={messages as any}
          />

          {/* Input */}
          <ChatbotInputBar
            input={input}
            isLoading={isLoading}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            ref={inputBarRef}
          />
        </div>

        {/* Floating Chat toggle button */}
        <div className="relative flex flex-shrink-0 items-center justify-end pt-4">
          <ChatbotToggleButton isOpen={isOpen} onClick={handleChatToggle} />
          {showFirstTimeTooltip && !isOpen && (
            <div className="absolute right-[24px] bottom-[24px] z-[10] max-w-[280px]">
              <FirstTimeTooltip
                onClose={handleTooltipDismiss}
                onStart={handleStartChatFromTooltip}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
