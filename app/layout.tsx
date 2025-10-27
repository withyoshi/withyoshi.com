import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "../lib/analytics/google-analytics";
import MicrosoftClarity from "../lib/analytics/microsoft-clarity";
import { getServerSiteConfig } from "../lib/config";
import { ibmPlexMono, ibmPlexSans, lexend } from "../lib/fonts";

// Dynamic metadata based on site configuration
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = getServerSiteConfig();

  return {
    title: {
      default: siteConfig.metadata.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.metadata.description,
    keywords: siteConfig.metadata.keywords,
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    metadataBase: new URL(`https://${siteConfig.domain}`),
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `https://${siteConfig.domain}`,
      siteName: siteConfig.name,
      title: siteConfig.metadata.openGraph.title,
      description: siteConfig.metadata.openGraph.description,
      images: siteConfig.metadata.openGraph.images.map((url) => ({
        url,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name}`,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: siteConfig.metadata.openGraph.title,
      description: siteConfig.metadata.openGraph.description,
      images: siteConfig.metadata.openGraph.images,
      creator: `@${siteConfig.name.toLowerCase()}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [
        { url: "/meta/root/favicon.ico", sizes: "any" },
        {
          url: "/meta/root/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: "/meta/root/favicon-16x16.png",
          sizes: "16x16",
          type: "image/png",
        },
        {
          url: "/meta/root/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          url: "/meta/root/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      apple: [{ url: "/meta/root/apple-touch-icon.png", sizes: "180x180" }],
      other: [
        {
          rel: "mask-icon",
          url: "/meta/root/safari-pinned-tab.svg",
          color: "#0d9488",
        },
      ],
    },
    manifest: "/meta/root/site.webmanifest",
  };
}

// Viewport configuration
export const viewport: Viewport = {
  themeColor: "#0d9488", // teal-600
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${lexend.variable} font-sans text-gray-600 antialiased`}
      >
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics />
        <MicrosoftClarity />
        {children}
      </body>
    </html>
  );
}
