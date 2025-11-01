"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

interface VisualViewportProviderProps {
  children: ReactNode;
}

/**
 * Sets safe area CSS variables
 */
function setSafeAreaVars(): void {
  const root = document.documentElement;
  root.style.setProperty("--sa-top", "env(safe-area-inset-top, 0px)");
  root.style.setProperty("--sa-right", "env(safe-area-inset-right, 0px)");
  root.style.setProperty("--sa-bottom", "env(safe-area-inset-bottom, 0px)");
  root.style.setProperty("--sa-left", "env(safe-area-inset-left, 0px)");
  root.style.setProperty("--sa-x", "calc(var(--sa-left) + var(--sa-right))");
  root.style.setProperty("--sa-y", "calc(var(--sa-top) + var(--sa-bottom))");

  // Set sv (safe viewport) variables = vv + sa using calc()
  root.style.setProperty("--sv-width", "calc(var(--vv-width) + var(--sa-x))");
  root.style.setProperty("--sv-height", "calc(var(--vv-height) + var(--sa-y))");
  root.style.setProperty("--sv-top", "calc(var(--vv-top) + var(--sa-top))");
  root.style.setProperty(
    "--sv-right",
    "calc(var(--vv-right) + var(--sa-right))"
  );
  root.style.setProperty(
    "--sv-bottom",
    "calc(var(--vv-bottom) + var(--sa-bottom))"
  );
  root.style.setProperty("--sv-left", "calc(var(--vv-left) + var(--sa-left))");
}

/**
 * Removes safe area CSS variables
 */
function unsetSafeAreaVars(): void {
  const root = document.documentElement;
  root.style.removeProperty("--sa-top");
  root.style.removeProperty("--sa-right");
  root.style.removeProperty("--sa-bottom");
  root.style.removeProperty("--sa-left");
  root.style.removeProperty("--sa-x");
  root.style.removeProperty("--sa-y");
  root.style.removeProperty("--sv-width");
  root.style.removeProperty("--sv-height");
  root.style.removeProperty("--sv-top");
  root.style.removeProperty("--sv-right");
  root.style.removeProperty("--sv-bottom");
  root.style.removeProperty("--sv-left");
}

/**
 * Updates visual viewport CSS variables
 */
function updateVisualViewportVars(): void {
  if (window.visualViewport) {
    const root = document.documentElement;

    // Set viewport dimensions
    root.style.setProperty("--vv-width", `${window.visualViewport.width}px`);
    root.style.setProperty("--vv-height", `${window.visualViewport.height}px`);

    // Set offset positions
    root.style.setProperty("--vv-top", `${window.visualViewport.offsetTop}px`);
    root.style.setProperty(
      "--vv-left",
      `${window.visualViewport.offsetLeft}px`
    );

    // Calculate keyboard height
    const keyboardHeight = window.innerHeight - window.visualViewport.height;
    root.style.setProperty("--kbd-height", `${keyboardHeight}px`);

    // Calculate bottom offset
    const bottomOffset =
      window.innerHeight -
      window.visualViewport.height -
      window.visualViewport.offsetTop;
    root.style.setProperty("--vv-bottom", `${bottomOffset}px`);

    // Calculate right offset
    const rightOffset =
      window.innerWidth -
      window.visualViewport.width -
      window.visualViewport.offsetLeft;
    root.style.setProperty("--vv-right", `${rightOffset}px`);
  }
}

// Module-level state for managing multiple instances
let viewportRefCount = 0;
let viewportCleanup: (() => void) | null = null;

/**
 * Sets up visual viewport listeners and returns cleanup function
 * Uses reference counting to ensure only one setup/teardown happens
 */
function setupVisualViewportVars(): (() => void) | null {
  if (!window.visualViewport) {
    return null;
  }

  viewportRefCount++;

  // Only set up listeners on first call
  if (viewportRefCount === 1) {
    // Set safe area variables
    setSafeAreaVars();

    window.visualViewport.addEventListener("resize", updateVisualViewportVars);
    window.visualViewport.addEventListener("scroll", updateVisualViewportVars);

    // Initial update
    updateVisualViewportVars();

    // Store cleanup function
    viewportCleanup = () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          updateVisualViewportVars
        );
        window.visualViewport.removeEventListener(
          "scroll",
          updateVisualViewportVars
        );
      }
    };
  }

  // Return cleanup function that decrements counter
  return () => {
    viewportRefCount--;
    if (viewportRefCount === 0 && viewportCleanup) {
      viewportCleanup();
      viewportCleanup = null;
    }
  };
}

/**
 * Forcefully destroys visual viewport event listeners
 * Bypasses reference counting and removes listeners regardless of active instances
 */
function destroyVisualViewportVars(): void {
  if (viewportCleanup) {
    viewportCleanup();
    viewportCleanup = null;
  }
  viewportRefCount = 0;
  // Unset safe area variables
  unsetSafeAreaVars();
}

/**
 * React provider component for visual viewport CSS variables
 *
 * @example
 * ```tsx
 * <VisualViewportProvider>
 *   <App />
 * </VisualViewportProvider>
 * ```
 */
export default function VisualViewportProvider({
  children,
}: VisualViewportProviderProps) {
  useEffect(() => {
    // Only in development
    if (process.env.NODE_ENV === "development") {
      // Force reload CSS on every navigation
      const refreshCSS = () => {
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        for (const link of links) {
          if (link instanceof HTMLLinkElement) {
            const href = link.href.split("?")[0];
            link.href = `${href}?t=${Date.now()}`;
          }
        }
      };
      refreshCSS();
    }
  }, []);

  useEffect(() => {
    const cleanup = setupVisualViewportVars();
    return cleanup || undefined;
  }, []);

  return <>{children}</>;
}

// Export functions for manual use if needed
export {
  setSafeAreaVars,
  unsetSafeAreaVars,
  updateVisualViewportVars,
  setupVisualViewportVars,
  destroyVisualViewportVars,
};
