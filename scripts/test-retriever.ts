#!/usr/bin/env tsx

/**
 * Comprehensive RAG Retriever Test Suite
 *
 * Tests:
 * - Access level classification accuracy
 * - Redirect behavior for different user types
 * - Retrieval quality (scores, chunk relevance)
 * - Question variations
 * - Edge cases
 *
 * Usage:
 *   npx tsx scripts/test-retriever.ts              # Run all tests
 *   npx tsx scripts/test-retriever.ts --quick      # Skip variations
 *   npx tsx scripts/test-retriever.ts --verbose    # Show detailed output
 *   npx tsx scripts/test-retriever.ts --category=location  # Test specific category
 */

import { config } from "dotenv";

config({ path: ".env.local" });

import { retrieveRelevantChunks } from "../lib/cv/chatbot/rag/retriever";
import { NeonPostgresVectorStore } from "../lib/cv/chatbot/rag/vercel-postgres-store";
import type { ConversationState } from "../lib/cv/chatbot/state";
import {
  generateVariationTests,
  TEST_CASES,
  type TestCase,
} from "./test-cases";

// Parse command line arguments
const args = process.argv.slice(2);
const flags = {
  quick: args.includes("--quick"),
  verbose: args.includes("--verbose"),
  category: args.find((arg) => arg.startsWith("--category="))?.split("=")[1],
  help: args.includes("--help") || args.includes("-h"),
};

if (flags.help) {
  console.log(`
RAG Retriever Test Suite

Usage:
  npx tsx scripts/test-retriever.ts [options]

Options:
  --quick              Skip variation tests (faster)
  --verbose            Show detailed output for each test
  --category=<name>    Test only specific category
  --help, -h           Show this help message

Examples:
  npx tsx scripts/test-retriever.ts
  npx tsx scripts/test-retriever.ts --quick --verbose
  npx tsx scripts/test-retriever.ts --category=location
`);
  process.exit(0);
}

interface TestResult {
  testCase: TestCase;
  passed: boolean;
  result: Awaited<ReturnType<typeof retrieveRelevantChunks>>;
  issues: string[];
  score?: number;
  duration: number;
}

interface TestReport {
  totalTests: number;
  passed: number;
  failed: number;
  categories: Record<string, { passed: number; failed: number }>;
  qualityIssues: string[];
  failedTests: TestResult[];
  averageScore: number;
  averageDuration: number;
}

async function runTest(
  testCase: TestCase,
  vectorStore: NeonPostgresVectorStore
): Promise<TestResult> {
  const startTime = Date.now();
  const issues: string[] = [];

  const conversationState: ConversationState = {
    userName: "",
    userIntro: "",
    contact: "",
    userType: testCase.userType,
  };

  try {
    const result = await retrieveRelevantChunks(
      testCase.query,
      conversationState,
      vectorStore,
      {
        topK: 5,
        minScore: 0.3, // Realistic threshold for current embedding scores
      }
    );

    const duration = Date.now() - startTime;

    // Check 1: Redirect behavior
    const redirectMatch = result.shouldRedirect === testCase.shouldRedirect;
    if (!redirectMatch) {
      issues.push(
        `Redirect mismatch: expected ${testCase.shouldRedirect}, got ${result.shouldRedirect}`
      );
    }

    // Check 2: Access level
    const levelMatch = result.requiredAccessLevel === testCase.expectedLevel;
    if (!levelMatch) {
      issues.push(
        `Access level mismatch: expected ${testCase.expectedLevel}, got ${result.requiredAccessLevel}`
      );
    }

    // Check 3: Score quality (if not redirecting)
    const topScore = result.chunks.length > 0 ? result.chunks[0].score : 0;
    if (
      !result.shouldRedirect &&
      testCase.minExpectedScore &&
      topScore < testCase.minExpectedScore
    ) {
      issues.push(
        `Low score: ${topScore.toFixed(3)} < ${testCase.minExpectedScore} (quality issue)`
      );
    }

    // Check 4: Got chunks when not redirecting
    if (!result.shouldRedirect && result.chunks.length === 0) {
      issues.push("No chunks retrieved (expected some)");
    }

    const passed = issues.length === 0;

    return {
      testCase,
      passed,
      result,
      issues,
      score: topScore,
      duration,
    };
  } catch (error) {
    return {
      testCase,
      passed: false,
      result: {
        chunks: [],
        shouldRedirect: false,
        requiredAccessLevel: "guest",
      },
      issues: [`Error: ${error}`],
      duration: Date.now() - startTime,
    };
  }
}

function printTestResult(result: TestResult, verbose: boolean) {
  const icon = result.passed ? "✅" : "❌";
  const userLabel = result.testCase.userType || "GUEST";

  console.log(
    `${icon} [${result.testCase.category}] "${result.testCase.query}" (${userLabel})`
  );

  if (verbose || !result.passed) {
    console.log(
      `   Expected: ${result.testCase.expectedLevel.toUpperCase()}, Redirect: ${result.testCase.shouldRedirect}`
    );
    console.log(
      `   Got: ${result.result.requiredAccessLevel?.toUpperCase()}, Redirect: ${result.result.shouldRedirect}`
    );

    if (result.score !== undefined) {
      const scoreColor =
        result.score >= 0.7 ? "🟢" : result.score >= 0.5 ? "🟡" : "🔴";
      console.log(
        `   Score: ${scoreColor} ${result.score.toFixed(3)} (${result.result.chunks.length} chunks, ${result.duration}ms)`
      );
    }

    if (!result.passed && result.issues.length > 0) {
      for (const issue of result.issues) {
        console.log(`   ⚠️  ${issue}`);
      }
    }

    if (verbose && result.result.chunks.length > 0) {
      console.log("   Top chunks:");
      for (const chunk of result.result.chunks.slice(0, 3)) {
        console.log(
          `     - ${chunk.accessLevel}: ${chunk.score.toFixed(3)} (${chunk.section || "N/A"})`
        );
      }
    }
  }

  console.log();
}

function generateReport(results: TestResult[]): TestReport {
  const report: TestReport = {
    totalTests: results.length,
    passed: 0,
    failed: 0,
    categories: {},
    qualityIssues: [],
    failedTests: [],
    averageScore: 0,
    averageDuration: 0,
  };

  let totalScore = 0;
  let totalDuration = 0;
  let scoreCount = 0;

  for (const result of results) {
    if (result.passed) {
      report.passed++;
    } else {
      report.failed++;
      report.failedTests.push(result);
    }

    // Track by category
    const category = result.testCase.category;
    if (!report.categories[category]) {
      report.categories[category] = { passed: 0, failed: 0 };
    }
    if (result.passed) {
      report.categories[category].passed++;
    } else {
      report.categories[category].failed++;
    }

    // Collect quality issues
    for (const issue of result.issues) {
      if (issue.includes("quality issue")) {
        report.qualityIssues.push(`${result.testCase.query}: ${issue}`);
      }
    }

    // Track scores and duration
    if (result.score !== undefined) {
      totalScore += result.score;
      scoreCount++;
    }
    totalDuration += result.duration;
  }

  report.averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
  report.averageDuration = totalDuration / results.length;

  return report;
}

function printReport(report: TestReport) {
  console.log(`\n${"=".repeat(70)}`);
  console.log("📊 TEST REPORT");
  console.log(`${"=".repeat(70)}\n`);

  // Overall results
  const passRate = ((report.passed / report.totalTests) * 100).toFixed(1);
  const passIcon =
    report.failed === 0 ? "🎉" : report.passed > report.failed ? "⚠️" : "❌";

  console.log(
    `${passIcon} Overall: ${report.passed}/${report.totalTests} passed (${passRate}%)`
  );
  console.log(`   Average score: ${report.averageScore.toFixed(3)}`);
  console.log(`   Average duration: ${report.averageDuration.toFixed(0)}ms`);
  console.log();

  // Category breakdown
  console.log("📁 By Category:");
  const sortedCategories = Object.entries(report.categories).sort(
    (a, b) => b[1].passed + b[1].failed - (a[1].passed + a[1].failed)
  );

  for (const [category, stats] of sortedCategories) {
    const total = stats.passed + stats.failed;
    const rate = ((stats.passed / total) * 100).toFixed(0);
    const icon = stats.failed === 0 ? "✅" : "⚠️";
    console.log(
      `   ${icon} ${category.padEnd(15)} ${stats.passed}/${total} (${rate}%)`
    );
  }
  console.log();

  // Quality issues
  if (report.qualityIssues.length > 0) {
    console.log("⚠️  Quality Issues:");
    for (const issue of report.qualityIssues.slice(0, 10)) {
      console.log(`   - ${issue}`);
    }
    if (report.qualityIssues.length > 10) {
      console.log(`   ... and ${report.qualityIssues.length - 10} more`);
    }
    console.log();
  }

  // Failed tests
  if (report.failedTests.length > 0) {
    console.log(`❌ Failed Tests (${report.failedTests.length}):`);
    for (const result of report.failedTests.slice(0, 10)) {
      const userLabel = result.testCase.userType || "GUEST";
      console.log(
        `   - [${result.testCase.category}] "${result.testCase.query}" (${userLabel})`
      );
      for (const issue of result.issues) {
        console.log(`     ⚠️  ${issue}`);
      }
    }
    if (report.failedTests.length > 10) {
      console.log(`   ... and ${report.failedTests.length - 10} more`);
    }
    console.log();
  }

  console.log(`${"=".repeat(70)}\n`);
}

async function runTests() {
  console.log("🧪 RAG Retriever Test Suite\n");

  // Validate environment
  if (!process.env.POSTGRES_URL) {
    console.error("❌ POSTGRES_URL not found in .env.local");
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not found in .env.local");
    process.exit(1);
  }

  const vectorStore = new NeonPostgresVectorStore();

  // Prepare test cases
  let testCases = [...TEST_CASES];

  // Add variations if not quick mode
  if (flags.quick) {
    console.log(
      `📝 Running ${testCases.length} tests (quick mode - no variations)\n`
    );
  } else {
    const variations = generateVariationTests();
    testCases = [...testCases, ...variations];
    console.log(
      `📝 Running ${testCases.length} tests (including ${variations.length} variations)\n`
    );
  }

  // Filter by category if specified
  if (flags.category) {
    testCases = testCases.filter((tc) => tc.category === flags.category);
    console.log(
      `🔍 Filtered to category: ${flags.category} (${testCases.length} tests)\n`
    );
  }

  // Run tests
  const results: TestResult[] = [];
  let currentCategory = "";

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];

    // Print category header
    if (testCase.category !== currentCategory) {
      currentCategory = testCase.category;
      console.log(`\n--- ${currentCategory.toUpperCase()} ---\n`);
    }

    const result = await runTest(testCase, vectorStore);
    results.push(result);
    printTestResult(result, flags.verbose);

    // Show progress
    if (!flags.verbose && (i + 1) % 10 === 0) {
      const progress = Math.round(((i + 1) / testCases.length) * 100);
      console.log(`⏳ Progress: ${i + 1}/${testCases.length} (${progress}%)\n`);
    }
  }

  // Generate and print report
  const report = generateReport(results);
  printReport(report);

  // Exit with appropriate code
  if (report.failed > 0) {
    console.log("❌ Tests failed - see report above for details\n");
    process.exit(1);
  } else {
    console.log("🎉 All tests passed!\n");
    process.exit(0);
  }
}

runTests().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
