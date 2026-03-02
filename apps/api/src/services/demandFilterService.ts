/**
 * Demand filter service for the Buzzy Today API.
 * Implements the 3-tier priority system for article publication:
 *   Tier 1: Articles matching followed tags (highest priority)
 *   Tier 2: Articles matching buzzwords
 *   Tier 3: Quota fill (remaining slots, lowest priority)
 *
 * Also handles random injection for serendipity content.
 *
 * @module @buzzy/api/services/demandFilterService
 */

import { logger } from '../logger.js';

/** Article candidate for the demand filter */
export interface DemandCandidate {
  id: string;
  topicTagIds: string[];
  categoryTagId: string;
  matchesBuzzword: boolean;
  rankingScore: number;
}

/** Result of demand filtering */
export interface DemandFilterResult {
  /** Articles that passed the filter */
  accepted: DemandCandidate[];
  /** Articles rejected by the filter */
  rejected: DemandCandidate[];
  /** Breakdown of accepted articles by tier */
  tierBreakdown: {
    followedTag: number;
    buzzword: number;
    quotaFill: number;
    randomInjection: number;
  };
}

/**
 * Applies the full 3-tier demand filter to a batch of candidate articles.
 *
 * @param candidates - Articles to filter
 * @param followedTagIds - Set of tag IDs followed by any user (demand signal)
 * @param remainingQuota - How many more articles can be published for this category
 * @param randomInjectionSlots - How many slots are reserved for serendipity
 * @returns DemandFilterResult with accepted/rejected split
 */
export function applyDemandFilter(
  candidates: DemandCandidate[],
  followedTagIds: Set<string>,
  remainingQuota: number,
  randomInjectionSlots: number = 0,
): DemandFilterResult {
  const accepted: DemandCandidate[] = [];
  const rejected: DemandCandidate[] = [];
  let tier1Count = 0;
  let tier2Count = 0;
  let tier3Count = 0;
  let randomCount = 0;

  // Sort candidates by ranking score descending for priority
  const sorted = [...candidates].sort((a, b) => b.rankingScore - a.rankingScore);

  // Reserve random injection slots
  const standardSlots = remainingQuota - randomInjectionSlots;

  for (const candidate of sorted) {
    if (accepted.length >= remainingQuota) {
      rejected.push(candidate);
      continue;
    }

    // Tier 1: Matches a followed tag
    const matchesFollowed = candidate.topicTagIds.some((id) => followedTagIds.has(id));
    if (matchesFollowed && accepted.length < standardSlots) {
      accepted.push(candidate);
      tier1Count++;
      continue;
    }

    // Tier 2: Matches a buzzword
    if (candidate.matchesBuzzword && accepted.length < standardSlots) {
      accepted.push(candidate);
      tier2Count++;
      continue;
    }

    // Tier 3: Quota fill (has at least 1 approved tag — Phase 1 requirement)
    if (candidate.topicTagIds.length > 0 && accepted.length < standardSlots) {
      accepted.push(candidate);
      tier3Count++;
      continue;
    }

    // Random injection slot
    if (randomInjectionSlots > 0 && randomCount < randomInjectionSlots) {
      accepted.push(candidate);
      randomCount++;
      continue;
    }

    rejected.push(candidate);
  }

  logger.info('Demand filter applied', {
    total: candidates.length,
    accepted: accepted.length,
    rejected: rejected.length,
    tier1: tier1Count,
    tier2: tier2Count,
    tier3: tier3Count,
    random: randomCount,
  });

  return {
    accepted,
    rejected,
    tierBreakdown: {
      followedTag: tier1Count,
      buzzword: tier2Count,
      quotaFill: tier3Count,
      randomInjection: randomCount,
    },
  };
}

/**
 * Checks promotion eligibility for an article.
 * Articles are promoted from 'candidate' to 'permanent' when they reach
 * the engagement threshold (10 points).
 *
 * @param engagementPoints - Current engagement point total
 * @param promotionThreshold - Points needed for promotion (default 10)
 * @returns Whether the article should be promoted
 */
export function shouldPromote(
  engagementPoints: number,
  promotionThreshold: number = 10,
): boolean {
  return engagementPoints >= promotionThreshold;
}
