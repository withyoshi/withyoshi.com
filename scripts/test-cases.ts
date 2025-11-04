/**
 * Comprehensive test cases for RAG retriever
 * Organized by access level and category
 */

export interface TestCase {
  query: string;
  expectedLevel: "guest" | "pro" | "vip";
  userType: null | "pro" | "vip";
  shouldRedirect: boolean;
  category: string;
  minExpectedScore?: number; // Minimum score we expect for quality check
  variations?: string[]; // Alternative phrasings of the same question
}

export const TEST_CASES: TestCase[] = [
  // ============================================================================
  // GUEST LEVEL - Basic Public Information
  // ============================================================================

  // Location queries
  {
    query: "Where does he live?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "location",
    minExpectedScore: 0.25,
    variations: [
      "Where is he located?",
      "What city does he live in?",
      "Where is he based?",
      "What's his location?",
    ],
  },

  // Current role queries
  {
    query: "What's his current role?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "employment",
    minExpectedScore: 0.25,
    variations: [
      "What does he do?",
      "What's his job?",
      "Where does he work?",
      "What company does he work for?",
    ],
  },

  // Experience queries
  {
    query: "How many years of experience does he have?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "experience",
    minExpectedScore: 0.25,
    variations: [
      "How long has he been working?",
      "How much experience does he have?",
      "When did he start his career?",
    ],
  },

  // Skills queries
  {
    query: "What technologies does he use?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "skills",
    minExpectedScore: 0.25,
    variations: [
      "What programming languages does he know?",
      "What's his tech stack?",
      "What tools does he use?",
      "What frameworks does he know?",
    ],
  },

  // Projects queries
  {
    query: "What has he worked on?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "projects",
    minExpectedScore: 0.25,
    variations: [
      "What projects has he built?",
      "What are his achievements?",
      "What has he accomplished?",
    ],
  },

  // Contact info queries
  {
    query: "What's his email?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "contact",
    minExpectedScore: 0.3,
    variations: [
      "How can I contact him?",
      "What's his contact information?",
      "How do I reach him?",
    ],
  },

  // Companies queries
  {
    query: "What companies has he worked at?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "employment",
    minExpectedScore: 0.25,
    variations: [
      "Where has he worked?",
      "What's his work history?",
      "What companies are on his resume?",
    ],
  },

  // Open source queries
  {
    query: "What open source projects has he contributed to?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "opensource",
    minExpectedScore: 0.25,
    variations: [
      "Has he contributed to open source?",
      "What are his open source contributions?",
      "Does he work on open source?",
    ],
  },

  // Remote work queries
  {
    query: "Does he work remotely?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "work-style",
    minExpectedScore: 0.25,
  },

  // Chatbot technical queries
  {
    query: "How is this chatbot built?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "technical",
    minExpectedScore: 0.25,
  },

  // ============================================================================
  // PRO LEVEL - Professional Details (requires name)
  // ============================================================================

  // Age queries - PRO content, GUEST user (should redirect)
  {
    query: "How old is he?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "personal",
    minExpectedScore: 0.25,
    variations: ["What's his age?", "When was he born?"],
  },

  // Age queries - PRO content, PRO user (should not redirect)
  {
    query: "How old is he?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "personal",
    minExpectedScore: 0.25,
  },

  // MBTI queries - PRO content, GUEST user (should redirect)
  {
    query: "What's his MBTI?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "personality",
    minExpectedScore: 0.25,
    variations: [
      "What's his personality type?",
      "What personality type is he?",
      "What's his MBTI type?",
    ],
  },

  // MBTI queries - PRO content, PRO user (should not redirect)
  {
    query: "What's his MBTI?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "personality",
    minExpectedScore: 0.25,
  },

  // Language queries - PRO content, GUEST user (should redirect)
  {
    query: "What languages does he speak?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "languages",
    minExpectedScore: 0.25,
  },

  // Language queries - PRO content, PRO user (should not redirect)
  {
    query: "What languages does he speak?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "languages",
    minExpectedScore: 0.25,
  },

  // AI coding queries - PRO content, GUEST user (should redirect)
  {
    query: "Does he use AI while coding?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "work-style",
    minExpectedScore: 0.25,
  },

  // Leadership queries - PRO content, GUEST user (should redirect)
  {
    query: "What's his leadership style?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "leadership",
    minExpectedScore: 0.25,
  },

  // Education queries - PRO content, GUEST user (should redirect)
  {
    query: "What's his educational background?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "education",
    minExpectedScore: 0.25,
    variations: ["Where did he study?", "What degrees does he have?"],
  },

  // Problem-solving queries - PRO content, GUEST user (should redirect)
  {
    query: "How does he solve problems?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "problem-solving",
    minExpectedScore: 0.25,
  },

  // Problem-solving queries - PRO content, PRO user (should not redirect)
  {
    query: "How does he solve problems?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "problem-solving",
    minExpectedScore: 0.25,
  },

  // Learning queries - PRO content, GUEST user (should redirect)
  {
    query: "How does he learn technologies?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "learning",
    minExpectedScore: 0.25,
  },

  // Learning queries - PRO content, PRO user (should not redirect)
  {
    query: "How does he learn technologies?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "learning",
    minExpectedScore: 0.25,
  },

  // Conflict handling queries - PRO content, GUEST user (should redirect)
  {
    query: "How does he handle conflicts?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "conflict-resolution",
    minExpectedScore: 0.25,
  },

  // Conflict handling queries - PRO content, PRO user (should not redirect)
  {
    query: "How does he handle conflicts?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "conflict-resolution",
    minExpectedScore: 0.25,
  },

  // Mentoring queries - PRO content, GUEST user (should redirect)
  {
    query: "What's his mentoring approach?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "mentoring",
    minExpectedScore: 0.25,
  },

  // Mentoring queries - PRO content, PRO user (should not redirect)
  {
    query: "What's his mentoring approach?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "mentoring",
    minExpectedScore: 0.25,
  },

  // Remote work preference queries - PRO content, GUEST user (should redirect)
  {
    query: "Does he prefer remote work?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "work-style",
    minExpectedScore: 0.25,
  },

  // Remote work preference queries - PRO content, PRO user (should not redirect)
  {
    query: "Does he prefer remote work?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "work-style",
    minExpectedScore: 0.25,
  },

  // Debugging queries - PRO content, GUEST user (should redirect)
  {
    query: "How does he approach debugging?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "debugging",
    minExpectedScore: 0.25,
  },

  // Debugging queries - PRO content, PRO user (should not redirect)
  {
    query: "How does he approach debugging?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "debugging",
    minExpectedScore: 0.25,
  },

  // Tech stack evolution queries - PRO content, GUEST user (should redirect)
  {
    query: "What's his technology stack evolution?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "tech-evolution",
    minExpectedScore: 0.25,
  },

  // Tech stack evolution queries - PRO content, PRO user (should not redirect)
  {
    query: "What's his technology stack evolution?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "tech-evolution",
    minExpectedScore: 0.25,
  },

  // Career transitions queries - PRO content, GUEST user (should redirect)
  {
    query: "What are his career transitions?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "career",
    minExpectedScore: 0.25,
  },

  // Career transitions queries - PRO content, PRO user (should not redirect)
  {
    query: "What are his career transitions?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "career",
    minExpectedScore: 0.25,
  },

  // Team management queries - PRO content, GUEST user (should redirect)
  {
    query: "How does he manage teams?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "management",
    minExpectedScore: 0.25,
  },

  // Team management queries - PRO content, PRO user (should not redirect)
  {
    query: "How does he manage teams?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "management",
    minExpectedScore: 0.25,
  },

  // Decision-making queries - PRO content, GUEST user (should redirect)
  {
    query: "What's his decision-making process?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "decision-making",
    minExpectedScore: 0.25,
  },

  // Decision-making queries - PRO content, PRO user (should not redirect)
  {
    query: "What's his decision-making process?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "decision-making",
    minExpectedScore: 0.25,
  },

  // Feedback queries - PRO content, GUEST user (should redirect)
  {
    query: "How does he give feedback?",
    expectedLevel: "pro",
    userType: null,
    shouldRedirect: true,
    category: "feedback",
    minExpectedScore: 0.25,
  },

  // Feedback queries - PRO content, PRO user (should not redirect)
  {
    query: "How does he give feedback?",
    expectedLevel: "pro",
    userType: "pro",
    shouldRedirect: false,
    category: "feedback",
    minExpectedScore: 0.25,
  },

  // ============================================================================
  // VIP LEVEL - Personal Details (requires name + intro + contact)
  // ============================================================================

  // Birthday queries - VIP content, GUEST user (should redirect)
  {
    query: "When's his birthday?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "personal",
    minExpectedScore: 0.25,
    variations: [
      "What's his birthday?",
      "When was he born?",
      "What's his birth date?",
    ],
  },

  // Birthday queries - VIP content, PRO user (should redirect - needs more info)
  {
    query: "When's his birthday?",
    expectedLevel: "vip",
    userType: "pro",
    shouldRedirect: true,
    category: "personal",
    minExpectedScore: 0.25,
  },

  // Birthday queries - VIP content, VIP user (should not redirect)
  {
    query: "When's his birthday?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "personal",
    minExpectedScore: 0.25,
  },

  // Hobbies queries - VIP content, GUEST user (should redirect)
  {
    query: "What are his hobbies?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "hobbies",
    minExpectedScore: 0.25,
    variations: [
      "What does he do for fun?",
      "What are his interests?",
      "What does he enjoy?",
    ],
  },

  // Hobbies queries - VIP content, VIP user (should not redirect)
  {
    query: "What are his hobbies?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "hobbies",
    minExpectedScore: 0.25,
  },

  // Family queries - VIP content, GUEST user (should redirect)
  {
    query: "Does he have siblings?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "family",
    minExpectedScore: 0.25,
    variations: ["What about his family?", "Tell me about his family"],
  },

  // Pets queries - VIP content, GUEST user (should redirect)
  {
    query: "Does he have pets?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "pets",
    minExpectedScore: 0.25,
  },

  // Travel queries - VIP content, GUEST user (should redirect)
  {
    query: "Where has he traveled?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "travel",
    minExpectedScore: 0.25,
    variations: ["What countries has he visited?", "Does he like to travel?"],
  },

  // Favorite food queries - VIP content, GUEST user (should redirect)
  {
    query: "What's his favorite food?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "food",
    minExpectedScore: 0.25,
  },

  // Piano queries - VIP content, GUEST user (should redirect)
  {
    query: "Does he play piano?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "music",
    minExpectedScore: 0.25,
  },

  // Piano queries - VIP content, VIP user (should not redirect)
  {
    query: "Does he play piano?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "music",
    minExpectedScore: 0.25,
  },

  // Growing up queries - VIP content, GUEST user (should redirect)
  {
    query: "Where did he grow up?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "background",
    minExpectedScore: 0.25,
  },

  // Growing up queries - VIP content, VIP user (should not redirect)
  {
    query: "Where did he grow up?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "background",
    minExpectedScore: 0.25,
  },

  // Favorite city queries - VIP content, GUEST user (should redirect)
  {
    query: "What's his favorite city?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "preferences",
    minExpectedScore: 0.25,
  },

  // Favorite city queries - VIP content, VIP user (should not redirect)
  {
    query: "What's his favorite city?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "preferences",
    minExpectedScore: 0.25,
  },

  // Zodiac sign queries - VIP content, GUEST user (should redirect)
  {
    query: "What's his zodiac sign?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "personal",
    minExpectedScore: 0.25,
  },

  // Zodiac sign queries - VIP content, VIP user (should not redirect)
  {
    query: "What's his zodiac sign?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "personal",
    minExpectedScore: 0.25,
  },

  // Favorite color queries - VIP content, GUEST user (should redirect)
  {
    query: "What's his favorite color?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "preferences",
    minExpectedScore: 0.25,
  },

  // Favorite color queries - VIP content, VIP user (should not redirect)
  {
    query: "What's his favorite color?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "preferences",
    minExpectedScore: 0.25,
  },

  // Favorite restaurant queries - VIP content, GUEST user (should redirect)
  {
    query: "What's his favorite restaurant?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "food",
    minExpectedScore: 0.25,
  },

  // Favorite restaurant queries - VIP content, VIP user (should not redirect)
  {
    query: "What's his favorite restaurant?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "food",
    minExpectedScore: 0.25,
  },

  // Cooking queries - VIP content, GUEST user (should redirect)
  {
    query: "Does he cook?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "food",
    minExpectedScore: 0.25,
  },

  // Cooking queries - VIP content, VIP user (should not redirect)
  {
    query: "Does he cook?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "food",
    minExpectedScore: 0.25,
  },

  // Favorite movie queries - VIP content, GUEST user (should redirect)
  {
    query: "What's his favorite movie?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "entertainment",
    minExpectedScore: 0.25,
  },

  // Favorite movie queries - VIP content, VIP user (should not redirect)
  {
    query: "What's his favorite movie?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "entertainment",
    minExpectedScore: 0.25,
  },

  // Music preferences queries - VIP content, GUEST user (should redirect)
  {
    query: "What music does he like?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "music",
    minExpectedScore: 0.25,
  },

  // Music preferences queries - VIP content, VIP user (should not redirect)
  {
    query: "What music does he like?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "music",
    minExpectedScore: 0.25,
  },

  // Camera brand queries - VIP content, GUEST user (should redirect)
  {
    query: "What's his favorite camera brand?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "photography",
    minExpectedScore: 0.25,
  },

  // Camera brand queries - VIP content, VIP user (should not redirect)
  {
    query: "What's his favorite camera brand?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "photography",
    minExpectedScore: 0.25,
  },

  // Keyboard collection queries - VIP content, GUEST user (should redirect)
  {
    query: "Does he collect keyboards?",
    expectedLevel: "vip",
    userType: null,
    shouldRedirect: true,
    category: "hobbies",
    minExpectedScore: 0.25,
  },

  // Keyboard collection queries - VIP content, VIP user (should not redirect)
  {
    query: "Does he collect keyboards?",
    expectedLevel: "vip",
    userType: "vip",
    shouldRedirect: false,
    category: "hobbies",
    minExpectedScore: 0.25,
  },

  // ============================================================================
  // EDGE CASES - Testing robustness
  // ============================================================================

  // Completely unrelated query
  {
    query: "What's the weather like today?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "edge-case",
    minExpectedScore: 0.1, // Should have low score
  },

  // Vague query
  {
    query: "Tell me about him",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "edge-case",
    minExpectedScore: 0.2,
  },

  // Misspelling
  {
    query: "What technolgies does he use?",
    expectedLevel: "guest",
    userType: null,
    shouldRedirect: false,
    category: "edge-case",
    minExpectedScore: 0.25,
  },
];

// Generate variations test cases
export function generateVariationTests(): TestCase[] {
  const variationTests: TestCase[] = [];

  for (const testCase of TEST_CASES) {
    if (testCase.variations) {
      for (const variation of testCase.variations) {
        variationTests.push({
          ...testCase,
          query: variation,
          variations: undefined, // Don't recurse
        });
      }
    }
  }

  return variationTests;
}
