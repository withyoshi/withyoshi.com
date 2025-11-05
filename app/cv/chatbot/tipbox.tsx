"use client";

import {
  faLightbulb,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChatboxContext } from "./provider";
import { ProBadge, VipBadge } from "./tip-badges";
import { TipPill } from "./tip-pill";
import type { TipCategory, TipItem } from "./use-tips";
import { useTipsByCategory } from "./use-tips";

const ITEMS_PER_CATEGORY = 2;

const buttonAnimation = {
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0, opacity: 0 },
  initial: { scale: 0, opacity: 0 },
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 20,
    layout: {
      duration: 0.3,
    },
  },
} as const;

function createInitialState<T>(
  categories: TipCategory[],
  initialValue: (category: TipCategory) => T
): Record<TipCategory, T> {
  return categories.reduce(
    (acc, category) => {
      acc[category] = initialValue(category);
      return acc;
    },
    {} as Record<TipCategory, T>
  );
}

export function Tipbox() {
  const [hasSeenProVipInfo, setHasSeenProVipInfo] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const prevIsOpenRef = useRef(false);
  const tipsByCategory = useTipsByCategory();
  const { addMessage, isOpen, scrollToBottomRef } = useContext(ChatboxContext);

  const categories = useMemo(
    () => Object.keys(tipsByCategory) as TipCategory[],
    [tipsByCategory]
  );

  // Track used tips
  const [usedTipByIndex, setUsedTipByIndex] = useState<
    Record<TipCategory, Set<number>>
  >(() =>
    createInitialState(
      Object.keys(tipsByCategory) as TipCategory[],
      () => new Set<number>()
    )
  );

  // Track current window start index for each category
  const [windowStartByCategory, setWindowStartByCategory] = useState<
    Record<TipCategory, number>
  >(() =>
    createInitialState(Object.keys(tipsByCategory) as TipCategory[], () => 0)
  );

  // Sync state when categories change (e.g., if tipsByCategory structure changes)
  useEffect(() => {
    const currentCategoryKeys = Object.keys(tipsByCategory) as TipCategory[];
    const stateCategoryKeys = Object.keys(usedTipByIndex) as TipCategory[];

    // Check if categories have changed
    const categoriesChanged =
      currentCategoryKeys.length !== stateCategoryKeys.length ||
      !currentCategoryKeys.every((key) => stateCategoryKeys.includes(key));

    if (categoriesChanged) {
      // Reset state with new categories
      setUsedTipByIndex(
        createInitialState(currentCategoryKeys, () => new Set<number>())
      );
      setWindowStartByCategory(
        createInitialState(currentCategoryKeys, () => 0)
      );
    }
  }, [tipsByCategory, usedTipByIndex]);

  // Replay animations when chatbox opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setAnimationKey((prev) => prev + 1);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  // Compute displayed tips: collect up to MAX_TOTAL_ITEMS unused tips
  // Simplified single-pass approach: try to get 2 from each category, then fill remaining slots
  const displayedTips = useMemo(() => {
    const MAX_TOTAL_ITEMS = categories.length * ITEMS_PER_CATEGORY;
    const result: TipItem[] = [];
    const seen = new Set<string>();
    const categoryCounts = new Map<TipCategory, number>();

    // Helper to check if tip can be added
    const canAdd = (tip: TipItem): boolean => {
      const key = `${tip.category}-${tip.index}`;
      const notSeen = !seen.has(key);
      const notUsed = !usedTipByIndex[tip.category]?.has(tip.index);
      const hasSpace = result.length < MAX_TOTAL_ITEMS;
      return notSeen && notUsed && hasSpace;
    };

    // First pass: try to get ITEMS_PER_CATEGORY from each category
    for (const category of categories) {
      const tips = tipsByCategory[category];
      const used = usedTipByIndex[category];
      const startIndex = windowStartByCategory[category];

      const hasValidData = tips && used && typeof startIndex === "number";
      if (!hasValidData) {
        categoryCounts.set(category, 0);
        continue;
      }

      let count = 0;
      let currentIndex = startIndex;
      const maxIterations = tips.length * 2;

      for (
        let i = 0;
        i < maxIterations &&
        count < ITEMS_PER_CATEGORY &&
        result.length < MAX_TOTAL_ITEMS;
        i++
      ) {
        if (!used.has(currentIndex)) {
          const tip = tips[currentIndex];
          if (canAdd(tip)) {
            result.push(tip);
            seen.add(`${tip.category}-${tip.index}`);
            count++;
          }
        }
        currentIndex = (currentIndex + 1) % tips.length;
      }

      categoryCounts.set(category, count);
    }

    // Second pass: fill remaining slots by continuing from where we left off in each category
    if (result.length < MAX_TOTAL_ITEMS) {
      const categoryInfos = categories.map((category) => ({
        category,
        tips: tipsByCategory[category],
        used: usedTipByIndex[category],
        startIndex: windowStartByCategory[category],
        currentIndex:
          ((windowStartByCategory[category] || 0) +
            (categoryCounts.get(category) || 0)) %
          (tipsByCategory[category]?.length || 1),
      }));

      const maxIterations = MAX_TOTAL_ITEMS * 3; // Safety limit
      for (
        let iter = 0;
        iter < maxIterations && result.length < MAX_TOTAL_ITEMS;
        iter++
      ) {
        let foundAny = false;

        for (const info of categoryInfos) {
          if (result.length >= MAX_TOTAL_ITEMS) {
            break;
          }

          const hasValidInfo = info.tips && info.used;
          if (!hasValidInfo) {
            continue;
          }

          // Skip if category already has enough
          const categoryCount = categoryCounts.get(info.category) || 0;
          if (categoryCount >= ITEMS_PER_CATEGORY) {
            continue;
          }

          // Try to find next unused tip from this category
          const categoryMaxIterations = info.tips.length;
          for (let i = 0; i < categoryMaxIterations; i++) {
            if (!info.used.has(info.currentIndex)) {
              const tip = info.tips[info.currentIndex];
              if (canAdd(tip)) {
                result.push(tip);
                seen.add(`${tip.category}-${tip.index}`);
                categoryCounts.set(
                  info.category,
                  (categoryCounts.get(info.category) || 0) + 1
                );
                foundAny = true;
                info.currentIndex = (info.currentIndex + 1) % info.tips.length;
                break;
              }
            }
            info.currentIndex = (info.currentIndex + 1) % info.tips.length;
          }
        }

        if (!foundAny) {
          break; // No more tips available
        }
      }
    }

    return result;
  }, [categories, tipsByCategory, windowStartByCategory, usedTipByIndex]);

  // Count total unused items across all categories
  const totalUnusedItems = useMemo(() => {
    let count = 0;
    for (const category of categories) {
      const tips = tipsByCategory[category];
      const used = usedTipByIndex[category];
      if (tips && used) {
        count += tips.length - used.size;
      }
    }
    return count;
  }, [categories, tipsByCategory, usedTipByIndex]);

  // Check if all tips are used and reset if needed
  useEffect(() => {
    // Skip if no categories
    if (categories.length === 0) {
      return;
    }

    let allUsed = true;

    for (const category of categories) {
      const tips = tipsByCategory[category];
      const used = usedTipByIndex[category];

      // Safety check: skip if category data is missing
      const hasValidData = tips && used;
      if (!hasValidData) {
        allUsed = false;
        break;
      }

      if (used.size < tips.length) {
        allUsed = false;
        break;
      }
    }

    if (allUsed) {
      // Reset everything
      setUsedTipByIndex(
        createInitialState(categories, () => new Set<number>())
      );
      setWindowStartByCategory(createInitialState(categories, () => 0));
    }
  }, [categories, tipsByCategory, usedTipByIndex]);

  const handleTipClick = (tipItem: TipItem) => {
    setUsedTipByIndex((prev) => {
      const categorySet = prev[tipItem.category];
      if (!categorySet) {
        // Category doesn't exist in state, return unchanged
        return prev;
      }
      return {
        ...prev,
        [tipItem.category]: new Set(categorySet).add(tipItem.index),
      };
    });
    addMessage(tipItem.value as string);
  };

  const handleShowMore = () => {
    // Advance window for each category by ITEMS_PER_CATEGORY
    setWindowStartByCategory((prev) => {
      const updated = { ...prev };
      for (const category of categories) {
        const tips = tipsByCategory[category];
        const currentStart = prev[category];

        // Safety check: skip if category data is missing
        if (!tips || typeof currentStart !== "number" || tips.length === 0) {
          continue;
        }

        updated[category] = (currentStart + ITEMS_PER_CATEGORY) % tips.length;
      }
      return updated;
    });
  };

  const handleShowProVipInfo = () => {
    setHasSeenProVipInfo(true);
    addMessage("What is PRO & VIP?");
  };
  const handleTopicIdeas = () => {
    addMessage("Give me a list of topics I can talk about with you?");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap justify-end gap-2" key={animationKey}>
        <AnimatePresence mode="popLayout">
          {displayedTips.map((tipItem, index) => (
            <motion.div
              key={tipItem.key}
              layout
              {...buttonAnimation}
              onUpdate={scrollToBottomRef.current || undefined}
              transition={{
                ...buttonAnimation.transition,
                delay: index * 0.05,
              }}
            >
              <TipPill onClick={() => handleTipClick(tipItem)}>
                <span>{tipItem.value}</span>
                {tipItem.category === "pro" && <ProBadge />}
                {tipItem.category === "vip" && <VipBadge />}
              </TipPill>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <AnimatePresence mode="popLayout">
          {!hasSeenProVipInfo && (
            <motion.div key="pro-vip-info" layout {...buttonAnimation}>
              <TipPill onClick={handleShowProVipInfo}>
                <span>What is</span>
                <ProBadge />
                <span>and</span>
                <VipBadge />
                <span>?</span>
              </TipPill>
            </motion.div>
          )}

          <motion.div key="topic-ideas" layout {...buttonAnimation}>
            <TipPill onClick={handleTopicIdeas}>
              <span>Topic Ideas</span>
              <FontAwesomeIcon icon={faLightbulb} />
            </TipPill>
          </motion.div>

          {totalUnusedItems >= categories.length * ITEMS_PER_CATEGORY && (
            <motion.div key="show-more" layout {...buttonAnimation}>
              <TipPill onClick={handleShowMore}>
                <span>Show More...</span>
                <FontAwesomeIcon icon={faWandMagicSparkles} />
              </TipPill>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
