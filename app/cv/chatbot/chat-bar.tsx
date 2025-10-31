"use client";

import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Send } from "lucide-react";
import { useContext, useEffect, useRef } from "react";
import { ChatboxContext } from "./provider";

type ChatBarProps = {
  input: string;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

export function ChatBar({
  input,
  onSubmit,
  onChange,
  className,
}: ChatBarProps) {
  const { isTipboxVisible, setTipboxVisible, isOpen } =
    useContext(ChatboxContext);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const id = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    setTipboxVisible(false);
    onSubmit(e);
  };

  return (
    <div className={`w-full ${className ?? ""}`}>
      <form
        className="relative z-20 xs:rounded-2xl border-white/75 xs:border-1 border-t-1 bg-white/40 xs:p-4 px-4 pt-3.5 pb-4 shadow-sm backdrop-blur-lg"
        onSubmit={handleSubmit}
      >
        <div className="flex">
          <div className="relative flex flex-1">
            <input
              className="flex-1 rounded-sm border border-gray-400/50 bg-white/75 pr-11 pl-2.5 text-gray-900 text-sm placeholder-gray-400 outline-none transition-all focus:border-mint-400 focus:bg-white/100 focus:ring-2 focus:ring-mint-400/40"
              onChange={onChange}
              placeholder="Ask Yoyo anything..."
              ref={inputRef}
              value={input}
            />
            <button
              aria-label="Send message"
              className="absolute right-0 m-1 flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-[5px] bg-mint-600 text-white transition-all hover:scale-105 disabled:bg-transparent disabled:text-gray-400/50"
              disabled={!input.trim()}
              type="submit"
            >
              <Send className="relative left-[-0.5px] h-4 w-4" />
            </button>
          </div>
          <button
            aria-label="Show tips"
            className={`group relative ml-2 xs:ml-3 flex h-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border pr-3 pl-3.5 transition-all hover:scale-105 ${
              isTipboxVisible
                ? "border-mint-600"
                : "border-gray-400/50 hover:border-mint-600/50"
            }`}
            onClick={() => setTipboxVisible((prev) => !prev)}
            type="button"
          >
            <FontAwesomeIcon
              className={`relative left-[-1px] h-4 w-4 ${
                isTipboxVisible
                  ? "text-mint-600"
                  : "text-gray-400/50 hover:text-mint-600"
              }`}
              icon={faWandMagicSparkles}
            />
          </button>
        </div>
      </form>
    </div>
  );
}
