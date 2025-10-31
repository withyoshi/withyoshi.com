"use client";

import { ChatToggle } from "./chatbot/chat-toggle";
import { ChatTooltip } from "./chatbot/chat-tooltip";
import { ChatWindow } from "./chatbot/chat-window";
import { ChatboxProvider } from "./chatbot/provider";

export default function Chatbot() {
  return (
    <ChatboxProvider>
      <ChatWindow />
      <ChatToggle />
      <ChatTooltip />
    </ChatboxProvider>
  );
}
