#!/usr/bin/env tsx

/**
 * Check embeddings in the database
 * Shows what's actually stored and sample content
 */

import { config } from "dotenv";

config({ path: ".env.local" });

import { createQueryEmbedding } from "../lib/cv/chatbot/rag/embeddings";
import { NeonPostgresVectorStore } from "../lib/cv/chatbot/rag/vercel-postgres-store";

async function checkEmbeddings() {
  console.log("🔍 Checking embeddings in database...\n");

  if (!process.env.POSTGRES_URL) {
    console.error("❌ POSTGRES_URL not found in .env.local");
    process.exit(1);
  }

  const vectorStore = new NeonPostgresVectorStore();

  // Test query: "Where does he live?"
  const testQuery = "Where does he live?";
  console.log(`Testing query: "${testQuery}"\n`);

  const queryEmbedding = await createQueryEmbedding(testQuery);
  console.log(
    `✅ Created query embedding (${queryEmbedding.length} dimensions)\n`
  );

  // Query database
  const results = await vectorStore.query(queryEmbedding, {
    topK: 10,
  });

  console.log(`📊 Found ${results.length} chunks in database\n`);

  if (results.length === 0) {
    console.log("❌ No embeddings found! Database might be empty.");
    console.log("\nRun: npm run setup-rag");
    return;
  }

  // Show top results
  console.log("🔝 Top 10 Results:");
  console.log("=".repeat(70));

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    console.log(
      `\n${i + 1}. Score: ${r.score.toFixed(3)} | Access: ${r.accessLevel.toUpperCase()} | Source: ${r.source}`
    );
    console.log(`   Section: ${r.section || "N/A"}`);
    console.log("   Content (first 200 chars):");
    console.log(`   ${r.content.substring(0, 200).replace(/\n/g, " ")}...`);
  }

  console.log(`\n${"=".repeat(70)}`);

  // Count by access level
  const guestCount = results.filter((r) => r.accessLevel === "guest").length;
  const proCount = results.filter((r) => r.accessLevel === "pro").length;
  const vipCount = results.filter((r) => r.accessLevel === "vip").length;

  console.log("\n📈 Distribution in top 10:");
  console.log(`   GUEST: ${guestCount}`);
  console.log(`   PRO:   ${proCount}`);
  console.log(`   VIP:   ${vipCount}`);

  // Check score distribution
  const highScore = results.filter((r) => r.score >= 0.7).length;
  const medScore = results.filter(
    (r) => r.score >= 0.5 && r.score < 0.7
  ).length;
  const lowScore = results.filter((r) => r.score < 0.5).length;

  console.log("\n📊 Score Distribution:");
  console.log(`   High (≥0.7):  ${highScore}`);
  console.log(`   Med (0.5-0.7): ${medScore}`);
  console.log(`   Low (<0.5):    ${lowScore}`);

  if (results[0].score < 0.5) {
    console.log(
      `\n⚠️  WARNING: Top score is ${results[0].score.toFixed(3)} - very low!`
    );
    console.log(
      `   This suggests the content format doesn't match questions well.`
    );
    console.log("   Consider adding more natural language to your content.");
  }

  console.log("\n✅ Embeddings check complete!\n");
}

checkEmbeddings().catch(console.error);
