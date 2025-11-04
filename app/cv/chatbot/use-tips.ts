"use client";

import { useMemo } from "react";

// biome-ignore format: keep multiline for readability
const tipsDataset: Record<string, string[]> = {
  free: [
    "Where does he live?",
    "How is this chatbot built?",
    "What has he worked on?",
    "What projects has he built?",
    "What technologies does he use?",
    "What programming languages does he know?",
    "What open source projects has he contributed?",
    "Does he work remotely?",
  ],
  pro: [
    "How old is he?",
    "What's his MBTI?",
    "Does he use AI while coding?",
    "What languages does he speak?",
    "How does he solve problems?",
    "What's his leadership style?",
    "How does he learn technologies?",
    "How does he handle conflicts?",
    "What's his mentoring approach?",
    "Does he prefer remote work?",
    "What's his educational background?",
    "How does he approach debugging?",
    "What's his technology stack evolution?",
    "What are his career transitions?",
    "How does he manage teams?",
    "What's his decision-making process?",
    "How does he give feedback?"
  ],
  vip: [
    "When's his birthday?",
    "What are his hobbies?",
    "Does he have any pets?",
    "Where did he grow up?",
    "What's his favorite city?",
    "Does he play piano?",
    "What's his zodiac sign?",
    "What's his favorite food?",
    "What's his favorite color?",
    "What's his favorite restaurant?",
    "Does he cook?",
    "What's his favorite movie?",
    "What music does he like?",
    "What's his favorite camera brand?",
    "Does he collect keyboards?"
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
