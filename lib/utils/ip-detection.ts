import { NextRequest } from "next/server";

/**
 * Extracts the client IP address from a NextRequest object
 * Checks various headers in order of preference to handle different proxy configurations
 *
 * @param request - The NextRequest object
 * @returns The client IP address or "unknown" if not found
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers in order of preference
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (cfConnectingIP) return cfConnectingIP;

  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIP = request.headers.get("x-real-ip");
  if (xRealIP) return xRealIP;

  const xClientIP = request.headers.get("x-client-ip");
  if (xClientIP) return xClientIP;

  return "unknown";
}

/**
 * Debug helper to log IP detection details
 * Useful for troubleshooting IP detection issues
 *
 * @param request - The NextRequest object
 * @returns Object containing IP detection debug information
 */
export function debugIPDetection(request: NextRequest) {
  const ip = getClientIP(request);

  return {
    ip,
    headers: {
      "cf-connecting-ip": request.headers.get("cf-connecting-ip"),
      "x-forwarded-for": request.headers.get("x-forwarded-for"),
      "x-real-ip": request.headers.get("x-real-ip"),
      "x-client-ip": request.headers.get("x-client-ip"),
    },
  };
}
