import { kv } from "@vercel/kv";
import type { NextRequest } from "next/server";
import { createLogger } from "@/lib/utils/log";

// Create service-specific logger
const logger = createLogger("ip-info");

// ============================================================================
// TYPES
// ============================================================================

export type IPLocationData = {
  ip: string;
  city: string;
  region: string;
  country: string;
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
async function getIPLocationFromAPI(ip: string): Promise<any | null> {
  const log = logger.for("getIPLocationFromAPI");

  try {
    // Use configurable API URL from environment variables
    const apiUrl = process.env.IP_LOCATOR_API_URL;

    if (!apiUrl) {
      log.warn("IP_LOCATOR_API_URL not configured, cannot get location data", {
        ip,
      });
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
      log.warn("IP location API failed", {
        ip,
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = await response.json();
    log.info("IP location retrieved successfully", {
      ip,
      country: data.country,
      city: data.city,
    });
    return data;
  } catch (error) {
    log.error("IP location API error", {
      ip,
      error: error instanceof Error ? error.message : "Unknown error",
    });
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
  ttlSeconds: number = 7 * 24 * 60 * 60 // 7 days
): Promise<boolean> {
  const log = logger.for("setIPLocation");

  try {
    await kv.hset("ip:locations", { [ip]: JSON.stringify(locationData) });

    // Set expiration for the entire hash
    await kv.expire("ip:locations", ttlSeconds);

    log.debug("IP location cached successfully", locationData);

    return true;
  } catch (error) {
    log.error("Failed to set IP location", {
      ip,
      error: error instanceof Error ? error.message : "Unknown error",
    });
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
  const log = logger.for("getIPLocation");

  try {
    // First, try to get from Redis cache
    const locationJson = await kv.hget("ip:locations", ip);
    if (locationJson) {
      const cachedLocationData = JSON.parse(
        locationJson as string
      ) as IPLocationData;
      log.debug("IP location found in cache", cachedLocationData);
      return cachedLocationData;
    }

    // Cache miss - fetch from API
    log.debug("IP location not in cache, fetching from API", { ip });
    const locationData = await getIPLocationFromAPI(ip);

    if (!locationData) {
      log.warn("Failed to get IP location from API", { ip });
      return null;
    }

    // Cache the result for future use
    await setIPLocation(ip, locationData);

    log.info("IP location fetched from API and cached", locationData);
    return locationData;
  } catch (error) {
    log.error("Failed to get IP location", {
      ip,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}
