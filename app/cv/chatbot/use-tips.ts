"use client";

import { useMemo } from "react";

// biome-ignore format: keep multiline for readability
const tipsDataset: Record<string, string[]> = {
  free: [
    "Where does he live?",
    "How is this chatbot built?",
    "What projects has he built?",
    "React or Vue?",
    "JavaScript on TypeScript?",
    "Where has he worked?",
    "Open source contributions?",
  ],
  pro: [
    "How old is he?",
    "What's his MBTI?",
    "Favourite code editor?",
    "Thoughts on AI models?",
    "Favourite AI app?",
    "Remote or Hybrid?",
    "Professional goals?",
    "Most challenging projects?",
  ],
  vip: [
    "When's his birthday?",
    "Coffee or tea?",
    "Any hobbies?",
    "What's his zodiac sign?",
    "Favourite food?",
    "Favourite color?",
    "Favourite restaurant?",
    "Favourite movie?",
    "What music does he like?",
  ],
};

export type TipCategory = keyof typeof tipsDataset;

export type TipItem = {
  key: string;
  value: string;
  category: TipCategory;
  index: number;
};

export type TipsByCategory = Record<TipCategory, TipItem[]>;

export type TipIndexByCategory = Record<TipCategory, number>;

export type UsedTipIndexByCategory = Record<TipCategory, Set<number>>;

export function useTipsByCategory(): TipsByCategory {
  return useMemo(() => {
    const result = {} as TipsByCategory;

    for (const category of Object.keys(tipsDataset) as TipCategory[]) {
      const values = tipsDataset[category];
      result[category] = values.map((value, index) => ({
        key: `${category}-${index}`,
        value,
        category,
        index,
      }));
    }

    return result;
  }, []);
}
