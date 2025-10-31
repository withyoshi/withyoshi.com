"use client";

import { useMemo } from "react";

export type Tips = {
  free: Array<{ key: string; value: string }>;
  pro: Array<{ key: string; value: string }>;
  vip: Array<{ key: string; value: string }>;
};

const tipsDataset: Record<string, string[]> = {
  free: ["Have you worked with AI?", "Where do you live?"],
  pro: ["How old are you?", "What is your MBTI? "],
  vip: [
    "When is your birthday?",
    "Remote or hybrid?",
    "What are your hobbies?",
  ],
};

export function useTips(): Tips {
  return useMemo(() => {
    const result = Object.keys(tipsDataset).reduce((acc, category) => {
      const values = tipsDataset[category];
      const items = values.map((value, index) => ({
        key: `${category}-${index + 1}`,
        value,
      }));
      acc[category as keyof Tips] = items;
      return acc;
    }, {} as Tips);
    return result;
  }, []);
}
