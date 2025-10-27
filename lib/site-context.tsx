"use client";
import { createContext, useContext } from "react";
import { getSiteConfig, type SiteConfig } from "./config";

const SiteContext = createContext<SiteConfig | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const siteConfig = getSiteConfig();

  return (
    <SiteContext.Provider value={siteConfig}>{children}</SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error("useSite must be used within a SiteProvider");
  }
  return context;
}

export function useIsYoshiTheme() {
  const siteConfig = useSite();
  return siteConfig.theme === "yoshi";
}
