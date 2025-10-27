import type { Metadata, Viewport } from "next";
import type React from "react";
import { PhoneModalProvider } from "./contexts/phone-modal-context";

// CV page constants for reusability
const title = "Yan Sern's Resume";
const description =
  "Full-stack software engineer with 20+ years of experience spanning product development, AI integration, systems scaling, and data engineering.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yan.sr/cv",
    siteName: "Yan Sern",
    title,
    description,
    images: [
      {
        url: "/meta/cv/og-image-yansern-cv.jpg",
        width: 1200,
        height: 630,
        alt: "Yan Sern - Full-Stack Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/meta/cv/og-image-yansern-cv.jpg"],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/meta/cv/favicon.ico", sizes: "any" },
      { url: "/meta/cv/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/meta/cv/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      {
        url: "/meta/cv/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/meta/cv/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [{ url: "/meta/cv/apple-touch-icon.png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/meta/cv/safari-pinned-tab.svg",
        color: "#059669",
      },
    ],
  },
  manifest: "/meta/cv/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#059669", // mint-600
};

export default function CVLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PhoneModalProvider>
      <section className="min-h-screen bg-gray-100">
        <main className="container mx-auto max-w-screen-xl overflow-hidden sm:p-8">
          {children}
        </main>
      </section>
    </PhoneModalProvider>
  );
}
