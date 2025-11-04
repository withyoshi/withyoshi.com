/**
 * Content Chunker
 *
 * Splits markdown files into semantic chunks for RAG
 */

import fs from "node:fs";
import path from "node:path";
import type { ContentChunk } from "./embeddings";

const CONTENT_DIR = path.join(
  process.cwd(),
  "lib",
  "cv",
  "chatbot",
  "internal"
);

// Regex patterns for chunking (defined at top level for performance)
const SECTION_SPLIT_PATTERN = /(?=^##\s)/m;
const HEADER_PATTERN = /^##+\s+(.+)$/m;
const DOUBLE_NEWLINE_PATTERN = /\n\n+/;
const WHITESPACE_PATTERN = /\s+/;

/**
 * Chunk markdown content by sections
 * Splits large sections into smaller chunks for better semantic matching
 */
export function chunkMarkdownFile(
  filePath: string,
  source: "core" | "guest" | "pro" | "vip",
  accessLevel: "guest" | "pro" | "vip"
): ContentChunk[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const chunks: ContentChunk[] = [];

  // Split by markdown headers (##, ###, etc.)
  const sections = content.split(SECTION_SPLIT_PATTERN);

  let chunkIndex = 0;
  for (const section of sections) {
    if (!section.trim()) {
      continue;
    }

    // Extract section title
    const headerMatch = section.match(HEADER_PATTERN);
    const sectionTitle = headerMatch ? headerMatch[1].trim() : undefined;

    // Skip section markers like "GUEST CONTENT START"
    if (
      sectionTitle?.includes("CONTENT START") ||
      sectionTitle?.includes("CONTENT END")
    ) {
      continue;
    }

    // Split large sections into smaller chunks (target ~200-250 words per chunk)
    // Smaller chunks improve semantic matching precision
    const words = section.split(WHITESPACE_PATTERN).length;
    if (words > 300) {
      // Split by double newlines (paragraphs) or bullet points
      const paragraphs = section
        .split(DOUBLE_NEWLINE_PATTERN)
        .filter((p) => p.trim());
      let currentChunk: string[] = [];
      let currentWordCount = 0;
      const targetWords = 250; // Target chunk size (reduced for better matching)

      for (const para of paragraphs) {
        const paraWords = para.split(WHITESPACE_PATTERN).length;

        // If adding this paragraph would exceed target, finalize current chunk
        if (
          currentWordCount + paraWords > targetWords &&
          currentChunk.length > 0
        ) {
          chunks.push({
            id: `${source}-${chunkIndex++}`,
            content: currentChunk.join("\n\n"),
            source,
            section: sectionTitle,
            accessLevel,
            metadata: {
              sourceFile: path.basename(filePath),
              sectionTitle,
            },
          });
          currentChunk = [para];
          currentWordCount = paraWords;
        } else {
          currentChunk.push(para);
          currentWordCount += paraWords;
        }
      }

      // Add remaining chunk
      if (currentChunk.length > 0) {
        chunks.push({
          id: `${source}-${chunkIndex++}`,
          content: currentChunk.join("\n\n"),
          source,
          section: sectionTitle,
          accessLevel,
          metadata: {
            sourceFile: path.basename(filePath),
            sectionTitle,
          },
        });
      }
    } else {
      // Small enough section - create single chunk
      chunks.push({
        id: `${source}-${chunkIndex++}`,
        content: section.trim(),
        source,
        section: sectionTitle,
        accessLevel,
        metadata: {
          sourceFile: path.basename(filePath),
          sectionTitle,
        },
      });
    }
  }

  return chunks;
}

/**
 * Load all content chunks
 */
export function loadAllChunks(): ContentChunk[] {
  const chunks: ContentChunk[] = [];

  // NOTE: core.md and core-rag.md are system prompts, NOT content to embed
  // They contain instructions for the LLM, not facts about Yan Sern
  // Only embed the actual content files: guest, pro, vip

  // Guest content
  const guestPath = path.join(CONTENT_DIR, "guest.md");
  if (fs.existsSync(guestPath)) {
    chunks.push(...chunkMarkdownFile(guestPath, "guest", "guest"));
  }

  // PRO content (requires PRO access)
  const proPath = path.join(CONTENT_DIR, "pro.md");
  if (fs.existsSync(proPath)) {
    chunks.push(...chunkMarkdownFile(proPath, "pro", "pro"));
  }

  // VIP content (requires VIP access)
  const vipPath = path.join(CONTENT_DIR, "vip.md");
  if (fs.existsSync(vipPath)) {
    chunks.push(...chunkMarkdownFile(vipPath, "vip", "vip"));
  }

  return chunks;
}
