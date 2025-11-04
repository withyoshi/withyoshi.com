/**
 * RAG Embeddings Service
 *
 * Creates embeddings for content chunks and stores them in a vector database
 */

import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

export interface ContentChunk {
  id: string;
  content: string;
  source: "core" | "guest" | "pro" | "vip";
  section?: string;
  accessLevel: "guest" | "pro" | "vip";
  metadata?: Record<string, any>;
}

/**
 * Create embeddings for content chunks
 */
export async function createEmbeddings(
  chunks: ContentChunk[]
): Promise<Array<ContentChunk & { embedding: number[] }>> {
  // Process in batches to avoid rate limits
  const batchSize = 100;
  const results: Array<ContentChunk & { embedding: number[] }> = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    // Create embeddings for batch
    const embeddings = await Promise.all(
      batch.map((chunk) =>
        embed({
          model: openai.embedding("text-embedding-3-small"),
          value: chunk.content,
        })
      )
    );

    // Combine chunks with their embeddings
    for (let j = 0; j < batch.length; j++) {
      results.push({
        ...batch[j],
        embedding: embeddings[j].embedding,
      });
    }
  }

  return results;
}

/**
 * Smart query expansion for terms that benefit from synonyms/context
 *
 * Strategy: Expand queries with semantic variations that help match
 * against natural language content in the knowledge base.
 *
 * We use targeted expansions that match how questions are phrased in
 * the content files (e.g., "How does he..." patterns).
 */
const QUERY_EXPANSIONS: Record<string, string[]> = {
  // Personality/psychology terms
  mbti: ["personality type", "personality"],
  personality: ["mbti", "personality type"],

  // Date/time synonyms
  birthday: ["born", "birth date", "date of birth", "when was he born"],
  born: ["birthday", "birth date", "when was he born"],

  // Age synonyms
  age: ["old", "years old", "born", "how old"],
  old: ["age", "years old", "how old"],

  // Work/career synonyms
  job: ["role", "position", "work", "what does he do"],
  position: ["role", "job", "what does he do"],
  work: ["job", "role", "employment", "what does he do"],
  role: ["job", "position", "what does he do"],

  // Education synonyms
  education: [
    "school",
    "university",
    "degree",
    "studied",
    "educational background",
  ],
  degree: ["education", "studied", "educational background"],
  background: ["education", "educational background"],

  // Skills/tech synonyms
  skills: ["technologies", "tools", "experience with", "what technologies"],
  technologies: ["tech", "tools", "skills", "what technologies"],
  tech: ["technologies", "tools", "what technologies"],

  // Personal life
  hobbies: ["interests", "likes", "enjoys", "what are his hobbies"],
  interests: ["hobbies", "likes", "what are his hobbies"],
  family: ["siblings", "parents", "relatives", "does he have siblings"],
  siblings: ["brothers", "sisters", "family", "does he have siblings"],

  // Location
  location: ["live", "based", "lives in", "where does he live"],
  live: ["location", "based", "resides", "where does he live", "lives"],
  based: ["location", "live", "located", "where is he based"],
  lives: ["lives in", "resides", "location", "where does he live"],

  // Contact
  email: ["contact", "email address", "what's his email"],
  contact: ["email", "reach", "contact information", "how can I contact"],

  // Companies/employment
  companies: [
    "worked at",
    "employment",
    "companies he worked at",
    "what companies",
  ],
  worked: ["companies", "employment", "jobs", "where has he worked"],

  // Experience
  experience: ["years", "worked", "career", "how many years"],
  years: ["experience", "career", "worked", "how many years"],

  // Problem solving
  solve: ["solve problems", "problem solving", "how does he solve"],
  problems: ["problem solving", "how does he solve problems"],

  // Learning
  learn: ["learn technologies", "learning", "how does he learn"],
  technologies_learning: [
    "learn technologies",
    "how does he learn technologies",
  ],

  // Leadership
  leadership: ["leadership style", "how does he lead", "manage teams"],
  manage: ["manage teams", "team management", "how does he manage"],

  // Conflicts
  conflicts: ["handle conflicts", "conflict resolution", "how does he handle"],
  handle: ["handle conflicts", "how does he handle conflicts"],

  // Feedback
  feedback: ["give feedback", "how does he give", "feedback style"],

  // Mentoring
  mentoring: ["mentoring approach", "how does he mentor", "mentor"],

  // Debugging
  debugging: ["approach debugging", "how does he debug", "debug"],

  // Decision making
  decision: [
    "decision making",
    "decision-making process",
    "how does he make decisions",
  ],

  // Career transitions
  transitions: ["career transitions", "career changes", "what are his career"],

  // Tech stack evolution
  evolution: [
    "technology stack evolution",
    "tech stack evolution",
    "how has his tech stack",
  ],

  // Remote work
  remote: ["remote work", "prefer remote", "does he prefer remote"],

  // Cooking
  cook: ["does he cook", "cooking", "cooking skills"],

  // Music
  music: ["what music", "music does he like", "music preferences"],

  // Piano
  piano: ["play piano", "does he play piano", "piano playing"],

  // City
  city: ["favorite city", "what's his favorite city", "favorite place"],

  // Color
  color: ["favorite color", "what's his favorite color", "colors"],

  // Restaurant
  restaurant: [
    "favorite restaurant",
    "what's his favorite restaurant",
    "favorite place to eat",
  ],

  // Movie
  movie: ["favorite movie", "what's his favorite movie", "movies"],

  // Camera
  camera: ["camera brand", "favorite camera", "what's his favorite camera"],

  // Keyboards
  keyboards: [
    "collect keyboards",
    "does he collect keyboards",
    "keyboard collection",
  ],

  // Zodiac
  zodiac: ["zodiac sign", "what's his zodiac", "sign"],

  // Chatbot
  chatbot: [
    "how is this chatbot built",
    "chatbot built",
    "how was this chatbot",
  ],
  built: ["how is this chatbot built", "how was this built"],
};

/**
 * Expand query with relevant synonyms/context
 * Only expands if the term appears in our controlled expansion map
 *
 * Strategy: Add semantic variations that match natural language patterns
 * in the content, while keeping the original query intact for context.
 */
function expandQuery(query: string): string {
  const lowerQuery = query.toLowerCase();
  const expansions: string[] = [];

  // Check each expansion term
  for (const [term, synonyms] of Object.entries(QUERY_EXPANSIONS)) {
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${term}\\b`, "i");
    if (regex.test(lowerQuery)) {
      // Add the most relevant synonyms (prioritize natural language patterns)
      // These help match against "How does he..." and "What's his..." patterns
      const relevantSynonyms = synonyms.filter(
        (s) =>
          s.includes("how") ||
          s.includes("what") ||
          s.includes("does") ||
          s.includes("where") ||
          s.includes("when") ||
          s.length < 15
      );
      expansions.push(
        ...(relevantSynonyms.length > 0
          ? relevantSynonyms.slice(0, 2)
          : synonyms.slice(0, 2))
      );
    }
  }

  // If we found relevant expansions, append them
  if (expansions.length > 0) {
    // Deduplicate and limit to 4 expansion terms max
    const uniqueExpansions = [...new Set(expansions)].slice(0, 4);
    // Add expansions but keep original query first for semantic priority
    return `${query} ${uniqueExpansions.join(" ")}`;
  }

  return query;
}

/**
 * Create embedding for a query
 *
 * Applies smart query expansion for specific terms that benefit from it,
 * while keeping the full original query for semantic context.
 */
export async function createQueryEmbedding(query: string): Promise<number[]> {
  // Apply minimal, targeted query expansion
  const expandedQuery = expandQuery(query);

  const { embedding } = await embed({
    model: openai.embedding("text-embedding-3-small"),
    value: expandedQuery,
  });

  return embedding;
}
