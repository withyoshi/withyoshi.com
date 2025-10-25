import { NextResponse } from "next/server";

export async function GET() {
  const robotsContent = `User-agent: *
Disallow: /cv
Disallow: /api/
Disallow: /_next/`;

  return new NextResponse(robotsContent, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
