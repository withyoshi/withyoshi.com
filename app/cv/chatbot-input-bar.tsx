"use client";

import { Send } from "lucide-react";
import { forwardRef, useImperativeHandle, useRef } from "react";

type ChatbotInputBarProps = {
  input: string;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export type ChatbotInputBarHandle = {
  focus: () => void;
};

export const ChatbotInputBar = forwardRef<
  ChatbotInputBarHandle,
  ChatbotInputBarProps
>((props, ref) => {
  const { input, isLoading, onSubmit, onChange } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  return (
    <div className="absolute bottom-0 z-40 w-full p-4" id="chatbot-input-bar">
      <form
        className="relative z-20 rounded-2xl border-1 border-white/75 px-4 py-4 shadow-sm backdrop-blur-lg"
        onSubmit={onSubmit}
      >
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-sm border border-gray-400/50 bg-white/75 px-3 py-2 text-gray-900 text-sm placeholder-gray-400 outline-none transition-all focus:border-mint-400 focus:bg-white/100 focus:ring-2 focus:ring-mint-400/40"
            onChange={onChange}
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
  );
});
