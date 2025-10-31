"use client";

import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChatboxContext } from "./provider";
import { ProBadge, VipBadge } from "./tip-badges";
import { TipPill } from "./tip-pill";
import { useTips } from "./use-tips";

export function Tipbox() {
  const [hasSeenProVipInfo, setHasSeenProVipInfo] = useState(false);
  const [usedTipKeys, setUsedTipKeys] = useState<Set<string>>(new Set());
  const [animationKey, setAnimationKey] = useState(0);
  const prevIsOpenRef = useRef(false);
  const tips = useTips();
  const { setError, addMessage, isOpen } = useContext(ChatboxContext);

  // Replay animations when chatbox opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setAnimationKey((prev) => prev + 1);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  const handleShowProVipInfo = () => {
    setHasSeenProVipInfo(true);
    setError(null);
    addMessage("What is PRO & VIP?");
    // setTipboxVisible(false);
  };

  const displayedTips = useMemo(() => {
    const order = Object.keys(tips) as Array<keyof typeof tips>;
    type TipView = { key: string; value: string; category: keyof typeof tips };
    const result: TipView[] = [];
    const takePerCategory = 2;

    for (const c of order) {
      const arr = tips[c];
      if (!arr || arr.length === 0) {
        continue;
      }
      const unused = arr.filter((t) => !usedTipKeys.has(t.key));
      const used = arr.filter((t) => usedTipKeys.has(t.key));
      const chosen = [...unused, ...used].slice(0, takePerCategory);
      for (const t of chosen) {
        result.push({ key: t.key, value: t.value, category: c });
      }
    }
    return result;
  }, [tips, usedTipKeys]);

  // Parent handles scrolling on visibility changes; no external side-effects here

  const handleTipClick = (tip: { key: string; value: string }) => {
    setUsedTipKeys((prev) => new Set(prev).add(tip.key));
    setError(null);
    addMessage(tip.value);
    // setTipboxVisible(false);
  };

  const handleShowMore = () => {
    setUsedTipKeys((prev) => {
      const next = new Set(prev);
      for (const t of displayedTips) {
        next.add(t.key);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap justify-end gap-2" key={animationKey}>
        <AnimatePresence mode="popLayout">
          {displayedTips.map((tip, index) => (
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              initial={{ scale: 0, opacity: 0 }}
              key={tip.key}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: index * 0.05,
              }}
            >
              <TipPill onClick={() => handleTipClick(tip)}>
                <span>{tip.value}</span>
                {tip.category === "pro" && <ProBadge />}
                {tip.category === "vip" && <VipBadge />}
              </TipPill>
            </motion.div>
          ))}
          {!hasSeenProVipInfo && (
            <motion.div
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              initial={{ scale: 0, opacity: 0 }}
              key="pro-vip-info"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: displayedTips.length * 0.05,
              }}
            >
              <TipPill onClick={handleShowProVipInfo}>
                <span>What is</span>
                <ProBadge />
                <span>and</span>
                <VipBadge />
                <span>?</span>
              </TipPill>
            </motion.div>
          )}
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            initial={{ scale: 0, opacity: 0 }}
            key="show-more"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay:
                (displayedTips.length + (hasSeenProVipInfo ? 0 : 1)) * 0.05,
            }}
          >
            <TipPill onClick={handleShowMore}>
              <span>Show More...</span>
              <FontAwesomeIcon icon={faWandMagicSparkles} />
            </TipPill>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
