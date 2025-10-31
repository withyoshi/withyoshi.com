"use client";

// icon imports removed (moved into ChatTooltip)
import { useContext } from "react";
import { ChatToggle } from "./chatbot/chat-toggle";
import { ChatTooltip } from "./chatbot/chat-tooltip";
import { ChatWindow } from "./chatbot/chat-window";
import { ChatboxContext, ChatboxProvider } from "./chatbot/provider";

export default function Chatbot() {
  function Inner() {
    const { isOpen, setIsOpen, setShowFirstTimeTooltip, showFirstTimeTooltip } =
      useContext(ChatboxContext);

    const showChatbox = () => {
      setIsOpen(true);
      setShowFirstTimeTooltip(false);
    };
    const hideChatbox = () => {
      setIsOpen(false);
    };
    return (
      <div className="fixed right-0 bottom-0 z-[60] flex h-auto max-h-screen min-h-0 w-screen xs:max-w-[440px] flex-col p-3 xs:p-6">
        <ChatWindow />
        <div className="relative flex flex-shrink-0 items-center justify-end pt-2 xs:pt-4">
          <ChatToggle
            isOpen={isOpen}
            onClick={isOpen ? hideChatbox : showChatbox}
          />
          {showFirstTimeTooltip && !isOpen && (
            <div className="absolute right-[24px] bottom-[24px] z-[10] max-w-[280px]">
              <ChatTooltip />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ChatboxProvider>
      <Inner />
    </ChatboxProvider>
  );
}
