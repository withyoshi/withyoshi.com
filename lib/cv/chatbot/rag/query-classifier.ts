/**
 * Query Classifier
 *
 * Classifies questions by required access level using keyword matching.
 * This is more reliable than similarity-score-based classification for access control.
 *
 * Strategy: Use keyword matching FIRST, then RAG for content retrieval within that level.
 */

/**
 * Keywords that indicate PRO-level questions
 */
const PRO_KEYWORDS = [
  // Personal details
  "age",
  "old",
  "born",
  "years old",
  // Personality
  "mbti",
  "personality type",
  "personality",
  // Languages (spoken)
  "languages",
  "speak",
  "speaks",
  "fluent",
  "mandarin",
  "dutch",
  "bulgarian",
  "cyrillic",
  // Professional details
  "leadership style",
  "leadership",
  "mentoring",
  "mentor",
  "mentoring approach",
  "learn technologies",
  "learn",
  "learning approach",
  "problem solving",
  "solve problems",
  "debugging",
  "debug",
  "approach debugging",
  "conflict",
  "handle conflicts",
  "give feedback",
  "feedback",
  "decision making",
  "decision-making",
  "career transitions",
  "tech stack evolution",
  "technology stack evolution",
  "stack evolution",
  "prefer remote",
  "prefer remote work",
  "remote work preference",
  "educational background",
  "education",
  "degree",
  "university",
  "diploma",
  "studied",
  "use ai",
  "ai while coding",
  "ai coding",
  "cursor",
  "manage teams",
  "team management",
];

/**
 * Keywords that indicate VIP-level questions
 */
const VIP_KEYWORDS = [
  // Personal life
  "birthday",
  "birth date",
  "when was he born",
  "zodiac",
  "leo",
  "zodiac sign",
  "siblings",
  "brothers",
  "sisters",
  "family",
  "nephews",
  "nieces",
  "married",
  "children",
  "pets",
  "pet",
  "dog",
  "cat",
  "tubby",
  "mano",
  // Hobbies & interests
  "hobbies",
  "what are his hobbies",
  "what are his hobbies?",
  "his hobbies",
  "are his hobbies",
  "photography",
  "piano",
  "play piano",
  "jazz",
  "homelab",
  "travel",
  "traveled",
  "countries",
  "favorite city",
  "lisbon",
  "favorite color",
  "favorite restaurant",
  "favorite movie",
  "favorite food",
  "cook",
  "cooking",
  "camera brand",
  "keyboards",
  "collect keyboards",
  "music",
  "music preferences",
  "favorite music",
  // Background
  "grew up",
  "grow up",
  "penang",
  "childhood",
  "residencies",
  "sofia",
  "bulgaria",
];

/**
 * Classify query by required access level using keyword matching
 *
 * Returns the LOWEST access level that matches.
 * This ensures we don't over-classify questions.
 */
export function classifyQueryAccessLevel(
  query: string
): "guest" | "pro" | "vip" {
  const lowerQuery = query.toLowerCase();

  // Check PRO keywords FIRST (since PRO comes before VIP in hierarchy)
  // This ensures "educational background" matches PRO, not VIP
  for (const keyword of PRO_KEYWORDS) {
    if (lowerQuery.includes(keyword.toLowerCase())) {
      return "pro";
    }
  }

  // Check VIP keywords (more specific personal life questions)
  // Skip "background" if it's part of "educational background" (already handled by PRO)
  for (const keyword of VIP_KEYWORDS) {
    // Skip "background" if query contains "educational" (it's PRO, not VIP)
    if (keyword === "background" && lowerQuery.includes("educational")) {
      continue;
    }
    if (lowerQuery.includes(keyword.toLowerCase())) {
      return "vip";
    }
  }

  // Default to GUEST
  return "guest";
}

/**
 * Classify multiple queries (for batch processing)
 */
export function classifyQueries(
  queries: string[]
): Array<{ query: string; level: "guest" | "pro" | "vip" }> {
  return queries.map((query) => ({
    query,
    level: classifyQueryAccessLevel(query),
  }));
}
