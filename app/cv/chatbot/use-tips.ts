"use client";

import { useMemo } from "react";

const tipsDataset: Record<string, string[]> = {
  free: ["Have you worked with AI?", "Where do you live?", "X", "Y", "Z"],
  pro: ["How old are you?", "What is your MBTI?", "D", "E", "F"],
  vip: [
    "When is your birthday?",
    "Remote or hybrid?",
    "What are your hobbies?",
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
