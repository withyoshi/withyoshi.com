"use client";

import { useContext } from "react";
import { ChatboxContext } from "./provider";

export function ChatDebug() {
  const { conversationState } = useContext(ChatboxContext);

  // Only show in development
  // In Next.js, NODE_ENV is replaced at build time, so this works for client components
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 z-120">
      <pre className="bg-black/80 text-mint-400 text-xs rounded px-3 py-2 z-50 max-w-xs pointer-events-none whitespace-pre-wrap">
        {JSON.stringify(conversationState, null, 2)}
      </pre>
    </div>
  );
}
