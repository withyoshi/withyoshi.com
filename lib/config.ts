// Configuration for different domains
export type SiteConfig = {
  domain: string;
  name: string;
  title: string;
  description: string;
  theme: "yoshi" | "yansern";
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    openGraph: {
      title: string;
      description: string;
      images: string[];
    };
  };
};

const titleNewEra = "YOSHI - A New Era Begins";
const titleNewIdentity = "YOSHI - My New Digital Identity";

const description =
  "Transcend into the Yoshiverse - a playground for creativity and coding exploration.";

const keywords = [
  "Yoshi",
  "Personal Website",
  "Digital Identity",
  "Personal Branding",
  "Creative Exploration",
  "Coding Adventures",
];

const siteConfigs: Record<string, SiteConfig> = {
  "withyoshi.com": {
    domain: "withyoshi.com",
    name: "With Yoshi",
    title: titleNewEra,
    description,
    theme: "yoshi",
    metadata: {
      title: titleNewEra,
      description,
      keywords: ["Yoshi Nakamoto", ...keywords],
      openGraph: {
        title: titleNewEra,
        description,
        images: ["/meta/root/og-image-yoshi.jpg"],
      },
    },
  },
  "yan.sr": {
    domain: "yan.sr",
    name: "Yan Sern",
    title: titleNewIdentity,
    description,
    theme: "yansern",
    metadata: {
      title: titleNewIdentity,
      description,
      keywords: ["Yan Sern", ...keywords],
      openGraph: {
        title: titleNewIdentity,
        description,
        images: ["/meta/root/og-image-yansern.jpg"],
      },
    },
  },
};

// Get current site configuration based on domain
export function getSiteConfig(): SiteConfig {
  const domain =
    process.env.NEXT_PUBLIC_SITE_DOMAIN ||
    (typeof window !== "undefined"
      ? window.location.hostname
      : "withyoshi.com");

  return siteConfigs[domain] || siteConfigs["withyoshi.com"];
}

// Get site config for server-side rendering
export function getServerSiteConfig(hostname?: string): SiteConfig {
  const domain =
    hostname || process.env.NEXT_PUBLIC_SITE_DOMAIN || "withyoshi.com";
  return siteConfigs[domain] || siteConfigs["withyoshi.com"];
}
