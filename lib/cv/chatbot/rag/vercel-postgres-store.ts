/**
 * Neon Postgres with pgvector Vector Store
 *
 * Uses Neon Postgres (via @neondatabase/serverless) with pgvector extension
 * This works perfectly with Neon's serverless driver
 *
 * Setup:
 * 1. Enable pgvector extension in your Neon database
 * 2. Create the embeddings table
 * 3. Use POSTGRES_URL from Neon
 *
 * SQL to run in your Neon database (via Neon SQL Editor):
 * ```sql
 * CREATE EXTENSION IF NOT EXISTS vector;
 *
 * CREATE TABLE IF NOT EXISTS cv_embeddings (
 *   id TEXT PRIMARY KEY,
 *   embedding vector(1536),
 *   content TEXT NOT NULL,
 *   source TEXT NOT NULL,
 *   section TEXT,
 *   access_level TEXT NOT NULL,
 *   metadata JSONB,
 *   created_at TIMESTAMP DEFAULT NOW()
 * );
 *
 * CREATE INDEX ON cv_embeddings USING ivfflat (embedding vector_cosine_ops);
 * ```
 */

import { neon } from "@neondatabase/serverless";
import type { ContentChunk } from "./embeddings";
import type { VectorStore } from "./vector-store";

export class NeonPostgresVectorStore implements VectorStore {
  private readonly sql: ReturnType<typeof neon>;

  constructor() {
    const connectionString = process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error("POSTGRES_URL environment variable is required");
    }

    this.sql = neon(connectionString);
  }

  async upsert(
    chunks: Array<ContentChunk & { embedding: number[] }>
  ): Promise<void> {
    // Upsert in batches
    const batchSize = 100;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      // Neon's serverless driver doesn't support transactions the same way
      // So we'll do individual inserts/updates
      for (const chunk of batch) {
        // Format embedding as PostgreSQL vector literal: [1,2,3]
        const embeddingStr = `[${chunk.embedding.join(",")}]`;

        await this.sql`
          INSERT INTO cv_embeddings (
            id,
            embedding,
            content,
            source,
            section,
            access_level,
            metadata
          ) VALUES (
            ${chunk.id},
            ${embeddingStr}::vector,
            ${chunk.content},
            ${chunk.source},
            ${chunk.section || null},
            ${chunk.accessLevel},
            ${JSON.stringify(chunk.metadata || {})}
          )
          ON CONFLICT (id)
          DO UPDATE SET
            embedding = EXCLUDED.embedding,
            content = EXCLUDED.content,
            source = EXCLUDED.source,
            section = EXCLUDED.section,
            access_level = EXCLUDED.access_level,
            metadata = EXCLUDED.metadata
        `;
      }
    }
  }

  async query(
    embedding: number[],
    options: {
      topK?: number;
      filter?: {
        accessLevel?: "guest" | "pro" | "vip";
        source?: string;
      };
    } = {}
  ): Promise<Array<ContentChunk & { score: number }>> {
    const { topK = 5, filter } = options;

    // Build access level filter
    // If filter.accessLevel is undefined, query all levels (for Strategy 2)
    // If filter.accessLevel is provided, it represents the user's access level,
    // so include all levels they can access (hierarchical: guest < pro < vip)
    const allowedLevels: string[] =
      filter?.accessLevel === undefined
        ? ["guest", "pro", "vip"] // Query all levels (for Strategy 2)
        : filter.accessLevel === "vip"
          ? ["guest", "pro", "vip"] // VIP can access all
          : filter.accessLevel === "pro"
            ? ["guest", "pro"] // PRO can access guest and pro
            : ["guest"]; // GUEST can only access guest

    // Format embedding as PostgreSQL vector literal: [1,2,3]
    const embeddingStr = `[${embedding.join(",")}]`;

    // Query using cosine similarity (<=> operator)
    // Neon's serverless driver returns arrays directly
    type ResultRow = {
      id: string;
      content: string;
      source: string;
      section: string | null;
      access_level: string;
      metadata: Record<string, any>;
      score: string;
    };

    let results: ResultRow[];
    if (filter?.source) {
      // Query with both access level and source filter
      // Using template tags with string interpolation for vector literal
      const queryResult = await this.sql`
        SELECT
          id,
          content,
          source,
          section,
          access_level,
          metadata,
          1 - (embedding <=> ${embeddingStr}::vector) as score
        FROM cv_embeddings
        WHERE access_level = ANY(${allowedLevels}::text[])
          AND source = ${filter.source}
        ORDER BY embedding <=> ${embeddingStr}::vector
        LIMIT ${topK}
      `;
      results = queryResult as ResultRow[];
    } else {
      // Query with only access level filter (or all levels if no filter)
      const queryResult = await this.sql`
        SELECT
          id,
          content,
          source,
          section,
          access_level,
          metadata,
          1 - (embedding <=> ${embeddingStr}::vector) as score
        FROM cv_embeddings
        WHERE access_level = ANY(${allowedLevels}::text[])
        ORDER BY embedding <=> ${embeddingStr}::vector
        LIMIT ${topK}
      `;
      results = queryResult as ResultRow[];
    }

    return results.map((row: ResultRow) => ({
      id: row.id,
      content: row.content,
      source: row.source as "core" | "guest" | "pro" | "vip",
      section: row.section || undefined,
      accessLevel: row.access_level as "guest" | "pro" | "vip",
      metadata: row.metadata || {},
      score: Number.parseFloat(row.score),
    }));
  }

  async deleteAll(): Promise<void> {
    await this.sql`DELETE FROM cv_embeddings`;
  }
}
