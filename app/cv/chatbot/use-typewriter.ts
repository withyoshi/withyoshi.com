"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook that creates a typewriter effect by revealing words progressively
 * @param text - The full text to type out
 * @param wordsPerChunk - Number of words to reveal at a time (default: 2)
 * @param delay - Delay between chunks in milliseconds (default: 50)
 * @param enabled - Whether the typewriter effect is enabled (default: true)
 * @param key - Optional key to reset the typewriter (e.g., message ID)
 * @returns The currently displayed text
 */
export function useTypewriter(
  text: string,
  wordsPerChunk: number = 2,
  delay: number = 50,
  enabled: boolean = true,
  key?: string
): string {
  const [displayedText, setDisplayedText] = useState("");
  const previousKeyRef = useRef<string | undefined>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetWordCountRef = useRef(0);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text);
      return;
    }

    // Reset when key changes (new message)
    const isNewMessage = key !== undefined && key !== previousKeyRef.current;
    if (isNewMessage) {
      setDisplayedText("");
      targetWordCountRef.current = 0;
      previousKeyRef.current = key;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Split text into words (using regex to capture word boundaries)
    const words = text.match(/\S+\s*/g) || [];
    const totalWords = words.length;

    // If we've already displayed all words, just show the full text
    if (targetWordCountRef.current >= totalWords) {
      setDisplayedText(text);
      return;
    }

    // Continue from where we left off
    const startIndex = targetWordCountRef.current;
    const remainingWords = words.slice(startIndex);

    if (remainingWords.length === 0) {
      setDisplayedText(text);
      return;
    }

    // Group remaining words into chunks
    const wordChunks: string[] = [];
    for (let i = 0; i < remainingWords.length; i += wordsPerChunk) {
      wordChunks.push(remainingWords.slice(i, i + wordsPerChunk).join(""));
    }

    let currentChunkIndex = 0;

    intervalRef.current = setInterval(() => {
      if (currentChunkIndex < wordChunks.length) {
        const wordsToShow = startIndex + (currentChunkIndex + 1) * wordsPerChunk;
        const actualWordsToShow = Math.min(wordsToShow, totalWords);
        const newDisplayedText = words.slice(0, actualWordsToShow).join("");
        setDisplayedText(newDisplayedText);
        targetWordCountRef.current = actualWordsToShow;
        currentChunkIndex++;
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        // Ensure full text is displayed at the end
        setDisplayedText(text);
        targetWordCountRef.current = totalWords;
      }
    }, delay);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, wordsPerChunk, delay, enabled, key]);

  return displayedText;
}
