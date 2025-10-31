"use client";

import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Send } from "lucide-react";
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { ChatboxContext } from "./provider";

type ChatBarProps = {
  input: string;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export type ChatBarHandle = {
  focus: () => void;
};

export const ChatBar = forwardRef<ChatBarHandle, ChatBarProps>((props, ref) => {
  const { input, onSubmit, onChange } = props;
  const {
    isTipboxVisible,
    setTipboxVisible,
    isMessageSubmitted,
    isMessageReady,
  } = useContext(ChatboxContext);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  useEffect(() => {
    if (isMessageReady) {
      inputRef.current?.focus();
    }
  }, [isMessageReady]);

  return (
    <div
      className="absolute bottom-0 z-40 w-full p-2 xs:p-4"
      id="chatbot-input-bar"
    >
      <form
        className="relative z-20 rounded-2xl border-1 border-white/75 bg-white/10 p-2 xs:p-4 shadow-sm backdrop-blur-lg"
        onSubmit={onSubmit}
      >
        <div className="flex gap-2">
          <button
            aria-label="Show tips"
            className={`xs:-left-[1px] absolute xs:relative left-[2px] flex h-10 flex-shrink-0 cursor-pointer items-center justify-center xs:rounded-sm xs:border xs:bg-transparent pr-2 xs:pr-3 pl-4 xs:pl-3.5 transition-all hover:scale-105 ${
              isTipboxVisible
                ? "xs:border-mint-600/80 text-mint-600/80"
                : "xs:border-gray-400/50 text-gray-400/50 hover:xs:border-mint-600/50 hover:text-mint-600/60"
            }`}
            onClick={() => setTipboxVisible((prev) => !prev)}
            type="button"
          >
            <FontAwesomeIcon
              className="relative xs:left-[-1px] h-4 w-4"
              icon={faWandMagicSparkles}
            />
          </button>
          <input
            className="flex-1 rounded-sm border border-gray-400/50 bg-white/75 xs:px-3 py-2 pl-8 xs:pl-3 text-gray-900 text-sm placeholder-gray-400 outline-none transition-all focus:border-mint-400 focus:bg-white/100 focus:ring-2 focus:ring-mint-400/40"
            onChange={onChange}
            placeholder="Ask Yoyo anything..."
            readOnly={isMessageSubmitted}
            ref={inputRef}
            value={input}
          />
          <button
            aria-label="Send message"
            className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-mint-600/50 bg-mint-600/80 text-white transition-all hover:scale-105 hover:bg-mint-600/90 disabled:border-gray-400/50 disabled:bg-mint-600/0 disabled:text-gray-400/50"
            disabled={isMessageSubmitted || !input.trim()}
            type="submit"
          >
            <Send className="relative left-[-0.5px] h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
});
