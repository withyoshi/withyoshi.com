"use client";

import { motion } from "framer-motion";
import { useContext } from "react";
import { createPortal } from "react-dom";
import { ChatBar } from "./chat-bar";
import { MessageList } from "./message-list";
import { ChatboxContext } from "./provider";

export function ChatWindow() {
  const { isOpen, messages, error } = useContext(ChatboxContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const content = (
    <>
      <style global jsx>{`
        :root {
          --chat-window-bottom: calc(var(--chat-toggle-size) + var(--chat-toggle-bottom));
          --chat-window-max-h: calc(var(--vv-height) - var(--chat-window-bottom));
        }
      `}</style>
      <motion.div
        animate={{
          maxHeight: isOpen ? "var(--chat-window-max-h)" : "0",
        }}
        className="fixed z-100 right-0 flex flex-col w-screen xs:max-w-[480px] min-h-0 bottom-[var(--chat-window-bottom)]"
        initial={false}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="relative m-3 xs:m-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white/10 shadow-mint-500/50 shadow-xl backdrop-blur-sm transition-all duration-500 ease-out">
          <div className="pointer-events-none absolute inset-0 z-10 rounded-3xl bg-[radial-gradient(ellipse_at_top_left,theme(colors.mint.100),transparent)]" />
          <div className="pointer-events-none absolute inset-0 z-0 rounded-3xl bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.mint.100),transparent)]" />

          {/* Message List */}
          <MessageList error={error} messages={messages as any} />

          {/* Input */}
          <ChatBar className="absolute bottom-0 z-40 xs:p-4" />

          <div className="mask-linear-135 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-50 rounded-3xl border-2 border-white" />
          <div className="mask-linear-180 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-50 rounded-3xl border-1 border-mint-600/50" />
          <div className="mask-linear mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-50 rounded-3xl border-1 border-gray-400/50" />
        </div>
      </motion.div>
    </>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(content, document.body);
}
