"use client";

import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useContext } from "react";
import { createPortal } from "react-dom";
import { ChatboxContext } from "./provider";

export function ChatTooltip() {
  const { setShowFirstTimeTooltip, showFirstTimeTooltip, isOpen } =
    useContext(ChatboxContext);
  const handleClose = () => setShowFirstTimeTooltip(false);
  const { setIsOpen } = useContext(ChatboxContext);
  const handleStart = () => {
    setIsOpen(true);
    setShowFirstTimeTooltip(false);
  };

  const content = (
    <AnimatePresence initial={false}>
      {showFirstTimeTooltip && !isOpen && (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-[var(--chat-tooltip-bottom)] right-12 z-10 max-w-[280px] origin-bottom-right"
          exit={{ opacity: 0, scale: 0 }}
          initial={{ opacity: 0, scale: 0 }}
          key="chat-tooltip"
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <style global jsx>{`
            :root {
              --chat-tooltip-bottom: calc((var(--chat-toggle-size) + var(--chat-toggle-bottom)) * 0.75);
            }
          `}</style>
          <div className="overflow-hidden rounded-2xl shadow-lg shadow-mint-500/50 backdrop-blur-md backdrop-brightness-95 backdrop-contrast-90">
            {/* overlays matching messages container (5 empty children) */}
            <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-[radial-gradient(ellipse_at_top_left,theme(colors.mint.100),transparent)]" />
            <div className="pointer-events-none absolute inset-0 z-10 rounded-2xl bg-[radial-gradient(ellipse_at_bottom_right,theme(colors.gray.100),transparent)]" />
            <div className="mask-linear-135 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-2xl border-2 border-white" />
            <div className="mask-linear-180 mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-2xl border-1 border-mint-600/50" />
            <div className="mask-linear mask-linear-from-0% mask-linear-to-100% pointer-events-none absolute inset-0 z-10 rounded-2xl border-1 border-gray-400/50" />

            <div className="relative z-20 p-4 text-sm">
              <div className="mb-3 text-gray-900">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-semibold text-lg text-mint-600">
                    Ask Yoyo anything!
                  </h5>
                  <button
                    aria-label="Close"
                    className="group flex aspect-square h-5 w-5 cursor-pointer items-center justify-center rounded-full p-2 text-gray-500 transition-all duration-100 hover:bg-mint-600/90 hover:text-white"
                    onClick={handleClose}
                    type="button"
                  >
                    <FontAwesomeIcon
                      className="text-[12px] transition-all duration-100 group-hover:text-[10px]"
                      icon={faXmark}
                    />
                  </button>
                </div>
                <span>
                  Get to know Yan Sern personally through Yoyo, an AI chatbot
                  that knows everything about him.
                </span>
              </div>
              <div className="flex justify-start">
                <button
                  className="cursor-pointer rounded-md border border-mint-600/50 bg-mint-600/90 px-3 py-1.5 font-semibold text-white text-xs transition-colors hover:bg-mint-600"
                  onClick={handleStart}
                  type="button"
                >
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(content, document.body);
}
