#!/usr/bin/env tsx

/**
 * Cleanup Script: Remove local test sessions from cv_chat_sessions
 *
 * This script removes all entries from cv_chat_sessions where the IP address
 * is "::1" (IPv6 localhost), which are local test sessions.
 *
 * Run with: npx tsx scripts/remove-local-test-sessions.ts
 * Dry run: npx tsx scripts/remove-local-test-sessions.ts --dry-run
 */

// Load environment variables from .env.local
import { config } from "dotenv";

config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const isDryRun = process.argv.includes("--dry-run");

  console.log("🧹 Local Test Sessions Cleanup Script\n");
  if (isDryRun) {
    console.log("⚠️  DRY RUN MODE - No changes will be made\n");
  }

  // Check environment variables
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("❌ POSTGRES_URL not found in environment variables");
    console.error("   Please set POSTGRES_URL in your .env.local file");
    process.exit(1);
  }

  const sql = neon(connectionString);

  try {
    // Step 1: Count sessions with IP "::1"
    console.log("📊 Checking for local test sessions (IP: ::1)...");
    const countResult = (await sql`
      SELECT COUNT(*) as count
      FROM cv_chat_sessions
      WHERE ip_location->>'ip' = '::1'
    `) as Array<{ count: string }>;

    const count = Number.parseInt(countResult[0]?.count || "0", 10);

    if (count === 0) {
      console.log("✅ No local test sessions found. Nothing to clean up.");
      return;
    }

    console.log(`   Found ${count} local test session(s)\n`);

    // Step 2: Show some sample sessions (optional preview)
    if (count > 0 && count <= 10) {
      console.log("📋 Sessions to be removed:");
      const samples = (await sql`
        SELECT id, created_at, summary
        FROM cv_chat_sessions
        WHERE ip_location->>'ip' = '::1'
        ORDER BY created_at DESC
      `) as Array<{
        id: string;
        created_at: string;
        summary: string;
      }>;

      samples.forEach((session, index) => {
        const date = new Date(session.created_at).toLocaleString();
        const summaryPreview =
          session.summary.length > 50
            ? `${session.summary.substring(0, 50)}...`
            : session.summary;
        console.log(
          `   ${index + 1}. ${session.id} (${date}) - ${summaryPreview}`
        );
      });
      console.log();
    } else if (count > 10) {
      console.log(`   (Showing first 5 of ${count} sessions for preview)\n`);
      const samples = (await sql`
        SELECT id, created_at, summary
        FROM cv_chat_sessions
        WHERE ip_location->>'ip' = '::1'
        ORDER BY created_at DESC
        LIMIT 5
      `) as Array<{
        id: string;
        created_at: string;
        summary: string;
      }>;

      samples.forEach((session, index) => {
        const date = new Date(session.created_at).toLocaleString();
        const summaryPreview =
          session.summary.length > 50
            ? `${session.summary.substring(0, 50)}...`
            : session.summary;
        console.log(
          `   ${index + 1}. ${session.id} (${date}) - ${summaryPreview}`
        );
      });
      console.log();
    }

    // Step 3: Delete the sessions
    if (isDryRun) {
      console.log("🔍 DRY RUN: Would delete the above sessions");
      console.log("   Run without --dry-run to actually delete them");
    } else {
      console.log("🗑️  Deleting local test sessions...");
      const deleteResult = (await sql`
        DELETE FROM cv_chat_sessions
        WHERE ip_location->>'ip' = '::1'
        RETURNING id
      `) as Array<{ id: string }>;

      const deletedCount = deleteResult.length;
      console.log(`✅ Successfully deleted ${deletedCount} session(s)\n`);
    }

    // Step 4: Summary
    console.log("=".repeat(60));
    console.log("📊 Cleanup Summary");
    console.log("=".repeat(60));
    console.log(`📝 Sessions found: ${count}`);
    if (isDryRun) {
      console.log(`🔍 Dry run: ${count} session(s) would be deleted`);
    } else {
      console.log(`✅ Sessions deleted: ${count}`);
    }
    console.log("\n✨ Cleanup complete!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
