"use client";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useContext } from "react";
import { ChatboxContext } from "./provider";

type ChatToggleProps = {
  className?: string;
};

export function ChatToggle(props: ChatToggleProps) {
  const { className } = props;

  const { isOpen, setIsOpen, setShowFirstTimeTooltip } =
    useContext(ChatboxContext);

  const showChatbox = () => {
    setIsOpen(true);
    setShowFirstTimeTooltip(false);
  };
  const hideChatbox = () => {
    setIsOpen(false);
  };

  return (
    <button
      aria-label={isOpen ? "Close chat" : "Open chat"}
      className={
        "fixed right-2 xs:right-6 bottom-2 xs:bottom-6 z-30 h-12 w-12 scale-100 cursor-pointer rounded-full bg-mint-600 shadow-lg backdrop-blur-sm transition-all hover:scale-105"
      }
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
  );
}
