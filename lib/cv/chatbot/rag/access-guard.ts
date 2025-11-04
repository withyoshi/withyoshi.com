/**
 * Access Guard for RAG
 *
 * Handles the logic of:
 * 1. Determining what access level a question requires
 * 2. Checking if the user has that access level
 * 3. Deciding whether to retrieve content or redirect
 */

import type { ConversationState } from "../state";

export type AccessRequirement = {
  requiredLevel: "guest" | "pro" | "vip";
  shouldRedirect: boolean;
  redirectReason?: "pro" | "vip";
  // Indicates if higher-level content exists for this topic
  hasHigherLevelContent?: {
    pro?: boolean;
    vip?: boolean;
  };
};

/**
 * Determine what access level a question requires
 *
 * Strategy: Use the LOWEST access level that has relevant content with a good score
 * Since we've removed "Common Questions" sections and eliminated content duplication,
 * we can rely on clean score-based detection with higher thresholds.
 *
 * Logic:
 * 1. Check if GUEST chunks exist with good scores (>= 0.65)
 * 2. If yes, use GUEST (lowest tier)
 * 3. If no GUEST chunks with good scores, check PRO chunks
 * 4. If no PRO chunks with good scores, use VIP
 * 5. Only redirect if user lacks access to the required level
 * 6. Fallback to lower threshold (0.45) for edge cases
 */
export function determineAccessRequirement(
  topChunks: Array<{
    source: string;
    accessLevel: string;
    score: number;
    section?: string;
  }>,
  conversationState: ConversationState
): AccessRequirement {
  const userType = conversationState.userType;
  const userAccessLevel: "guest" | "pro" | "vip" =
    userType === "vip" ? "vip" : userType === "pro" ? "pro" : "guest";

  // If no chunks found, default to guest
  if (topChunks.length === 0) {
    return {
      requiredLevel: "guest",
      shouldRedirect: false,
    };
  }

  // Separate chunks by access level
  const guestChunks = topChunks.filter((c) => c.accessLevel === "guest");
  const proChunks = topChunks.filter((c) => c.accessLevel === "pro");
  const vipChunks = topChunks.filter((c) => c.accessLevel === "vip");

  // Find the highest scoring chunk for each level
  const topGuestScore =
    guestChunks.length > 0 ? Math.max(...guestChunks.map((c) => c.score)) : 0;
  const topProScore =
    proChunks.length > 0 ? Math.max(...proChunks.map((c) => c.score)) : 0;
  const topVipScore =
    vipChunks.length > 0 ? Math.max(...vipChunks.map((c) => c.score)) : 0;

  // Use the LOWEST access level that has a good score (>= 0.35)
  // Adjusted for realistic embedding scores (typically 0.3-0.4 range)
  // If scores are close (within 0.10), prefer the lower access level
  // Increased threshold to be more aggressive about preferring GUEST
  const GOOD_MATCH_THRESHOLD = 0.35;
  const SCORE_TIE_THRESHOLD = 0.1; // If scores are within this, prefer lower level (increased for better access control)

  // Check if GUEST meets threshold, and if scores are close, prefer GUEST
  // BUT: If PRO also meets threshold and scores are close, prefer PRO for PRO-specific queries
  if (topGuestScore >= GOOD_MATCH_THRESHOLD) {
    // If PRO meets threshold and scores are close, check if PRO should be preferred
    const proAlsoMeetsThreshold = topProScore >= GOOD_MATCH_THRESHOLD;
    const proClose =
      proAlsoMeetsThreshold &&
      topGuestScore - topProScore <= SCORE_TIE_THRESHOLD;

    // If PRO meets threshold and scores are very close (within 0.05), prefer PRO
    // This ensures PRO content wins for PRO-specific queries even if GUEST scores slightly higher
    if (proAlsoMeetsThreshold && topGuestScore - topProScore <= 0.05) {
      const hasAccess = userAccessLevel === "pro" || userAccessLevel === "vip";
      if (!hasAccess) {
        return {
          requiredLevel: "pro",
          shouldRedirect: true,
          redirectReason: "pro",
        };
      }
      return {
        requiredLevel: "pro",
        shouldRedirect: false,
        hasHigherLevelContent: {
          vip: vipChunks.length > 0 && topVipScore >= 0.3,
        },
      };
    }

    // If PRO or VIP score higher but within tie threshold, still prefer GUEST
    const vipClose =
      topVipScore >= GOOD_MATCH_THRESHOLD &&
      topVipScore - topGuestScore <= SCORE_TIE_THRESHOLD;

    // Prefer GUEST if it meets threshold, unless PRO/VIP score significantly higher
    if (!(proClose || vipClose)) {
      return {
        requiredLevel: "guest",
        shouldRedirect: false,
        hasHigherLevelContent: {
          pro: proChunks.length > 0 && topProScore >= 0.3,
          vip: vipChunks.length > 0 && topVipScore >= 0.3,
        },
      };
    }
    // Even if PRO/VIP are close, if GUEST meets threshold and significantly higher, prefer GUEST
    return {
      requiredLevel: "guest",
      shouldRedirect: false,
      hasHigherLevelContent: {
        pro: proChunks.length > 0 && topProScore >= 0.3,
        vip: vipChunks.length > 0 && topVipScore >= 0.3,
      },
    };
  }

  // Check PRO level
  if (topProScore >= GOOD_MATCH_THRESHOLD) {
    // If VIP scores higher but within tie threshold, still prefer PRO
    const vipClose =
      topVipScore >= GOOD_MATCH_THRESHOLD &&
      topVipScore - topProScore <= SCORE_TIE_THRESHOLD;

    // Prefer PRO if it meets threshold, unless VIP scores significantly higher
    if (!vipClose) {
      const hasAccess = userAccessLevel === "pro" || userAccessLevel === "vip";
      if (!hasAccess) {
        return {
          requiredLevel: "pro",
          shouldRedirect: true,
          redirectReason: "pro",
        };
      }
      return {
        requiredLevel: "pro",
        shouldRedirect: false,
        hasHigherLevelContent: {
          vip: vipChunks.length > 0 && topVipScore >= 0.3,
        },
      };
    }
    // Even if VIP is close, if PRO meets threshold and user has PRO access, prefer PRO
    // This ensures PRO content is preferred when it's a good match
    if (userAccessLevel === "pro" || userAccessLevel === "vip") {
      return {
        requiredLevel: "pro",
        shouldRedirect: false,
        hasHigherLevelContent: {
          vip: vipChunks.length > 0 && topVipScore >= 0.3,
        },
      };
    }
    // GUEST user - redirect to PRO
    return {
      requiredLevel: "pro",
      shouldRedirect: true,
      redirectReason: "pro",
    };
  }

  // Check VIP level
  if (topVipScore >= GOOD_MATCH_THRESHOLD) {
    const hasAccess = userAccessLevel === "vip";
    if (!hasAccess) {
      return {
        requiredLevel: "vip",
        shouldRedirect: true,
        redirectReason: "vip",
      };
    }
    return {
      requiredLevel: "vip",
      shouldRedirect: false,
    };
  }

  // Fallback: All scores are low - use the highest scoring level
  // Lower threshold for edge cases (0.25)
  const FALLBACK_THRESHOLD = 0.25;
  const maxScore = Math.max(topVipScore, topProScore, topGuestScore);

  if (maxScore < FALLBACK_THRESHOLD) {
    // Very low scores - question might not be answerable
    return {
      requiredLevel: "guest",
      shouldRedirect: false,
    };
  }

  // Use highest scoring level
  if (topVipScore === maxScore && vipChunks.length > 0) {
    const hasAccess = userAccessLevel === "vip";
    if (!hasAccess) {
      return {
        requiredLevel: "vip",
        shouldRedirect: true,
        redirectReason: "vip",
      };
    }
    return {
      requiredLevel: "vip",
      shouldRedirect: false,
    };
  }

  if (topProScore === maxScore && proChunks.length > 0) {
    const hasAccess = userAccessLevel === "pro" || userAccessLevel === "vip";
    if (!hasAccess) {
      return {
        requiredLevel: "pro",
        shouldRedirect: true,
        redirectReason: "pro",
      };
    }
    return {
      requiredLevel: "pro",
      shouldRedirect: false,
      hasHigherLevelContent: {
        vip: vipChunks.length > 0 && topVipScore >= 0.25,
      },
    };
  }

  // GUEST is highest or fallback
  return {
    requiredLevel: "guest",
    shouldRedirect: false,
    hasHigherLevelContent: {
      pro: proChunks.length > 0 && topProScore >= 0.25,
      vip: vipChunks.length > 0 && topVipScore >= 0.25,
    },
  };
}
