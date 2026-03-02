/**
 * Ranking service for the Buzzy Today API.
 * Implements the personalized feed ranking algorithm:
 *   Final Score = Article Score × User Topic Match × Freshness
 *
 * @module @buzzy/api/services/rankingService
 */

import { logger } from '../logger.js';

/** User interest graph entry */
export interface InterestEntry {
  tagId: string;
  score: number;
  lastInteraction: string;
}

/** Article data needed for ranking */
export interface RankableArticle {
  id: string;
  rankingScore: number;
  topicTagIds: string[];
  categoryTagId: string;
  publishedAt: string;
  status: 'candidate' | 'permanent';
}

/** Ranked article with computed score */
export interface RankedArticle extends RankableArticle {
  personalizedScore: number;
}

/** Freshness decay configuration */
const FRESHNESS_HALF_LIFE_HOURS = 24;

/**
 * Calculates the freshness multiplier for an article.
 * Uses exponential decay with a 24-hour half-life.
 *
 * @param publishedAt - ISO timestamp of article publication
 * @param now - Current time (defaults to now)
 * @returns Freshness multiplier between 0 and 1
 */
export function calculateFreshness(publishedAt: string, now?: Date): number {
  const pubDate = new Date(publishedAt);
  const currentDate = now ?? new Date();
  const hoursAgo = (currentDate.getTime() - pubDate.getTime()) / (1000 * 60 * 60);

  if (hoursAgo < 0) return 1; // Future dates get full freshness

  // Exponential decay: e^(-λt) where λ = ln(2) / half_life
  const lambda = Math.LN2 / FRESHNESS_HALF_LIFE_HOURS;
  return Math.exp(-lambda * hoursAgo);
}

/**
 * Calculates the user topic match score for an article.
 * Sum of interest scores for matching topic tags + category.
 *
 * @param article - The article to score
 * @param interestGraph - The user's interest graph entries
 * @returns Topic match score (0 if no matches, higher = better match)
 */
export function calculateTopicMatch(
  article: RankableArticle,
  interestGraph: InterestEntry[],
): number {
  if (interestGraph.length === 0) return 1; // No personalization data → neutral

  const interestMap = new Map(interestGraph.map((e) => [e.tagId, e.score]));
  let matchScore = 0;

  // Score from topic tags
  for (const tagId of article.topicTagIds) {
    const tagScore = interestMap.get(tagId);
    if (tagScore !== undefined) {
      matchScore += tagScore;
    }
  }

  // Score from category (half weight)
  const categoryScore = interestMap.get(`cat:${article.categoryTagId}`);
  if (categoryScore !== undefined) {
    matchScore += categoryScore * 0.5;
  }

  // Normalize: return at least 0.1 to avoid zeroing out articles
  return Math.max(0.1, matchScore);
}

/**
 * Ranks a list of articles using the personalization algorithm.
 * Final Score = Article Score × User Topic Match × Freshness
 *
 * @param articles - Articles to rank
 * @param interestGraph - User's interest graph (empty for non-personalized)
 * @param now - Current time for freshness calculation
 * @returns Articles sorted by personalized score (descending)
 */
export function rankArticles(
  articles: RankableArticle[],
  interestGraph: InterestEntry[],
  now?: Date,
): RankedArticle[] {
  const ranked = articles.map((article) => {
    const freshness = calculateFreshness(article.publishedAt, now);
    const topicMatch = calculateTopicMatch(article, interestGraph);
    const personalizedScore = article.rankingScore * topicMatch * freshness;

    return {
      ...article,
      personalizedScore,
    };
  });

  // Sort by personalized score descending
  ranked.sort((a, b) => b.personalizedScore - a.personalizedScore);

  logger.debug('Ranked articles', {
    count: ranked.length,
    hasPersonalization: interestGraph.length > 0,
    topScore: ranked[0]?.personalizedScore ?? 0,
  });

  return ranked;
}
