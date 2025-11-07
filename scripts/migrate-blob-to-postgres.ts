#!/usr/bin/env tsx

/**
 * Migration Script: Migrate chat transcripts from Vercel Blob to PostgreSQL
 *
 * This script:
 * 1. Lists all chat sessions from PostgreSQL
 * 2. For each session, tries to fetch the corresponding blob
 * 3. If blob exists, migrates the messages to PostgreSQL
 *
 * Usage:
 *   npx tsx scripts/migrate-blob-to-postgres.ts              # Run migration
 *   npx tsx scripts/migrate-blob-to-postgres.ts --dry-run     # Preview without changes
 */

// Load environment variables from .env.local
import { config } from "dotenv";

config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { head } from "@vercel/blob";

interface BlobTranscript {
  chatSessionId: string;
  messages: any[];
}

async function main() {
  // Check for dry-run flag
  const isDryRun = process.argv.includes("--dry-run");

  if (isDryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made to the database\n");
  }

  console.log("🚀 Starting migration from Vercel Blob to PostgreSQL...\n");

  // Check environment variables
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("❌ POSTGRES_URL not found in environment variables");
    console.error("   Please set POSTGRES_URL in your .env.local file");
    process.exit(1);
  }

  const sql = neon(connectionString);

  // Step 1: Get all chat sessions from PostgreSQL
  console.log("📊 Fetching all chat sessions from PostgreSQL...");
  let sessions: Array<{ id: string }>;
  try {
    const result = await sql`
      SELECT id FROM cv_chat_sessions
      ORDER BY created_at DESC
    `;
    sessions = result as Array<{ id: string }>;
    console.log(`✅ Found ${sessions.length} chat sessions\n`);
  } catch (error) {
    console.error("❌ Failed to query PostgreSQL:", error);
    process.exit(1);
  }

  if (sessions.length === 0) {
    console.log("ℹ️  No sessions found in PostgreSQL. Exiting.");
    return;
  }

  // Step 2: Process each session
  console.log("📥 Checking and migrating blobs for each session...\n");
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: Array<{ sessionId: string; error: string }> = [];

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    const sessionId = session.id;
    const progress = `[${i + 1}/${sessions.length}]`;

    try {
      // Construct blob path
      const blobPath = `cv-chat-logs/chat-${sessionId}.json`;

      // Check if blob exists
      let blobInfo: Awaited<ReturnType<typeof head>> | undefined;
      try {
        blobInfo = await head(blobPath);
      } catch (_error) {
        // Blob doesn't exist, skip this session
        console.log(
          `${progress} ⚠️  Skipping ${sessionId} (blob not found in Vercel Blob)`
        );
        skippedCount++;
        continue;
      }

      if (!blobInfo) {
        console.log(`${progress} ⚠️  Skipping ${sessionId} (blob not found)`);
        skippedCount++;
        continue;
      }

      // Fetch blob content
      const response = await fetch(blobInfo.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const transcript: BlobTranscript = await response.json();

      // Validate transcript structure
      if (!(transcript.chatSessionId && Array.isArray(transcript.messages))) {
        throw new Error("Invalid transcript format");
      }

      // Verify session ID matches
      if (transcript.chatSessionId !== sessionId) {
        console.log(
          `${progress} ⚠️  Skipping ${sessionId} (ID mismatch in transcript)`
        );
        skippedCount++;
        continue;
      }

      // Update PostgreSQL record with messages (or just log in dry-run)
      if (isDryRun) {
        console.log(
          `${progress} ✅ [DRY RUN] Would migrate ${sessionId} (${transcript.messages.length} messages)`
        );
        successCount++;
      } else {
        await sql`
          UPDATE cv_chat_sessions
          SET messages = ${JSON.stringify(transcript.messages)}::jsonb
          WHERE id = ${sessionId}
        `;

        console.log(
          `${progress} ✅ Migrated ${sessionId} (${transcript.messages.length} messages)`
        );
        successCount++;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `${progress} ❌ Error processing ${sessionId}: ${errorMessage}`
      );
      errors.push({ sessionId, error: errorMessage });
      errorCount++;
    }

    // Small delay to avoid rate limiting
    if (i < sessions.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Step 3: Summary
  console.log(`\n${"=".repeat(60)}`);
  if (isDryRun) {
    console.log("📊 Migration Summary (DRY RUN)");
  } else {
    console.log("📊 Migration Summary");
  }
  console.log("=".repeat(60));
  if (isDryRun) {
    console.log(`✅ Would migrate: ${successCount}`);
  } else {
    console.log(`✅ Successfully migrated: ${successCount}`);
  }
  console.log(`⚠️  Skipped (no blob found): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📦 Total sessions processed: ${sessions.length}`);

  if (errors.length > 0) {
    console.log("\n❌ Errors encountered:");
    for (const { sessionId, error } of errors) {
      console.log(`   - ${sessionId}: ${error}`);
    }
  }

  if (isDryRun) {
    console.log(
      "\n✨ Dry run complete! Run without --dry-run to apply changes."
    );
  } else {
    console.log("\n✨ Migration complete!");
  }
}

main().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
