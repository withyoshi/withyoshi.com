#!/usr/bin/env tsx

/**
 * Setup RAG: Create embeddings and index content
 *
 * Run this once to set up your vector database with content embeddings
 *
 * Usage:
 *   npx tsx scripts/setup-rag.ts
 */

// Load environment variables from .env.local
import { config } from "dotenv";

config({ path: ".env.local" });

import { loadAllChunks } from "../lib/cv/chatbot/rag/chunker";
import { createEmbeddings } from "../lib/cv/chatbot/rag/embeddings";
import { NeonPostgresVectorStore } from "../lib/cv/chatbot/rag/vercel-postgres-store";

async function main() {
  console.log("🚀 Setting up RAG...\n");

  // Validate required environment variables
  if (!process.env.POSTGRES_URL) {
    console.error("❌ POSTGRES_URL not found in .env.local");
    console.error(
      "   Please add your Neon Postgres connection string to .env.local"
    );
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not found in .env.local");
    console.error("   Please add your OpenAI API key to .env.local");
    process.exit(1);
  }

  // Load all chunks from markdown files
  console.log("📖 Loading content chunks...");
  const chunks = loadAllChunks();
  console.log(`✅ Loaded ${chunks.length} chunks\n`);

  // Create embeddings
  console.log("🔢 Creating embeddings...");
  const chunksWithEmbeddings = await createEmbeddings(chunks);
  console.log(`✅ Created ${chunksWithEmbeddings.length} embeddings\n`);

  // Store in vector database
  console.log("💾 Storing in vector database (Neon Postgres)...");
  const vectorStore = new NeonPostgresVectorStore();

  // Clear existing embeddings before repopulating
  console.log("   🗑️  Clearing existing embeddings...");
  await vectorStore.deleteAll();
  console.log("   ✅ Cleared existing embeddings");

  // Upsert new embeddings
  await vectorStore.upsert(chunksWithEmbeddings);
  console.log("✅ Stored in Neon Postgres vector database\n");

  // Test query
  console.log("🧪 Testing retrieval...");
  const { createQueryEmbedding } = await import(
    "../lib/cv/chatbot/rag/embeddings"
  );
  const testQueryEmbedding = await createQueryEmbedding(
    "What is Yan Sern's current role?"
  );
  const testResults = await vectorStore.query(testQueryEmbedding, {
    topK: 3,
    filter: { accessLevel: "guest" },
  });
  console.log(`✅ Retrieved ${testResults.length} chunks\n`);
  if (testResults.length > 0) {
    console.log(
      `   Sample chunk: ${testResults[0].content.substring(0, 100)}...\n`
    );
  }

  console.log("✨ RAG setup complete!");
  console.log("\n💡 Next steps:");
  console.log("   1. The API route is already configured to use RAG");
  console.log("   2. Test the chatbot - RAG is now active!");
}

main().catch(console.error);
