"use client";

import { useContext, useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { ChatboxContext } from "./provider";

export function AwardBadge() {
  const { conversationState } = useContext(ChatboxContext);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isComplete, setIsComplete] = useState(true);
  const prevConversationStateRef = useRef(conversationState);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Derive award type from conversationState
  const awardType = conversationState.userStatus;

  const badgeBaseClasses =
    "absolute -translate-x-1/2 -translate-y-1/2 rounded-3xl px-6 py-3 border-t-1 border-t-white border-b-1 border-b-black/50 origin-center font-semibold text-2xl text-white shadow-2xl flex items-center justify-center whitespace-nowrap backface-hidden";

  // Monitor conversationState to detect PRO/VIP status changes
  useEffect(() => {
    const prevState = prevConversationStateRef.current;
    const currentState = conversationState;

    // Check if user just became PRO or VIP, or switched between them
    if (
      (!prevState.userStatus && currentState.userStatus) ||
      (prevState.userStatus &&
        currentState.userStatus &&
        prevState.userStatus !== currentState.userStatus)
    ) {
      setIsComplete(false); // Renders the element
      setTimeout(() => setIsAnimating(true), 50); // Starts the animation
    }

    // Update the ref to the current state
    prevConversationStateRef.current = conversationState;
  }, [conversationState]);

  // Handle animation sequence
  useEffect(() => {
    if (!isAnimating) {
      return;
    }

    const animateTimeout = setTimeout(() => {
      setIsAnimating(false);
    }, 3000);

    const completeTimeout = setTimeout(() => {
      setIsComplete(true);
    }, 10_000);

    return () => {
      clearTimeout(animateTimeout);
      clearTimeout(completeTimeout);
    };
  }, [isAnimating]);

  // Observe container size and window resize
  useEffect(() => {
    if (!awardType) {
      return;
    }
    if (!isAnimating) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setContainerSize({
        width: rect.width,
        height: rect.height,
      });
    };

    // Initial size
    updateSize();

    // Use ResizeObserver to watch for size changes
    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });

    resizeObserver.observe(container);

    // Also listen to window resize events
    window.addEventListener("resize", updateSize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, [awardType, isAnimating]);

  if (!awardType) {
    return null;
  }

  if (isComplete) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none z-20"
      ref={containerRef}
    >
      {/* Confetti Background */}
      <Confetti
        className="absolute inset-0 z-20 overflow-hidden rounded-3xl"
        confettiSource={{
          x: containerSize.width / 2,
          y: containerSize.height / 2 - 45,
          w: 0,
          h: 0,
        }}
        height={containerSize.height}
        numberOfPieces={250}
        recycle={isAnimating}
        width={containerSize.width}
      />
      <div className="absolute z-10 flex items-center justify-center pointer-events-none w-full h-[calc(100%-86px)] xs:h-[calc(100%-91px)]">
        <div
          className={`z-30 relative items-center justify-center transition-all award-badge-container origin-center ease-out duration-[1s] ${
            isAnimating
              ? "rotate-y-[0deg] scale-100"
              : "rotate-y-[-720deg] scale-0"
          }`}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front Side */}
          <div
            className={`${badgeBaseClasses} rotate-y-[0deg] ${
              awardType === "pro"
                ? "bg-gradient-to-r from-mint-600 to-mint-700"
                : "bg-gradient-to-r from-purple-600 to-purple-700"
            }`}
          >
            {awardType === "pro" ? "🏆 PRO" : "👑 VIP"}
          </div>

          {/* Back Side */}
          <div
            className={`${badgeBaseClasses} rotate-y-[180deg] ${
              awardType === "pro"
                ? "bg-gradient-to-r from-mint-600 to-mint-700"
                : "bg-gradient-to-r from-purple-600 to-purple-700"
            }`}
          >
            <span>{awardType === "pro" ? "🏆 PRO" : "👑 VIP"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
