"use client";

import { faWandMagicSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useMemo, useState } from "react";
import { ChatboxContext } from "./provider";
import { ProBadge, VipBadge } from "./tip-badges";
import { TipPill } from "./tip-pill";
import { useTips } from "./use-tips";

type TipboxProps = {
  onTipSelect: (tip: string) => void;
};

export function Tipbox({ onTipSelect }: TipboxProps) {
  const [hasSeenProVipInfo, setHasSeenProVipInfo] = useState(false);
  const [usedTipKeys, setUsedTipKeys] = useState<Set<string>>(new Set());
  const tips = useTips();
  const chatbox = useContext(ChatboxContext);
  const { setTipboxVisible } = chatbox;

  const handleShowProVipInfo = () => {
    setHasSeenProVipInfo(true);
    onTipSelect("What's PRO & VIP?");
    setTipboxVisible(false);
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
    onTipSelect(tip.value);
    setTipboxVisible(false);
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
      <div className="flex flex-wrap gap-2">
        {displayedTips.map((tip) => (
          <TipPill key={tip.key} onClick={() => handleTipClick(tip)}>
            <span>{tip.value}</span>
            {tip.category === "pro" && <ProBadge />}
            {tip.category === "vip" && <VipBadge />}
          </TipPill>
        ))}
      </div>
      {displayedTips.length > 0 && (
        <div className="flex items-center gap-2">
          {!hasSeenProVipInfo && (
            <TipPill onClick={handleShowProVipInfo}>
              <span>What is</span>
              <ProBadge />
              <span>and</span>
              <VipBadge />
              <span>?</span>
            </TipPill>
          )}
          <TipPill onClick={handleShowMore}>
            <span>Show More...</span>
            <FontAwesomeIcon icon={faWandMagicSparkles} />
          </TipPill>
        </div>
      )}
    </div>
  );
}
