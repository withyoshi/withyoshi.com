"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, Send, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function CVChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleChatOpen = () => {
    setIsOpen(true);
    setError(null);
    // Focus input when opening chat
    setTimeout(() => focusInput(), 0);
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

    return (
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
        key={message.id}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
            message.role === "user"
              ? "bg-mint-600 text-white"
              : "bg-gray-100 text-gray-900"
          }`}
        >
          {content}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          aria-label="Open chat"
          className="group fixed right-6 bottom-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-mint-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-mint-700 sm:h-16 sm:w-16"
          onClick={handleChatOpen}
          type="button"
        >
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed right-6 bottom-6 z-[60] flex h-[600px] w-[90vw] max-w-[400px] flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl border-gray-200 border-b bg-mint-600 p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-white" />
              <h3 className="font-semibold text-white">Ask about my CV</h3>
            </div>
            <button
              aria-label="Close chat"
              className="rounded-full p-1 text-white hover:bg-mint-700"
              onClick={() => {
                setIsOpen(false);
                setError(null); // Clear errors when closing
              }}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 text-sm">
                <MessageCircle className="mb-2 h-12 w-12 text-gray-300" />
                <p className="mb-1 font-medium">Click to start chatting!</p>
                <p className="text-xs">
                  I'll help you learn about Yan Sern's experience and skills
                </p>
              </div>
            )}

            {messages.map(renderMessage)}

            {error && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-red-50 px-4 py-3 text-sm">
                  <div className="font-medium text-red-800">
                    Error occurred:
                  </div>
                  <div className="mt-1 text-red-700">{error}</div>
                  <button
                    className="mt-2 text-red-600 text-xs hover:text-red-800"
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
                <div className="max-w-[85%] rounded-2xl bg-gray-100 px-4 py-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input - Always show, but with different behavior */}
          <form
            className="border-gray-200 border-t p-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-mint-600 focus:ring-2 focus:ring-mint-600/20"
                  onChange={handleInputChange}
                  placeholder="Ask about experience, skills, projects..."
                  readOnly={isLoading}
                  ref={inputRef}
                  value={input}
                />
                <button
                  aria-label="Send message"
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-mint-600 text-white transition-colors hover:bg-mint-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading || !input.trim()}
                  type="submit"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
