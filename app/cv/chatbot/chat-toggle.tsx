"use client";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useContext } from "react";
import { createPortal } from "react-dom";
import { ChatboxContext } from "./provider";

export function ChatToggle() {
  const { isOpen, setIsOpen, setShowFirstTimeTooltip } =
    useContext(ChatboxContext);

  const showChatbox = () => {
    setIsOpen(true);
    setShowFirstTimeTooltip(false);
  };
  const hideChatbox = () => {
    setIsOpen(false);
  };

  const content = (
    <>
      <style global jsx>{`
        :root {
          --chat-toggle-size: 3rem;
          --chat-toggle-bottom: calc((var(--spacing) * 5) + var(--sa-bottom));
        }
      `}</style>
      <button
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="fixed z-120 w-[var(--chat-toggle-size)] h-[var(--chat-toggle-size)] xs:-translate-y-3 rounded-full bg-mint-600 backdrop-blur-sm shadow-lg cursor-pointer transition-all scale-100 hover:scale-105 right-5 bottom-[var(--chat-toggle-bottom)]"
        onClick={isOpen ? hideChatbox : showChatbox}
        type="button"
      >
        <div className="absolute top-0 right-0 h-full w-[150%] overflow-hidden rounded-r-full">
          <div className="absolute right-0 aspect-square h-full min-h-full">
            <Image
              alt="Chat with Yoshi"
              className={`${isOpen ? "translate-x-[100%] scale-0" : "-translate-x-[10px] scale-96"} absolute top-0.5 left-0 h-full w-full transform transition-transform duration-500 ease-out`}
              height={24}
              src="/images/cv-yoyo.svg"
              width={24}
            />
          </div>
        </div>
        <div className="absolute top-0 right-0 flex h-full w-full items-center justify-center overflow-hidden rounded text-white">
          <FontAwesomeIcon
            className={`transform text-2xl text-white transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-[100%] scale-0"}`}
            icon={faXmark}
          />
        </div>
      </button>
    </>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(content, document.body);
}
