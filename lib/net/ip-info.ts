import type { NextRequest } from "next/server";
import { redis } from "@/lib/storage/redis";
import { createLogger } from "@/lib/utils/log";

const logger = createLogger("ip-info");

// ============================================================================
// IN-MEMORY CACHE (process lifetime)
// ============================================================================

type MemoryCacheEntry<T> = {
  value: T;
  expiresAt: number;
};

// Simple in-memory cache for hobby plan warm instances (5-10 mins)
const memoryCache = new Map<string, MemoryCacheEntry<IPLocationData>>();
const DEFAULT_MEMORY_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getFromMemoryCache(key: string): IPLocationData | null {
  const entry = memoryCache.get(key);
  if (!entry) {
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

function setInMemoryCache(
  key: string,
  value: IPLocationData,
  ttlMs: number = DEFAULT_MEMORY_TTL_MS
): void {
  memoryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

// ============================================================================
// TYPES
// ============================================================================

export type IPLocationData = {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string; // "lat,lon"
  org: string;
  postal: string;
  timezone: string;
};

// ============================================================================
// PRIVATE IP DETECTION
// ============================================================================

// Private IP ranges for validation
const PRIVATE_IPV4_RANGES = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^0\./,
];

const PRIVATE_IPV6_RANGES = [/^::1$/, /^fe80:/, /^fc00:/, /^fd00:/];

/**
 * Check if an IP address is private/local
 * @param ip - IP address to check
 * @returns boolean indicating if IP is private
 */
function isPrivateIP(ip: string): boolean {
  // Check IPv4 private ranges
  if (PRIVATE_IPV4_RANGES.some((range) => range.test(ip))) {
    return true;
  }

  // Check IPv6 private ranges
  if (PRIVATE_IPV6_RANGES.some((range) => range.test(ip))) {
    return true;
  }

  return false;
}

// ============================================================================
// IP RESOLUTION
// ============================================================================

/**
 * Get client IP address from request
 * @param request - Next.js request object
 * @returns string - Client IP address
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  // Parse x-forwarded-for (can contain multiple IPs)
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    // Find the first non-private IP
    for (const ip of ips) {
      if (!isPrivateIP(ip)) {
        return ip;
      }
    }
    // If all are private, return the first one
    return ips[0] || "127.0.0.1";
  }

  // Check other headers
  if (realIP && !isPrivateIP(realIP)) {
    return realIP;
  }

  if (cfConnectingIP && !isPrivateIP(cfConnectingIP)) {
    return cfConnectingIP;
  }

  // Fallback to connection remote address
  const remoteAddr =
    request.headers.get("x-vercel-forwarded-for") || "127.0.0.1";
  return remoteAddr;
}

/**
 * Get IP location from external API
 * @param ip - IP address
 * @returns Promise<object | null> - Full API response or null if failed
 */
async function getIPLocationFromAPI(
  ip: string
): Promise<IPLocationData | null> {
  const log = logger.child({ routine: "GetIPLocationFromAPI" });

  try {
    // Use configurable API URL from environment variables
    const apiUrl = process.env.IP_LOCATOR_API_URL;

    if (!apiUrl) {
      log.warn(
        {
          ip,
        },
        "IP_LOCATOR_API_URL not configured, cannot get location data"
      );
      return null;
    }

    // Replace {ip} placeholder with actual IP address
    const url = apiUrl.replace(/\{ip\}/g, ip);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LocationService/1.0)",
      },
    });

    if (!response.ok) {
      log.warn(
        {
          ip,
          status: response.status,
          statusText: response.statusText,
        },
        "IP location API failed"
      );
      return null;
    }

    const data = await response.json();
    log.info(
      {
        ip,
        country: data.country,
        city: data.city,
      },
      "IP location retrieved successfully"
    );
    return data;
  } catch (error) {
    log.error(
      {
        ip,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "IP location API error"
    );
    return null;
  }
}

/**
 * Store IP location data in Redis hash
 * @param ip - IP address
 * @param location - Location data
 * @param ttlSeconds - Time to live in seconds (default: 7 days)
 */
export async function setIPLocation(
  ip: string,
  locationData: IPLocationData,
  ttlSeconds: number = 7 * 24 * 60 * 60
): Promise<boolean> {
  const log = logger.child({ routine: "SetIPLocation" });

  try {
    await redis.hset("ip:locations", { [ip]: JSON.stringify(locationData) });
    await redis.expire("ip:locations", ttlSeconds);
    log.debug(locationData, "IP location cached successfully");
    return true;
  } catch (error) {
    log.error(
      {
        ip,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to set IP location"
    );
    return false;
  }
}

/**
 * Get IP location data from Redis hash
 * @param ip - IP address
 * @returns Location data or null if not found
 */
export async function getIPLocation(
  ip: string
): Promise<IPLocationData | null> {
  const log = logger.child({ routine: "GetIPLocation" });

  try {
    // Skip private/local IPs entirely
    if (isPrivateIP(ip)) {
      log.debug({ ip }, "Private IP detected; skipping IP location lookup");
      return null;
    }

    // First, try in-memory cache
    const mem = getFromMemoryCache(ip);
    if (mem) {
      log.debug(mem, "IP location found in memory cache");
      return mem;
    }

    // Cache miss - fetch from API
    log.debug({ ip }, "IP location not in cache, fetching from API");
    const locationData = await getIPLocationFromAPI(ip);

    if (!locationData) {
      log.warn({ ip }, "Failed to get IP location from API");
      return null;
    }

    // Cache the result for future use
    await setIPLocation(ip, locationData);
    setInMemoryCache(ip, locationData);

    log.info(locationData, "IP location fetched from API and cached");
    return locationData;
  } catch (error) {
    log.error(
      {
        ip,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "Failed to get IP location"
    );
    return null;
  }
}
