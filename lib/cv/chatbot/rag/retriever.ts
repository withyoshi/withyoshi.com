/**
 * RAG Retriever
 *
 * Retrieves relevant content chunks based on user query and access level
 * Handles access control and redirects
 */

import type { ConversationState } from "../state";
import { determineAccessRequirement } from "./access-guard";
import { createQueryEmbedding } from "./embeddings";
import { classifyQueryAccessLevel } from "./query-classifier";
import type { VectorStore } from "./vector-store";

export interface RetrievedChunk {
  content: string;
  source: string;
  section?: string;
  score: number;
  accessLevel: "guest" | "pro" | "vip";
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
  shouldRedirect: boolean;
  redirectReason?: "pro" | "vip";
  requiredAccessLevel?: "guest" | "pro" | "vip";
  // Indicates if higher-level content exists for this topic
  hasHigherLevelContent?: {
    pro?: boolean;
    vip?: boolean;
  };
}

/**
 * Retrieve relevant chunks for a query with access control
 *
 * Strategy: Retrieval-based access level detection
 * 1. Query vector database from ALL access levels (no filter)
 * 2. Check which access level the top results belong to
 * 3. If top results require higher access than user has, return redirect signal
 * 4. If user has access, filter and return chunks they can access
 */
export async function retrieveRelevantChunks(
  query: string,
  conversationState: ConversationState,
  vectorStore: VectorStore,
  options: {
    topK?: number;
    minScore?: number;
  } = {}
): Promise<RetrievalResult> {
  const { topK = 5, minScore = 0.3 } = options;

  // Determine user's access level
  const userType = conversationState.userType;
  const userAccessLevel: "guest" | "pro" | "vip" =
    userType === "vip" ? "vip" : userType === "pro" ? "pro" : "guest";

  // HYBRID APPROACH: Keyword classification FIRST, then RAG retrieval
  // This is more reliable than similarity-score-based classification

  // Step 1: Classify query using keyword matching (fast, accurate)
  const requiredLevel = classifyQueryAccessLevel(query);

  // Step 2: Check if user has access
  const hasAccess =
    requiredLevel === "guest" ||
    (requiredLevel === "pro" &&
      (userAccessLevel === "pro" || userAccessLevel === "vip")) ||
    (requiredLevel === "vip" && userAccessLevel === "vip");

  // Step 3: If user lacks access, return redirect signal immediately (no retrieval needed)
  if (!hasAccess) {
    return {
      chunks: [],
      shouldRedirect: true,
      requiredAccessLevel: requiredLevel,
      redirectReason: requiredLevel,
    };
  }

  // Step 4: User has access - retrieve chunks from their access level and below
  // Create query embedding for semantic search
  const queryEmbedding = await createQueryEmbedding(query);

  // Determine which access levels the user can query
  const allowedAccessLevels: Array<"guest" | "pro" | "vip"> = [];
  if (userAccessLevel === "vip") {
    allowedAccessLevels.push("guest", "pro", "vip");
  } else if (userAccessLevel === "pro") {
    allowedAccessLevels.push("guest", "pro");
  } else {
    allowedAccessLevels.push("guest");
  }

  // Query vector database - filter by user's access level
  // We only query levels the user has access to, improving security
  // Note: VectorStore.query expects a single accessLevel, so we query all levels the user can access
  // by passing the highest level they can access (which includes all lower levels)
  const allLevelsResults = await vectorStore.query(queryEmbedding, {
    topK: 30,
    // Pass the highest access level - the vector store will include all lower levels
    filter: {
      accessLevel: userAccessLevel,
    },
  });

  if (allLevelsResults.length === 0) {
    return {
      chunks: [],
      shouldRedirect: false,
      requiredAccessLevel: requiredLevel,
    };
  }

  // Step 5: Use access-guard to validate and potentially refine the classification
  // This provides a safety check in case keyword classification missed something
  const accessReq = determineAccessRequirement(
    allLevelsResults.map((r) => ({
      source: r.source,
      accessLevel: r.accessLevel,
      score: r.score,
      section: r.section || undefined,
    })),
    conversationState
  );

  // If access-guard disagrees with keyword classification, prefer the HIGHER level (more restrictive)
  // VIP > PRO > GUEST
  // This ensures we don't accidentally expose PRO/VIP content
  const finalRequiredLevel: "guest" | "pro" | "vip" =
    accessReq.requiredLevel === "vip" || requiredLevel === "vip"
      ? "vip" // VIP is highest, always prefer it
      : accessReq.requiredLevel === "pro" || requiredLevel === "pro"
        ? "pro" // PRO is higher than guest
        : "guest"; // Default to guest

  // Step 6: Filter chunks by required level and score
  // Prefer chunks from the required level, but also include higher levels if user has access
  const filtered = allLevelsResults
    .filter((r) => {
      const rLevel = r.accessLevel as "guest" | "pro" | "vip";
      // Prefer chunks from the required level
      const isRequiredLevel = rLevel === finalRequiredLevel;
      // But also allow higher levels if user has access (for more detail)
      const isHigherButAllowed =
        (finalRequiredLevel === "guest" &&
          (rLevel === "pro" || rLevel === "vip") &&
          allowedAccessLevels.includes(rLevel)) ||
        (finalRequiredLevel === "pro" &&
          rLevel === "vip" &&
          allowedAccessLevels.includes(rLevel));
      // Include if it's the required level (or higher), and meets minimum score
      return (isRequiredLevel || isHigherButAllowed) && r.score >= minScore;
    })
    // Sort: required level first, then by score
    .sort((a, b) => {
      const aLevel = a.accessLevel as "guest" | "pro" | "vip";
      const bLevel = b.accessLevel as "guest" | "pro" | "vip";
      // Prefer required level
      if (aLevel === finalRequiredLevel && bLevel !== finalRequiredLevel) {
        return -1;
      }
      if (bLevel === finalRequiredLevel && aLevel !== finalRequiredLevel) {
        return 1;
      }
      // Then by score
      return b.score - a.score;
    })
    .slice(0, topK); // Limit to topK

  // If no chunks pass minScore, use fallback threshold
  if (filtered.length === 0) {
    const fallbackMinScore = 0.25; // Lower threshold for fallback
    const fallbackFiltered = allLevelsResults
      .filter((r) => {
        const rLevel = r.accessLevel as "guest" | "pro" | "vip";
        if (!allowedAccessLevels.includes(rLevel)) {
          return false;
        }
        return rLevel === finalRequiredLevel && r.score >= fallbackMinScore;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    if (fallbackFiltered.length > 0) {
      return {
        chunks: fallbackFiltered.map((r) => ({
          content: r.content,
          source: r.source,
          section: r.section,
          score: r.score,
          accessLevel: r.accessLevel,
        })),
        shouldRedirect: false,
        requiredAccessLevel: finalRequiredLevel,
        hasHigherLevelContent: accessReq.hasHigherLevelContent,
      };
    }
  }

  return {
    chunks: filtered.map((r) => ({
      content: r.content,
      source: r.source,
      section: r.section,
      score: r.score,
      accessLevel: r.accessLevel,
    })),
    shouldRedirect: false,
    requiredAccessLevel: finalRequiredLevel,
    hasHigherLevelContent: accessReq.hasHigherLevelContent,
  };
}

/**
 * Format retrieved chunks for context
 */
export function formatChunksForContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant information found.";
  }

  return chunks
    .map((chunk) => {
      const sourceLabel =
        chunk.source === "core"
          ? "CORE"
          : chunk.source === "guest"
            ? "GUEST"
            : chunk.source === "pro"
              ? "PRO"
              : "VIP";
      const sectionLabel = chunk.section ? ` - ${chunk.section}` : "";
      return `## ${sourceLabel} CONTENT${sectionLabel}\n${chunk.content}`;
    })
    .join("\n\n");
}
