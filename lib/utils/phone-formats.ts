// Phone number formats by country
const phoneFormats: Record<string, string> = {
  US: "+1 (___) ___-____",
  CA: "+1 (___) ___-____", // Same as US
  GB: "+44 (___) ____ ____",
  AU: "+61 (___) ____ ____",
  DE: "+49 (___) ____ ____",
  FR: "+33 (___) ____ ____",
  IT: "+39 (___) ____ ____",
  ES: "+34 (___) ____ ____",
  NL: "+31 (___) ____ ____",
  SE: "+46 (___) ____ ____",
  NO: "+47 (___) ____ ____",
  DK: "+45 (___) ____ ____",
  FI: "+358 (___) ____ ____",
  JP: "+81 (___) ____ ____",
  KR: "+82 (___) ____ ____",
  CN: "+86 (___) ____ ____",
  IN: "+91 (___) ____ ____",
  BR: "+55 (___) ____ ____",
  MX: "+52 (___) ____ ____",
  AR: "+54 (___) ____ ____",
  CL: "+56 (___) ____ ____",
  CO: "+57 (___) ____ ____",
  PE: "+51 (___) ____ ____",
  ZA: "+27 (___) ____ ____",
  NG: "+234 (___) ____ ____",
  EG: "+20 (___) ____ ____",
  KE: "+254 (___) ____ ____",
  MA: "+212 (___) ____ ____",
  RU: "+7 (___) ____ ____",
  TR: "+90 (___) ____ ____",
  IL: "+972 (___) ____ ____",
  AE: "+971 (___) ____ ____",
  SA: "+966 (___) ____ ____",
  TH: "+66 (___) ____ ____",
  SG: "+65 (___) ____ ____",
  MY: "+60 (___) ____ ____",
  ID: "+62 (___) ____ ____",
  PH: "+63 (___) ____ ____",
  VN: "+84 (___) ____ ____",
  // Default fallback
  DEFAULT: "+XX (___) ____ ____",
};

// Cache for country detection to avoid repeated API calls
let cachedCountry: string | null = null;
let countryDetectionPromise: Promise<string> | null = null;

/**
 * Detects the user's country using IP geolocation
 * Uses caching to avoid repeated API calls
 */
export async function getUserCountry(): Promise<string> {
  // Return cached result if available
  if (cachedCountry) {
    return cachedCountry;
  }

  // Return existing promise if detection is in progress
  if (countryDetectionPromise) {
    return countryDetectionPromise;
  }

  // Start new detection
  countryDetectionPromise = detectCountryFromIP();

  try {
    cachedCountry = await countryDetectionPromise;
    return cachedCountry;
  } catch (_error) {
    return "DEFAULT";
  } finally {
    countryDetectionPromise = null;
  }
}

/**
 * Internal function to detect country from IP
 */
async function detectCountryFromIP(): Promise<string> {
  try {
    // Using ipinfo.io - free tier allows 50,000 requests/month
    const response = await fetch("https://ipinfo.io/json", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.country || "DEFAULT";
  } catch (_error) {
    return "DEFAULT";
  }
}

/**
 * Gets the appropriate phone number placeholder for the user's country
 */
export async function getPhonePlaceholder(): Promise<string> {
  try {
    const country = await getUserCountry();
    return phoneFormats[country] || phoneFormats.DEFAULT;
  } catch (_error) {
    return phoneFormats.DEFAULT;
  }
}

/**
 * Gets phone placeholder synchronously (returns default if not cached)
 * Useful for initial render before async detection completes
 */
export function getPhonePlaceholderSync(): string {
  if (cachedCountry && phoneFormats[cachedCountry]) {
    return phoneFormats[cachedCountry];
  }
  return phoneFormats.DEFAULT;
}
