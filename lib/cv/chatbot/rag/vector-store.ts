/**
 * Vector Store Interface
 *
 * Abstract interface for vector database operations
 * Implemented by NeonPostgresVectorStore for Neon Postgres with pgvector
 */

import type { ContentChunk } from "./embeddings";

export interface VectorStore {
  /**
   * Upsert chunks with embeddings
   */
  upsert(chunks: Array<ContentChunk & { embedding: number[] }>): Promise<void>;

  /**
   * Search for similar chunks
   */
  query(
    embedding: number[],
    options: {
      topK?: number;
      filter?: {
        accessLevel?: "guest" | "pro" | "vip";
        source?: string;
      };
    }
  ): Promise<Array<ContentChunk & { score: number }>>;

  /**
   * Delete all chunks (useful for re-indexing)
   */
  deleteAll(): Promise<void>;
}
